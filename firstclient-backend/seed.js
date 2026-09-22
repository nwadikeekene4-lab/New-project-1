const sequelize = require("./config");
const Product = require("./models");
const { DeliveryOption } = require("./deliveryoptions");
const { CartItem } = require("./cart");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const productsData = [
  {
    name: "2slot-white toaster",
    price: 25000,
    imageName: "2-slot-toaster-white.jpg",
    rating: { stars: 4.5, count: 120 }
  },
  {
    name: "3 piece-cooking set",
    price: 45000,
    imageName: "3-piece-cooking-set.jpg",
    rating: { stars: 2.5, count: 85 }
  },
  {
    name: "adults-plain-cotton-tshirt-2-pack-teal",
    price: 12000,
    imageName: "adults-plain-cotton-tshirt-2-pack-teal.jpg",
    rating: { stars: 1.5, count: 200 }
  },
  {
    name: "artistic-bowl-set-6-piece",
    price: 18500,
    imageName: "artistic-bowl-set-6-piece.jpg",
    rating: { stars: 4.0, count: 140 }
  },
  {
    name: "electric-steel-hot",
    price: 22000,
    imageName: "electric-steel-hot-water-kettle-white.jpg",
    rating: { stars: 3.5, count: 95 }
  },
  {
    name: "black-and-silver-espresso-maker",
    price: 35000,
    imageName: "black-and-silver-espresso-maker.jpg",
    rating: { stars: 4.5, count: 160 }
  },
  {
    name: "non-stick-cooking-set",
    price: 65000,
    imageName: "non-stick-cooking-set-4-pieces.jpg",
    rating: { stars: 4.5, count: 840 }
  },
  {
    name: "glass-screw-lid-food-containers",
    price: 15000,
    imageName: "glass-screw-lid-food-containers.jpg",
    rating: { stars: 4.0, count: 260 }
  },
  {
    name: "intermediate-composite-basketball",
    price: 28000,
    imageName: "intermediate-composite-basketball.jpg",
    rating: { stars: 2.5, count: 510 }
  },
  {
    name: "elegant-white-dinner-plate-set",
    price: 32000,
    imageName: "elegant-white-dinner-plate-set.jpg",
    rating: { stars: 3.0, count: 77 }
  }
];

async function listCloudinaryImages() {
  console.log("\n🔎 Reading images from Cloudinary folder: shop_products\n");

  let resources = [];
  let nextCursor = undefined;

  do {
    const result = await cloudinary.api.resources({
      resource_type: "image",
      type: "upload",
      prefix: "shop_products/",
      max_results: 500,
      next_cursor: nextCursor
    });

    if (result.resources) {
      resources.push(...result.resources);
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  console.log(`📦 Cloudinary images found: ${resources.length}\n`);

  resources.forEach((resource, index) => {
    console.log(`IMAGE ${index + 1}`);
    console.log(`Public ID: ${resource.public_id}`);
    console.log(`URL: ${resource.secure_url}`);
    console.log(`Display name: ${resource.display_name || "N/A"}`);
    console.log("----------------------------------------");
  });

  return resources;
}

async function seed() {
  try {
    console.log("🚀 Starting Cloudinary inspection seed...");

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error(
        "Cloudinary environment variables are missing."
      );
    }

    await sequelize.authenticate();

    console.log("✅ Database connection successful.");

    const images = await listCloudinaryImages();

    if (images.length === 0) {
      throw new Error(
        "No images were found inside the Cloudinary shop_products folder."
      );
    }

    console.log("\n⚠️ IMPORTANT:");
    console.log(
      "No products have been changed. The script only inspected Cloudinary."
    );
    console.log(
      "We will use the information above to create the correct image mapping."
    );

    console.log("\n📋 Default products that need images:\n");

    productsData.forEach((product, index) => {
      console.log(
        `${index + 1}. ${product.name} → ${product.imageName}`
      );
    });

    console.log("\n🛑 INSPECTION COMPLETE.");
    console.log(
      "🛡️ Database products were NOT deleted or recreated."
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ INSPECTION FAILED:");
    console.error(error);
    process.exit(1);
  }
}

seed();
