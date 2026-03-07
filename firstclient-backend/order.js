const { DataTypes } = require("sequelize");
const sequelize = require("./config");

const Order = sequelize.define("Order", {
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true 
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  // ⭐ ADDED: To store the shipping cost separately from the total amount
  shippingFee: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  items: {
    type: DataTypes.TEXT, 
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pending" // Changed to Pending to match your new Admin logic
  },
  customerName: { type: DataTypes.STRING, allowNull: true },
  customerEmail: { type: DataTypes.STRING, allowNull: true }, // Added for Resend receipts
  address: { type: DataTypes.TEXT, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  // ⭐ INTEGRATED: Added this field to store the delivery date
  selectedDate: { type: DataTypes.STRING, allowNull: true }
}, {
  timestamps: true,
  paranoid: true // Keeps records for the "Archive" section instead of hard deleting
});

module.exports = Order;
