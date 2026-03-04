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

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: "shop_products" },
});
const upload = multer({ storage: storage });

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_12345";

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Unauthorized access" });
      req.adminId = decoded.id;
      next();
    });
  } catch (err) { res.status(500).json({ message: "Internal Auth Error" }); }
};

// --- PRODUCT ROUTES ---

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

// FIXED: COMPLETE UPDATE ROUTE
router.put("/admin/products/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let imageUrl = product.image;
    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url;
    }

    product.name = sanitizeInput(name) || product.name;
    product.price = parseFloat(price) || product.price;
    product.image = imageUrl;

    await product.save();

    res.json({ success: true, updatedProduct: product });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/admin/products/:id", verifyToken, async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- REMAINING CMS & MESSAGE ROUTES ---
router.get("/admin/messages", verifyToken, async (req, res) => {
  try {
    const messages = await Message.findAll({ order: [['createdAt', 'DESC']] });
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/cms/update", verifyToken, async (req, res) => {
  try {
    const { page_name, data } = req.body;
    const [page, created] = await CMS.findOrCreate({
      where: { page_name },
      defaults: { title: sanitizeInput(data.title), description: sanitizeInput(data.description), image: data.image, content: data }
    });
    if (!created) {
      page.title = sanitizeInput(data.title);
      page.description = sanitizeInput(data.description);
      page.image = data.image;
      page.content = data;
      await page.save();
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
