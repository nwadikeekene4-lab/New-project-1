const { DataTypes } = require("sequelize");
const sequelize = require("./config");

const Admin = sequelize.define("Admin", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "admin",
    unique: true // PostgreSQL likes this as a separate constraint
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Admin;