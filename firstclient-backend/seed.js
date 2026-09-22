const sequelize = require("./config");
const Product = require("./models");
const { DeliveryOption } = require("./deliveryoptions");
const { CartItem } = require("./cart");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");

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

async function uploadProductImage(filename) {
  const imagePath = path.join(
    __dirname,
    "public",
    "images",
    filename
  );

  if (!fs.existsSync(imagePath)) {
    throw new Error(
      `Original image not found: ${imagePath}`
    );
  }

  console.log(`☁️ Uploading ${filename} to Cloudinary...`);

  const result = await cloudinary.uploader.upload(imagePath, {
    folder: "shop_products",
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    resource_type: "image"
  });

  console.log(`✅ Uploaded: ${result.secure_url}`);

  return result.secure_url;
}

async function seed() {
  try {
    console.log("🚀 Starting final product image restoration...");

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

    await sequelize.sync({ alter: true });

    /*
      We intentionally clear only the cart.
      Existing admin-created products are NOT touched.
    */
    await CartItem.destroy({
      where: {},
      truncate: true,
      cascade: true
    });

    console.log("✅ Cart cleared.");

    for (const productData of productsData) {
      console.log(
        `\n🔄 Restoring: ${productData.name}`
      );

      const imageUrl = await uploadProductImage(
        productData.image
      );

      /*
        Remove only the original default product
        with this exact name.
      */
      await Product.destroy({
        where: {
          name: productData.name
        }
      });

      await Product.create({
        name: productData.name,
        price: productData.price,
        image: imageUrl,
        videoUrl: null,
        category: "general",
        subCategory: null,
        rating: productData.rating
      });

      console.log(
        `✅ Product restored: ${productData.name}`
      );
    }

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
        where: {
          id: option.id
        },
        defaults: option
      });
    }

    console.log("✅ Delivery options seeded.");

    console.log("\n🎉 PRODUCT IMAGE RESTORATION COMPLETE!");
    console.log(
      "☁️ All 10 original product images are now stored on Cloudinary."
    );
    console.log(
      "💾 Their Cloudinary URLs are stored in the database."
    );
    console.log(
      "🛡️ Existing admin-created products were left untouched."
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ RESTORATION FAILED:");
    console.error(error);
    process.exit(1);
  }
}

seed();
