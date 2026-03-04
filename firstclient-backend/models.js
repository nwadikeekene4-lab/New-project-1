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
  rating: {
    type: DataTypes.JSON,
    defaultValue: { stars: 0, count: 0 }
  }
}, {
  timestamps: true,
  paranoid: true // ✅ Enables Soft Delete: records aren't erased
});

module.exports = Product;
