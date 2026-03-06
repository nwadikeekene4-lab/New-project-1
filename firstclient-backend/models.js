const { DataTypes } = require("sequelize");
const sequelize = require("./config");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: DataTypes.STRING,
  price: DataTypes.FLOAT,
  image: DataTypes.TEXT, 
  // ⭐ NEW FIELDS INTEGRATED FOR PASTRY PAGE
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: "general" // Old products will default to "general"
  },
  subCategory: {
    type: DataTypes.STRING,
    allowNull: true // Only cakes/breads will use this
  },
  rating: {
    type: DataTypes.JSON,
    defaultValue: { stars: 0, count: 0 }
  }
}, {
  timestamps: true,
  paranoid: true // ✅ Enables Soft Delete
});

module.exports = Product;
