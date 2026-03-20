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
  subHeader: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // ⭐ UPDATED: Stores likes as a JSON array of IP addresses
  likes: {
    type: DataTypes.TEXT,
    defaultValue: "[]",
    get() {
      const rawValue = this.getDataValue('likes');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('likes', JSON.stringify(value));
    }
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  timestamps: true 
});

module.exports = Training;
