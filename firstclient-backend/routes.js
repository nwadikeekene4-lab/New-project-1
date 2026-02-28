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

// 🛡️ SECURITY IMPORTS
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const Product = require("./models");
const CMS = require("./cms"); 
const { CartItem } = require("./cart");
const Order = require("./order");
const Admin = require("./Admin"); 

// 🛡️ SECURITY UTILITY
const sanitizeInput = (data) => {
  if (typeof data === 'string') return DOMPurify.sanitize(data);
  if (typeof data === 'object' && data !== null) {
    for (let key in data) {
      data[key] = sanitizeInput(data[key]);
    }
  }
  return data;
};

// 1. CONFIGURATIONS
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
  params: { folder: "shop_products" },
});
const upload = multer({ storage: storage });

// --- 🛡️ MIDDLEWARE: Verify JWT Token ---
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Session expired.", expired: true });
        }
        return res.status(401).json({ message: "Unauthorized access" });
      }
      req.adminId = decoded.id;
      next();
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Auth Error" });
  }
};

// --- 🛡️ PAYSTACK WEBHOOK ---
router.post("/paystack/webhook", async (req, res) => {
  try {
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET)
                       .update(JSON.stringify(req.body))
                       .digest('hex');
    if (hash !== req.headers['x-paystack-signature']) return res.sendStatus(400); 
    const event = req.body;
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const existingOrder = await Order.findOne({ where: { reference } });
      if (!existingOrder) console.log(`💰 Webhook: Payment Verified for ${reference}`);
    }
    res.sendStatus(200);
  } catch (err) { res.sendStatus(500); }
});

// 2. 🛡️ ADMIN LOGIN
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = sanitizeInput(req.body);
    const admin = await Admin.findOne({ where: { username: username || process.env.ADMIN_USERNAME } });
    if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (isMatch) {
      const token = jwt.sign({ id: admin.username }, JWT_SECRET, { expiresIn: "6h" });
      return res.json({ success: true, token, message: "Login successful" });
    }
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 3. PRODUCT ROUTES
router.post("/admin/products", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.create({
      name: sanitizeInput(req.body.name),
      price: parseFloat(req.body.price),
      image: req.file ? (req.file.path || req.file.secure_url) : null, 
      rating: { stars: 0, count: 0 }
    });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/products", async (req, res) => {
  try {
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. CART ROUTES
router.get("/cart", async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({ include: [{ model: Product, as: "product" }] });
    const validItems = cartItems.filter(item => item.product !== null);
    res.json(validItems);
  } catch (err) { 
    const simpleCart = await CartItem.findAll();
    res.json(simpleCart);
  }
});

router.post("/cart/add", async (req, res) => {
  try {
    const { productId, quantity, overrideQuantity } = req.body;
    let item = await CartItem.findOne({ where: { productId } });

    if (item) { 
      if (overrideQuantity !== undefined) {
        item.quantity = parseInt(overrideQuantity);
      } else {
        item.quantity += parseInt(quantity); 
      }
      await item.save(); 
    } else { 
      const finalQty = overrideQuantity !== undefined ? parseInt(overrideQuantity) : parseInt(quantity);
      item = await CartItem.create({ productId, quantity: finalQty }); 
    }
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/cart/:id", async (req, res) => {
  try {
    const deleted = await CartItem.destroy({ where: { id: req.params.id } });
    if (deleted) res.json({ success: true, message: "Item removed" });
    else res.status(404).json({ success: false, message: "Not found" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/cart/update-date", async (req, res) => {
  try {
    const { cartItemId, deliveryDate } = req.body;
    await CartItem.update({ deliveryOptionId: deliveryDate }, { where: { id: cartItemId } });
    res.json({ success: true, message: "Date updated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/cart/clear", async (req, res) => {
  try { await CartItem.destroy({ where: {} }); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. PAYMENT ROUTES
router.post("/paystack/init", async (req, res) => {
  try {
    const { email, amount, customerDetails } = req.body;
    const response = await axios.post("https://api.paystack.co/transaction/initialize",
      { 
        email, 
        amount: Math.round(amount * 100), 
        callback_url: `${req.headers.origin}/success`, 
        metadata: { customer_details: sanitizeInput(customerDetails) }
      },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );
    res.json(response.data);
  } catch (err) { res.status(500).json({ error: "Paystack Init Failed" }); }
});

// 6. ORDER MANAGEMENT
router.get("/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.findAll({ 
        order: [['createdAt', 'DESC']],
        include: { all: true, nested: true }
    });
    res.json(orders);
  } catch (err) { 
    const simpleOrders = await Order.findAll({ order: [['createdAt', 'DESC']] });
    res.json(simpleOrders);
  }
});

router.patch("/orders/:id", verifyToken, async (req, res) => {
  try {
    await Order.update({ status: req.body.status }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/orders/:id", verifyToken, async (req, res) => {
  try {
    await Order.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/orders/all/bulk", verifyToken, async (req, res) => {
  try { await Order.destroy({ where: {}, truncate: false }); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. EMERGENCY RESET
router.post("/admin/emergency-reset", async (req, res) => {
  try {
    const { recoveryKey, newPassword } = req.body;
    if (recoveryKey !== process.env.MASTER_RECOVERY_KEY) {
      return res.status(401).json({ success: false, message: "Invalid Recovery Key" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [admin, created] = await Admin.findOrCreate({
      where: { username: process.env.ADMIN_USERNAME || "admin" },
      defaults: { password: hashedPassword }
    });
    if (!created) {
      admin.password = hashedPassword;
      await admin.save();
    }
    res.json({ success: true, message: "Password updated successfully!" });
  } catch (err) { res.status(500).json({ success: false, message: "Update failed" }); }
});

// 🛡️ 8. PAYMENT VERIFICATION ROUTE
router.post("/orders/verify", async (req, res) => {
  try {
    const { reference, customerDetails } = req.body;
    const existingOrder = await Order.findOne({ where: { reference } });
    if (existingOrder) return res.json({ success: true, order: existingOrder });
    
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });

    if (response.data.data.status === 'success') {
      let itemsToSave = customerDetails?.items || [];
      const newOrder = await Order.create({
        reference: reference,
        amount: response.data.data.amount / 100,
        status: 'Pending',
        items: JSON.stringify(itemsToSave), 
        customerName: customerDetails?.name || "Unknown Customer",
        address: customerDetails?.address || "No Address Provided",
        city: customerDetails?.location || "N/A", 
        phone: customerDetails?.phone || "N/A",
        country: customerDetails?.country || 'Nigeria',
        selectedDate: customerDetails?.selectedDate || "Standard Delivery"
      });
      await CartItem.destroy({ where: {} });
      return res.json({ success: true, order: newOrder });
    }
    res.status(400).json({ success: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🛡️ 9. --- CMS ROUTES (THE PRODUCT-STYLE FIX) ---
router.post("/cms/update", verifyToken, async (req, res) => {
  try {
    const { page_name, data } = req.body;

    // 1. Sanitize text only
    const cleanTitle = sanitizeInput(data.title);
    const cleanDesc = sanitizeInput(data.description || data.legacy);
    const imageUrl = data.image; // Raw URL from Cloudinary

    // 2. Find and Update or Create (Product-style logic)
    const [page, created] = await CMS.findOrCreate({
      where: { page_name },
      defaults: { 
        title: cleanTitle, 
        description: cleanDesc, 
        image: imageUrl,
        content: data // Backup
      }
    });

    if (!created) {
      // Direct column updates (much more reliable than JSON updates)
      page.title = cleanTitle;
      page.description = cleanDesc;
      page.image = imageUrl;
      page.content = data;
      
      await page.save();
    }

    res.json({ success: true, message: "Website updated!", image: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/cms/:page", async (req, res) => {
  try {
    const page = await CMS.findOne({ where: { page_name: req.params.page } });
    if (!page) return res.json({});
    
    // Return a combined object so your frontend doesn't break
    res.json({
      title: page.title,
      description: page.description,
      image: page.image,
      ...page.content
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

