const { DataTypes } = require("sequelize");
const sequelize = require("./config");

const Admin = sequelize.define("Admin", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },

  resetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },

  resetTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "Admins",
  timestamps: true
});

module.exports = Admin;
