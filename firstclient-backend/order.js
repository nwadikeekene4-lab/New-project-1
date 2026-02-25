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
  items: {
    type: DataTypes.TEXT, 
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Paid" 
  },
  customerName: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: true },
  country: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  // ⭐ INTEGRATED: Added this field to store the delivery date
  selectedDate: { type: DataTypes.STRING, allowNull: true }
}, {
  timestamps: true,
  paranoid: true 
});

module.exports = Order;