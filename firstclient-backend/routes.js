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

// 2. 🛡️ UPDATED ADMIN LOGIN (Checks Database)
router.post("/admin/login", async (req, res) => {
  try {
    const { username, password } = sanitizeInput(req.body);
    const admin = await Admin.findOne({ where: { username: username || process.env.ADMIN_USERNAME } });

    if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (isMatch) {
      const token = jwt.sign({ id: admin.username }, JWT_SECRET, { expiresIn: "24h" });
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
    const { productId, quantity } = req.body;
    let item = await CartItem.findOne({ where: { productId } });
    if (item) { 
      item.quantity += parseInt(quantity); 
      await item.save(); 
    } else { 
      item = await CartItem.create({ productId, quantity: parseInt(quantity) }); 
    }
    res.json(item);
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

// 🛡️ 7. EMERGENCY PASSWORD RESET (AUTO-UPDATE)
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
    res.json({ success: true, message: "Password updated successfully in database!" });
  } catch (err) { res.status(500).json({ success: false, message: "Update failed" }); }
});

// 🛡️ 8. FINAL FIX: PAYMENT VERIFICATION ROUTE (INTEGRATED ITEMS FIX)
router.post("/orders/verify", async (req, res) => {
  try {
    const { reference, customerDetails } = req.body;
    
    // Check with Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });

    if (response.data.data.status === 'success') {
      // 🛒 FETCH CURRENT CART ITEMS (To satisfy the "items cannot be null" DB rule)
      const cartItems = await CartItem.findAll({ 
        include: [{ model: Product, as: "product" }] 
      });

      // 📝 SAVE ORDER TO DB
      const newOrder = await Order.create({
        reference: reference,
        amount: response.data.data.amount / 100,
        status: 'Paid',
        items: JSON.stringify(cartItems), // Save items as JSON string
        customerDetails: JSON.stringify(customerDetails)
      });

      // 🧹 CLEAR CART ON SUCCESS
      await CartItem.destroy({ where: {} });

      return res.json({ success: true, message: "Payment verified!", order: newOrder });
    }
    
    res.status(400).json({ success: false, message: "Verification failed at Paystack" });
  } catch (err) {
    console.error("❌ Verify Error:", err.message);
    res.status(500).json({ error: "Server Error during verification" });
  }
});

module.exports = router;
