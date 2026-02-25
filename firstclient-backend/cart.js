const { DataTypes } = require("sequelize");
const sequelize = require("./config");
const Product = require("./models");

const CartItem = sequelize.define("CartItem", {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: "id"
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  // 🛠️ FIX: Changed to a plain STRING to store "Monday, February 25"
  // Removed the 'references' link to DeliveryOption to avoid ID mismatch errors
  deliveryOptionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE(3),
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE(3),
    defaultValue: DataTypes.NOW
  }
});

// Associations
CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(CartItem, { foreignKey: "productId" });

module.exports = { CartItem };