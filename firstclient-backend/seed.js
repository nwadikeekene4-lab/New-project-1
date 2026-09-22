const sequelize = require("./config");
const Product = require("./models");
const { DeliveryOption } = require("./deliveryoptions");
const { CartItem } = require("./cart");
const cloudinary = require("cloudinary").v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function findCloudinaryImage(filename) {
  try {
    // Remove the file extension because Cloudinary search works with the filename
    const baseName = filename.replace(/\.[^/.]+$/, "");

    console.log(`🔎 Looking for Cloudinary image: ${baseName}`);

    const result = await cloudinary.search
      .expression(
        `folder:shop_products AND resource_type:image AND filename:${baseName}`
      )
      .max_results(10)
      .with_field("public_id")
      .with_field("filename")
      .with_field("secure_url")
      .execute();

    if (result.resources && result.resources.length > 0) {
      const match = result.resources[0];

      console.log(`✅ Found: ${match.public_id}`);

      // Prefer the permanent Cloudinary HTTPS URL.
      if (match.secure_url) {
        return match.secure_url;
      }

      // Fallback: construct the URL from the actual Public ID.
      return cloudinary.url(match.public_id, {
        secure: true,
        resource_type: "image"
      });
    }

    console.log(`⚠️ No Cloudinary image found for: ${filename}`);
    return null;
  } catch (error) {
    console.error(
      `❌ Cloudinary search failed for ${filename}:`,
      error.message
    );
    return null;
  }
}

async function seed() {
  try {
    console.log("🚀 Starting the smart seed process...");

    // Check Cloudinary configuration before continuing
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error(
        "Cloudinary environment variables are missing. Make sure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set."
      );
    }

    // 1. Sync the database structure without deleting existing data
    await sequelize.sync({ alter: true });

    // 2. Clear the cart
    await CartItem.destroy({
      where: {},
      truncate: true,
      cascade: true
    });

    console.log("✅ Cart cleared of old/broken data.");

    // 3. Default products
    const productsData = [
      {
        name: "2slot-white toaster",
        price: 25000,
        image: "2-slot-toaster-white.jpg",
        rating: { stars: 4.5, count: 120 }
      },
      {
        name: "3 piece-cooking set",
        price: 45000,
        image: "3-piece-cooking-set.jpg",
        rating: { stars: 2.5, count: 85 }
      },
      {
        name: "adults-plain-cotton-tshirt-2-pack-teal",
        price: 12000,
        image: "adults-plain-cotton-tshirt-2-pack-teal.jpg",
        rating: { stars: 1.5, count: 200 }
      },
      {
        name: "artistic-bowl-set-6-piece",
        price: 18500,
        image: "artistic-bowl-set-6-piece.jpg",
        rating: { stars: 4.0, count: 140 }
      },
      {
        name: "electric-steel-hot",
        price: 22000,
        image: "electric-steel-hot-water-kettle-white.jpg",
        rating: { stars: 3.5, count: 95 }
      },
      {
        name: "black-and-silver-espresso-maker",
        price: 35000,
        image: "black-and-silver-espresso-maker.jpg",
        rating: { stars: 4.5, count: 160 }
      },
      {
        name: "non-stick-cooking-set",
        price: 65000,
        image: "non-stick-cooking-set-4-pieces.jpg",
        rating: { stars: 4.5, count: 840 }
      },
      {
        name: "glass-screw-lid-food-containers",
        price: 15000,
        image: "glass-screw-lid-food-containers.jpg",
        rating: { stars: 4.0, count: 260 }
      },
      {
        name: "intermediate-composite-basketball",
        price: 28000,
        image: "intermediate-composite-basketball.jpg",
        rating: { stars: 2.5, count: 510 }
      },
      {
        name: "elegant-white-dinner-plate-set",
        price: 32000,
        image: "elegant-white-dinner-plate-set.jpg",
        rating: { stars: 3.0, count: 77 }
      }
    ];

    console.log("🔄 Matching default products with Cloudinary images...");

    for (const p of productsData) {
      // Find the actual image in Cloudinary automatically.
      const cloudinaryImage = await findCloudinaryImage(p.image);

      if (!cloudinaryImage) {
        console.log(
          `⚠️ Keeping product without image because Cloudinary image was not found: ${p.name}`
        );
      }

      // Delete only the default product with this exact name.
      // Admin-created products with different names remain untouched.
      await Product.destroy({
        where: { name: p.name }
      });

      await Product.create({
        name: p.name,
        price: p.price,
        image: cloudinaryImage,
        videoUrl: null,
        category: "general",
        subCategory: null,
        rating: p.rating
      });

      console.log(`✅ Seeded: ${p.name}`);
    }

    console.log("✅ 10 default products are now synced with Cloudinary.");

    // 4. Delivery options
    const deliveryOptionsData = [
      {
        id: "standard",
        deliveryDays: "3-5 days",
        price: 2500
      },
      {
        id: "express",
        deliveryDays: "1-2 days",
        price: 5000
      },
      {
        id: "overnight",
        deliveryDays: "Next day",
        price: 8500
      }
    ];

    for (const option of deliveryOptionsData) {
      await DeliveryOption.findOrCreate({
        where: { id: option.id },
        defaults: option
      });
    }

    console.log("✅ Delivery options seeded.");

    console.log("\n✨ SEEDING COMPLETE!");
    console.log("🖼️ Default product images are now linked to Cloudinary.");
    console.log("🛡️ Admin-created products were kept safe.");

    process.exit(0);
  } catch (err) {
    console.error("❌ SEEDING FAILED:", err);
    process.exit(1);
  }
}

seed();
