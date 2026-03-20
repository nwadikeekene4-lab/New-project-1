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
  // 🛡️ UPDATED: Added safety check for JSON parsing
  likes: {
    type: DataTypes.TEXT,
    defaultValue: "[]",
    get() {
      const rawValue = this.getDataValue('likes');
      try {
        // If rawValue exists, parse it; otherwise return empty array
        return rawValue ? JSON.parse(rawValue) : [];
      } catch (e) {
        // If JSON is malformed, return empty array instead of crashing
        console.error("Malformed likes JSON in DB:", e);
        return [];
      }
    },
    set(value) {
      // Ensure we always stringify, defaulting to empty array if value is null
      this.setDataValue('likes', JSON.stringify(value || []));
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
