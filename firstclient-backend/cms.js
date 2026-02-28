const { DataTypes } = require("sequelize");
const sequelize = require("./config");

const CMS = sequelize.define("CMS", {
  page_name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  content: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
});

module.exports = CMS;
