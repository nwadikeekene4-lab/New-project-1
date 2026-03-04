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
  params: { folder: "shop_products" },
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
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/admin/products", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file ? (req.file.path || req.file.secure_url) : null;
    const product = await Product.create({
      name: sanitizeInput(req.body.name),
      price: parseFloat(req.body.price) || 0,
      image: imageUrl, 
      rating: { stars: 0, count: 0 }
    });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/admin/products/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    let imageUrl = product.image;
    if (req.file) imageUrl = req.file.path || req.file.secure_url;
    product.name = sanitizeInput(req.body.name) || product.name;
    product.price = parseFloat(req.body.price) || product.price;
    product.image = imageUrl;
    await product.save();
    res.json({ success: true, updatedProduct: product });
  } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

router.delete("/admin/products/:id", verifyToken, async (req, res) => {
  try {
    // Soft deletes because of paranoid: true in model
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
    // Soft deletes because of paranoid: true in model
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

router.get("/orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']], include: { all: true, nested: true } });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CMS ---
router.post("/cms/update", verifyToken, async (req, res) => {
  try {
    const { page_name, data } = req.body;
    const [page, created] = await CMS.findOrCreate({ where: { page_name }, defaults: { title: sanitizeInput(data.title), description: sanitizeInput(data.description), image: data.image, content: data } });
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

// 1. Get all soft-deleted products
router.get("/admin/archive/products", verifyToken, async (req, res) => {
  try {
    const archived = await Product.findAll({
      where: { deletedAt: { [require("sequelize").Op.ne]: null } },
      paranoid: false 
    });
    res.json(archived);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Get all soft-deleted messages
router.get("/admin/archive/messages", verifyToken, async (req, res) => {
  try {
    const archived = await Message.findAll({
      where: { deletedAt: { [require("sequelize").Op.ne]: null } },
      paranoid: false
    });
    res.json(archived);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Restore a message (We already made the Product restore route earlier!)
router.post("/admin/messages/:id/restore", verifyToken, async (req, res) => {
  try {
    await Message.restore({ where: { id: req.params.id } });
    res.json({ success: true, message: "Message restored" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

