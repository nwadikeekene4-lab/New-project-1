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
    type: DataTypes.JSON,
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
  phone: { type: DataTypes.STRING, allowNull: true }
}, {
  timestamps: true,
  paranoid: true // <--- THIS IS THE KEY CHANGE. Enables soft deletes.
});

module.exports = Order;