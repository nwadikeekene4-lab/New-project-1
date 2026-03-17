const { DataTypes } = require("sequelize");
const sequelize = require("./config"); // ✅ INTEGRATED: Changed from ./database to match your Product.js config

const Training = sequelize.define("Training", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true // ✅ Added to match your project's data structure
});

module.exports = Training;
