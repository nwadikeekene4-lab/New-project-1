const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet"); 
const rateLimit = require("express-rate-limit"); 
const { Op } = require("sequelize"); 
require("dotenv").config(); 

// --- MODELS ---
const Product = require("./models");
const Order = require("./order");
const Admin = require("./Admin"); 
const CMS = require("./cms");
const Message = require("./Message"); 
const { CartItem } = require("./cart");
const { DeliveryOption = { sync: () => Promise.resolve() } } = require("./deliveryoptions");
const routes = require("./routes"); 

const app = express();

// --- 🛡️ SECURITY & PRODUCTION CONFIG ---
app.set('trust proxy', 1); 
app.disable('x-powered-by');

app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false, 
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      // ⭐ UPDATED: Added Cloudinary and common Render patterns to prevent blocks
      connectSrc: ["'self'", "https://api.paystack.co", "https://*.onrender.com", "http://localhost:5000"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "*.cloudinary.com"],
      videoSrc: ["'self'", "https://res.cloudinary.com", "*.cloudinary.com"],
    },
  },
})); 

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 500, 
  message: "Too many requests, please slow down",
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use(limiter); 

const allowedOrigins = [
  "https://firstclient-frontend.onrender.com",
  "http://localhost:3000",
  "http://localhost:5173", 
  "http://localhost:5000"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
      callback(null, true);
    } else {
      callback(new Error("CORS Blocked"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));

// Explicit Options Handling (Kept exactly as yours)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(200); 
  }
  next();
});

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 🧹 AUTOMATIC CLEANUP TASK ---
const startCleanupTask = () => {
  // Logic to run immediate cleanup on boot, then every 24 hours
  const runCleanup = async () => {
    try {
      const now = new Date();
      
      // 1. Permanent delete Products older than 15 days in archive
      const productLimit = new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000));
      await Product.destroy({
        where: { 
          deletedAt: { [Op.lt]: productLimit } 
        },
        force: true,
        paranoid: false // Required to find already-soft-deleted items
      });

      // 2. Permanent delete Messages older than 60 days in archive
      const messageLimit = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
      await Message.destroy({
        where: { 
          deletedAt: { [Op.lt]: messageLimit } 
        },
        force: true,
        paranoid: false
      });

      console.log("✅ Cleanup Task: Expired archived items purged.");
    } catch (err) {
      console.error("❌ Cleanup Task Error:", err);
    }
  };

  runCleanup(); // Run once on startup
  setInterval(runCleanup, 24 * 60 * 60 * 1000); 
};

// --- START SERVER & SYNC DATABASE ---
async function startServer() {
  try {
    console.log("⏳ Starting database synchronization...");
    
    // ⭐ These { alter: true } calls will now pick up your shippingFee field!
    await Product.sync({ alter: true }); 
    await Admin.sync({ alter: true }); 
    await Message.sync({ alter: true }); 
    await CartItem.sync({ alter: true });
    await Order.sync({ alter: true }); 
    await CMS.sync({ alter: true });
    
    if (DeliveryOption && DeliveryOption.sync) await DeliveryOption.sync();
    
    console.log("✅ All Database tables synced successfully");

    // Use the routes
    app.use("/api", routes);
    
    // Initialize Cleanup Task
    startCleanupTask();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1); 
  }
}

startServer();
