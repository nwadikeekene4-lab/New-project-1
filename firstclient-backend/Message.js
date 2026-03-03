const { DataTypes } = require("sequelize");
const sequelize = require("./config");

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

module.exports = Message;
