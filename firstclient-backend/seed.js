const sequelize = require("./config");
const Product = require("./models");
const { DeliveryOption } = require("./deliveryOptions");
const { CartItem } = require("./cart");

async function seed() {
  try {
    console.log("🚀 Starting the smart seed process...");

    // 1. Sync the database structure without deleting data
    // This keeps your Admin-added products safe while adding new columns like 'items' to Orders
    await sequelize.sync({ alter: true });

    // 2. Clear out the CartItems table
    // Important: Prevents crashes if you try to load a cart linked to an old product ID
    await CartItem.destroy({ where: {}, truncate: true, cascade: true });
    console.log("✅ Cart cleared of old/broken data.");

    // 3. Define the 10 Default Products with REAL NAIRA PRICES
    // Fix: Updated prices from small numbers (15, 25) to Naira values (15000, 25000)
    const productsData = [
      { name: "2slot-white toaster", price: 25000, image: "shop_products/2-slot-toaster-white.jpg", rating: { stars: 4.5, count: 120 } },
      { name: "3 piece-cooking set", price: 45000, image: "shop_products/3-piece-cooking-set.jpg", rating: { stars: 2.5, count: 85 } },
      { name: "adults-plain-cotton-tshirt-2-pack-teal", price: 12000, image: "shop_products/adults-plain-cotton-tshirt-2-pack-teal.jpg", rating: { stars: 1.5, count: 200 } },
      { name: "artistic-bowl-set-6-piece", price: 18500, image: "shop_products/artistic-bowl-set-6-piece.jpg", rating: { stars: 4.0, count: 140 } },
      { name: "electric-steel-hot", price: 22000, image: "shop_products/electric-steel-hot-water-kettle-white.jpg", rating: { stars: 3.5, count: 95 } },
      { name: "black-and-silver-espresso-maker", price: 35000, image: "shop_products/black-and-silver-espresso-maker.jpg", rating: { stars: 4.5, count: 160 } },
      { name: "non-stick-cooking-set", price: 65000, image: "shop_products/non-stick-cooking-set-4-pieces.jpg", rating: { stars: 4.5, count: 840 } },
      { name: "glass-screw-lid-food-containers", price: 15000, image: "shop_products/glass-screw-lid-food-containers.jpg", rating: { stars: 4.0, count: 260 } },
      { name: "intermediate-composite-basketball", price: 28000, image: "shop_products/intermediate-composite-basketball.jpg", rating: { stars: 2.5, count: 510 } },
      { name: "elegant-white-dinner-plate-set", price: 32000, image: "shop_products/elegant-white-dinner-plate-set.jpg", rating: { stars: 3.0, count: 77 } }
    ];

    console.log("🔄 Re-syncing default products...");

    for (const p of productsData) {
      // Delete existing default by name to avoid duplicates, then re-insert fresh
      await Product.destroy({ where: { name: p.name } });
      await Product.create(p);
    }
    console.log("✅ 10 Default products are now live in the database.");

    // 4. Seed Delivery Options (Prices also updated to Naira)
    const deliveryOptionsData = [
      { id: 'standard', deliveryDays: '3-5 days', price: 2500 },
      { id: 'express', deliveryDays: '1-2 days', price: 5000 },
      { id: 'overnight', deliveryDays: 'Next day', price: 8500 }
    ];

    for (const option of deliveryOptionsData) {
      // findOrCreate ensures we don't duplicate delivery options every time you run seed
      await DeliveryOption.findOrCreate({
        where: { id: option.id },
        defaults: option
      });
    }
    console.log("✅ Delivery options seeded.");

    console.log("\n✨ SEEDING COMPLETE! Your Admin products were kept safe.");
    process.exit();
    
  } catch (err) {
    console.error("❌ SEEDING FAILED:", err);
    process.exit(1);
  }
}

seed();