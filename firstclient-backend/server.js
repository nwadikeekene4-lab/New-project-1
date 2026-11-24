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
const Message = require("./Message");
const { CartItem } = require("./cart");

const {
  DeliveryOption = { sync: () => Promise.resolve() },
} = require("./deliveryoptions");

// --- SCHOOL MODELS ---
const Training = require("./Training");
const TrainingMedia = require("./TrainingMedia");

const routes = require("./routes");

const app = express();

// --- SECURITY & PRODUCTION CONFIG ---
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          "https://api.paystack.co",
          "https://api.resend.com",
          "https://*.onrender.com",
          "https://*.vercel.app",
          "http://localhost:5000",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://res.cloudinary.com",
          "*.cloudinary.com",
        ],
        videoSrc: [
          "'self'",
          "https://res.cloudinary.com",
          "*.cloudinary.com",
        ],
        mediaSrc: [
          "'self'",
          "https://res.cloudinary.com",
          "*.cloudinary.com",
        ],
      },
    },
  })
);

// --- RATE LIMIT ---
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 500,
  message: "Too many requests, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// --- CORS ---
const allowedOrigins = [
  "https://firstclient-frontend.onrender.com",
  "https://ecommerce-website-ten-inky.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".onrender.com") ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("CORS Blocked"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;

    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".onrender.com") ||
      origin.endsWith(".vercel.app")
    ) {
      res.header("Access-Control-Allow-Origin", origin || "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS, PATCH"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Accept"
      );
      res.header("Access-Control-Allow-Credentials", "true");

      return res.sendStatus(200);
    }

    return res.sendStatus(403);
  }

  next();
});

app.use(express.json());

// --- UPLOADS ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- DATABASE INITIALIZATION ---
let databaseInitialized = false;
let databaseInitializationPromise = null;

async function syncTable(model, tableName) {
  try {
    console.log(`⏳ Checking database table: ${tableName}`);

    // Creates missing tables without automatically altering
    // the structure of existing tables.
    await model.sync();

    console.log(`✅ Table ready: ${tableName}`);
  } catch (error) {
    console.error(`❌ Failed to initialize table: ${tableName}`);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Database error code:", error.original?.code);
    console.error("Database error detail:", error.original?.detail);

    throw error;
  }
}

async function initializeDatabase() {
  if (databaseInitialized) {
    return;
  }

  if (databaseInitializationPromise) {
    return databaseInitializationPromise;
  }

  databaseInitializationPromise = (async () => {
    console.log("⏳ Starting database initialization...");

    // Verify the database connection.
    await Product.sequelize.authenticate();

    console.log("✅ Neon database connection successful");

    // Register model relationships once per application instance.
    if (!Training.associations.trainingMedia) {
      Training.hasMany(TrainingMedia, {
        as: "trainingMedia",
        foreignKey: "trainingId",
        onDelete: "CASCADE",
      });
    }

    if (!TrainingMedia.associations.Training) {
      TrainingMedia.belongsTo(Training, {
        foreignKey: "trainingId",
      });
    }

    // Initialize tables without automatic schema alteration.
    await syncTable(Training, "Training");
    await syncTable(TrainingMedia, "TrainingMedia");
    await syncTable(Product, "Products");
    await syncTable(Admin, "Admins");
    await syncTable(Message, "Messages");
    await syncTable(CartItem, "CartItems");
    await syncTable(Order, "Orders");
    await syncTable(CMS, "CMS");

    if (DeliveryOption && DeliveryOption.sync) {
      await syncTable(DeliveryOption, "DeliveryOptions");
    }

    databaseInitialized = true;

    console.log("✅ Database initialization completed successfully");
  })();

  try {
    await databaseInitializationPromise;
  } catch (error) {
    databaseInitializationPromise = null;
    throw error;
  }
}

// --- DATABASE INITIALIZATION MIDDLEWARE ---
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    console.error("❌ DATABASE INITIALIZATION FAILED:", error);

    res.status(500).json({
      success: false,
      message: "Database initialization failed",
    });
  }
});

// --- API ROUTES ---
const apiBasePath = "/api";
app.use(apiBasePath, routes);

// --- HEALTH CHECK ---
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Essence Creation backend is running",
  });
});

// --- EXPORT FOR VERCEL ---
module.exports = app;

// --- RENDER / TRADITIONAL SERVER STARTUP ---
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
