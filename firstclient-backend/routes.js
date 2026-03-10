const express = require("express");
const router = express.Router();
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const { Resend } = require("resend");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const Product = require("./models");
const Message = require("./Message"); 
const CMS = require("./cms"); 
const { CartItem } = require("./cart");
const Order = require("./order");
const Admin = require("./Admin"); 

const sanitizeInput = (data) => {
  if (typeof data === 'string') return DOMPurify.sanitize(data);
  if (typeof data === 'object' && data !== null) {
    for (let key in data) {
      data[key] = sanitizeInput(data[key]);
    }
  }
  return data;
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true 
});

const resend = new Resend(process.env.RESEND_API_KEY);
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_12345";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    if (isVideo) {
      return {
        folder: "shop_products",
        resource_type: "video",
        format: "mp4",
        transformation: [
          { width: 720, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      };
    }
    return {
      folder: "shop_products",
      resource_type: "image",
      transformation: [
        { width: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    };
  },
});

const upload = multer({ storage: storage });

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") return res.status(401).json({ message: "Session expired.", expired: true });
        return res.status(401).json({ message: "Unauthorized access" });
      }
      req.adminId = decoded.id;
      next();
    });
  } catch (err) { res.status(500).json({ message: "Internal Auth Error" }); }
};

// --- AUTH & WEBHOOKS ---
router.post("/paystack/webhook", async (req, res) => {
  try {
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(JSON.stringify(req.body)).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) return res.sendStatus(400); 
    if (req.body.event === 'charge.success') {
      const reference = req.body.data.reference;
      console.log(`💰 Payment Verified: ${reference}`);
    }
    res.sendStatus(200);
  } catch (err) { res.sendStatus(500); }
});

router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = sanitizeInput(req.body);
    const admin = await Admin.findOne({ where: { username: username || process.env.ADMIN_USERNAME } });
    if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (isMatch) {
      const token = jwt.sign({ id: admin.username }, JWT_SECRET, { expiresIn: "6h" });
      return res.json({ success: true, token });
    }
    res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err) { res.status(500).json({ success: false }); }
});

// --- PRODUCT MANAGEMENT ---
router.get("/products", async (req, res) => {
  try {
    const { category } = req.query; 
    let whereClause = {};
    if (category) whereClause.category = category;
    const products = await Product.findAll({ 
      where: whereClause,
      order: [['createdAt', 'DESC']] 
    });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/admin/products", verifyToken, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files;
    const imageUrl = files.image ? (files.image[0].path || files.image[0].secure_url) : null;
    const videoUrl = files.video ? (files.video[0].path || files.video[0].secure_url) : null;
    const product = await Product.create({
      name: sanitizeInput(req.body.name),
      price: parseFloat(req.body.price) || 0,
      image: imageUrl,
      videoUrl: videoUrl,
      category: req.body.category || 'general',
      subCategory: req.body.subCategory, 
      rating: { stars: 0, count: 0 }
    });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/admin/products/:id", verifyToken, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const files = req.files;
    if (files.image) product.image = files.image[0].path || files.image[0].secure_url;
    if (files.video) product.videoUrl = files.video[0].path || files.video[0].secure_url;
    product.name = sanitizeInput(req.body.name) || product.name;
    product.price = parseFloat(req.body.price) || product.price;
    product.category = req.body.category || product.category;
    product.subCategory = req.body.subCategory || product.subCategory;
    await product.save();
    res.json({ success: true, updatedProduct: product });
  } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

router.delete("/admin/products/:id", verifyToken, async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: "Archived" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- MESSAGES & CONTACT ---
router.post("/contact", async (req, res) => {
  try {
    const { name, phone, message } = sanitizeInput(req.body);
    await Message.create({ name, phone, message });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/admin/messages", verifyToken, async (req, res) => {
  try {
    const messages = await Message.findAll({ order: [['createdAt', 'DESC']] });
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/admin/messages/:id", verifyToken, async (req, res) => {
  try {
    await Message.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: "Archived" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CART & ORDERS ---
router.get("/cart", async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({ include: [{ model: Product, as: "product" }] });
    res.json(cartItems.filter(item => item.product !== null));
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post("/cart/remove", async (req, res) => {
  const { productId } = req.body;
  await CartItem.destroy({ where: { productId } }); 
  const updatedCart = await CartItem.findAll({ include: [{ model: Product, as: "product" }] });
  res.json(updatedCart); 
});
router.post("/cart/add", async (req, res) => {
  try {
    const { productId, quantity, overrideQuantity } = req.body;
    let item = await CartItem.findOne({ where: { productId } });
    if (item) { 
      item.quantity = overrideQuantity !== undefined ? parseInt(overrideQuantity) : item.quantity + parseInt(quantity); 
      await item.save(); 
    } else { item = await CartItem.create({ productId, quantity: overrideQuantity || quantity }); }
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.delete("/cart/clear", async (req, res) => {
  try { await CartItem.destroy({ where: {} }); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/paystack/init", async (req, res) => {
  try {
    const { email, amount, customerDetails } = req.body;
    const response = await axios.post("https://api.paystack.co/transaction/initialize",
      { email, amount: Math.round(amount * 100), callback_url: `${req.headers.origin}/success`, metadata: { customer_details: sanitizeInput(customerDetails) } },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );
    res.json(response.data);
  } catch (err) { res.status(500).json({ error: "Paystack Init Failed" }); }
});

// ⭐ INTEGRATED: VERIFICATION LOGIC WITH ALL MISSING INFO ADDED
router.post("/orders/verify", async (req, res) => {
  try {
    const { reference, customerDetails } = req.body;
    
    const existingOrder = await Order.findOne({ where: { reference } });
    if (existingOrder) {
      return res.json({ success: true, alreadyProcessed: true });
    }

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });

    if (response.data.data.status === "success") {
      const paymentDate = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });

      await Order.create({
         reference: reference,
         customerName: customerDetails.name,
         customerEmail: customerDetails.email,
         amount: customerDetails.totalAmount,
         shippingFee: customerDetails.shippingFee || 0,
         address: customerDetails.address,
         city: customerDetails.city,
         phone: customerDetails.phone,
         selectedDate: customerDetails.selectedDate,
         items: JSON.stringify(customerDetails.items),
         status: "Pending" 
      });

      await CartItem.destroy({ where: {} });

      if (process.env.RESEND_API_KEY && customerDetails.email) {
        const itemsHtml = customerDetails.items.map(item => {
          const p = item.product || item;
          return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #edf2f7; color: #4a5568;">${p.name}</td>
              <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: center;">${item.quantity}</td>
              <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold;">₦${Number(p.price).toLocaleString()}</td>
            </tr>
          `;
        }).join('');

        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #fff;">
            <div style="background: #1c1c1c; color: white; padding: 25px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">ESSENCE CREATIONS</h1>
              <p style="margin: 5px 0 0 0; color: #28a745; font-weight: bold;">PAYMENT RECEIPT</p>
              <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.7;">Ref: #${reference}</p>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px;">Hello <strong>${customerDetails.name}</strong>,</p>
              <p>Your order has been confirmed! Payment was received on <strong>${paymentDate}</strong>.</p>
              
              <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
                <h4 style="margin: 0 0 10px 0; color: #1c1c1c; text-transform: uppercase; font-size: 13px;">Delivery Details</h4>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Address:</strong> ${customerDetails.address}, ${customerDetails.city}</p>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Location Area:</strong> ${customerDetails.location}</p>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Target Date:</strong> ${customerDetails.selectedDate}</p>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Phone:</strong> ${customerDetails.phone}</p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                  <tr style="background: #f7fafc;">
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 13px;">Product</th>
                    <th style="text-align: center; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 13px;">Qty</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 13px;">Price</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
              </table>

              <div style="margin-top: 25px; text-align: right; border-top: 2px solid #1c1c1c; padding-top: 20px;">
                <p style="margin: 0; color: #718096; font-size: 14px;">Subtotal: ₦${Number(customerDetails.itemsTotal).toLocaleString()}</p>
                <p style="margin: 5px 0; color: #718096; font-size: 14px;">Shipping (${customerDetails.location}): ₦${Number(customerDetails.shippingFee).toLocaleString()}</p>
                <h2 style="margin: 10px 0 0 0; color: #1c1c1c; font-size: 22px;">Total Paid: ₦${Number(customerDetails.totalAmount).toLocaleString()}</h2>
              </div>
            </div>
            <div style="background: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0;">
              Thank you for choosing Essence Creations. If you have any questions, please contact our support.
            </div>
          </div>
        `;

        await resend.emails.send({
          from: 'Essence Creations <onboarding@resend.dev>',
          to: customerDetails.email,
          subject: `Your Essence Creations Receipt [#${reference}]`,
          html: emailHtml
        });
      }
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- REMAINING ROUTES ---
router.get("/orders/receipt/:reference", async (req, res) => {
  try {
    const order = await Order.findOne({ where: { reference: req.params.reference } });
    if (!order) return res.status(404).json({ message: "Order not found" });
    const sanitized = order.toJSON();
    sanitized.items = typeof sanitized.items === 'string' ? JSON.parse(sanitized.items) : sanitized.items;
    res.json(sanitized);
  } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

router.get("/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/admin/orders/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    order.status = status;
    await order.save();
    res.json({ success: true, message: "Status updated" });
  } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

router.delete("/admin/orders/:id", verifyToken, async (req, res) => {
  try {
    await Order.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: "Order deleted" });
  } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

router.delete("/admin/orders/all/bulk", verifyToken, async (req, res) => {
  try {
    await Order.destroy({ where: {}, truncate: true });
    res.json({ success: true, message: "All orders cleared" });
  } catch (err) { res.status(500).json({ error: "Bulk delete failed" }); }
});

router.post("/cms/update", verifyToken, async (req, res) => {
  try {
    const { page_name, data } = req.body;
    const [page, created] = await CMS.findOrCreate({ 
      where: { page_name }, 
      defaults: { title: sanitizeInput(data.title), description: sanitizeInput(data.description), image: data.image, content: data } 
    });
    if (!created) {
      page.title = sanitizeInput(data.title); page.description = sanitizeInput(data.description);
      page.image = data.image; page.content = data; await page.save();
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/cms/:page", async (req, res) => {
  try {
    const page = await CMS.findOne({ where: { page_name: req.params.page } });
    res.json(page ? { title: page.title, description: page.description, image: page.image, ...page.content } : {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/admin/archive/products", verifyToken, async (req, res) => {
  try {
    const archived = await Product.findAll({ where: { deletedAt: { [Op.ne]: null } }, paranoid: false });
    res.json(archived);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/admin/archive/messages", verifyToken, async (req, res) => {
  try {
    const archived = await Message.findAll({ where: { deletedAt: { [Op.ne]: null } }, paranoid: false });
    res.json(archived);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/admin/products/:id/restore", verifyToken, async (req, res) => {
  try {
    await Product.restore({ where: { id: req.params.id } });
    res.json({ success: true, message: "Product restored" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/admin/messages/:id/restore", verifyToken, async (req, res) => {
  try {
    await Message.restore({ where: { id: req.params.id } });
    res.json({ success: true, message: "Message restored" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/admin/products/:id/permanent", verifyToken, async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id }, force: true });
    res.json({ success: true, message: "Deleted permanently" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/admin/messages/:id/permanent", verifyToken, async (req, res) => {
  try {
    await Message.destroy({ where: { id: req.params.id }, force: true });
    res.json({ success: true, message: "Deleted permanently" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
