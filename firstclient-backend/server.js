const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet"); 
const rateLimit = require("express-rate-limit"); 
require("dotenv").config(); 

// --- MODELS ---
const Product = require("./models");
const Order = require("./order");
const Admin = require("./Admin"); 
const CMS = require("./cms");
const Message = require("./Message"); // ✅ Integrated Message Model
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
      connectSrc: ["'self'", "https://api.paystack.co", "https://firstclient-frontend.onrender.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "*.cloudinary.com"],
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

// --- 1. DYNAMIC CORS ---
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

// --- Manual Chrome Preflight Handler ---
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

// --- START SERVER & SYNC DATABASE ---
async function startServer() {
  try {
    console.log("⏳ Starting database synchronization...");

    // Syncing all models to ensure tables exist in the Render database
    await Product.sync({ alter: true }); 
    await Admin.sync({ alter: true }); 
    await Message.sync({ alter: true }); // ✅ Fixes the "Messages does not exist" error
    await CartItem.sync({ alter: true });
    await Order.sync({ alter: true }); 
    await CMS.sync({ alter: true });
    
    if (DeliveryOption.sync) await DeliveryOption.sync();
    
    console.log("✅ All Database tables synced successfully");

    // Mounting routes after database is ready
    app.use("/api", routes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1); // Exit if DB connection fails
  }
}

startServer();
