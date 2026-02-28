const { DataTypes } = require("sequelize");
const sequelize = require("./config");

const CMS = sequelize.define("CMS", {
  page_name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT, // Using TEXT for long write-ups
    allowNull: true,
  },
  image: {
    type: DataTypes.TEXT, // Using TEXT to allow long Cloudinary URLs (Same as Product)
    allowNull: true,
  },
  // Keep content as JSONB for a backup, but we will use the columns above primarily
  content: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
});

module.exports = CMS;
