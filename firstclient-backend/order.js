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
    defaultValue: "Pending" 
  },
  customerName: { type: DataTypes.STRING, allowNull: true },
  customerEmail: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  
  // ⭐ INTEGRATED: This allows the database to remember the shipping area (e.g. Island)
  location: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },

  // ⭐ INTEGRATED: Stores the delivery date selected at checkout
  selectedDate: { 
    type: DataTypes.STRING, 
    allowNull: true 
  }
}, {
  timestamps: true,
  paranoid: true // Allows for soft delete (records remain in DB but hidden from Admin)
});

module.exports = Order;
