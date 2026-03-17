const { DataTypes } = require("sequelize");
const sequelize = require("./database"); // Use your existing DB connection

const Training = sequelize.define("Training", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
});

module.exports = Training;
