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

// NEW: Message Model for Contact Form
const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  message: DataTypes.TEXT,
  status: {
    type: DataTypes.STRING,
    defaultValue: "unread"
  }
}, {
  timestamps: true
});

module.exports = { Product, Message };
