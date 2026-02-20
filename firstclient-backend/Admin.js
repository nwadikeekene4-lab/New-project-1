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
  }
}, {
  // This helps Sequelize manage the table name "Admins" properly
  tableName: 'Admins',
  timestamps: true
});

module.exports = Admin;
