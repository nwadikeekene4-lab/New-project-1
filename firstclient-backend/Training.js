const { DataTypes } = require("sequelize");
const sequelize = require("./config"); 

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
  // ⭐ ADD THIS LINE BELOW:
  subHeader: {
    type: DataTypes.STRING,
    allowNull: true, // Allow it to be empty if you don't have a sub-topic
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true 
});

module.exports = Training;
