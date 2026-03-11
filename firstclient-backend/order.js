const { DataTypes } = require("sequelize");
const sequelize = require("./config");

const Order = sequelize.define("Order", {
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true 
  },
  // Use DECIMAL(10, 2) for money to prevent rounding errors
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  shippingFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  // TEXT is fine for SQLite, but if you move to MySQL/Postgres later, JSON is better
  items: {
    type: DataTypes.TEXT, 
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pending" 
  },
  customerName: { type: DataTypes.STRING, allowNull: true },
  customerEmail: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  
  // Stores the delivery area (e.g., "Lagos Island", "Mainland")
  location: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },

  // Stores the delivery date selected at checkout
  selectedDate: { 
    type: DataTypes.STRING, 
    allowNull: true 
  }
}, {
  timestamps: true,
  paranoid: true // Keeps deleted orders in the database for your records
});

module.exports = Order;
