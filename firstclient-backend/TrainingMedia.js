const { DataTypes } = require("sequelize");
const sequelize = require("./config"); // ✅ INTEGRATED: Changed from ./database to ./config to match your project

const TrainingMedia = sequelize.define("TrainingMedia", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  url: {
    type: DataTypes.TEXT, // Changed to TEXT to ensure long Cloudinary URLs never get cut off
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('image', 'video'),
    allowNull: false,
  },
  // This connects the media to the specific training section
  trainingId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Trainings', // Name of the Training table
      key: 'id',
    },
    onDelete: 'CASCADE', // If the training is deleted, the photos are deleted too
  }
}, {
  timestamps: true // Added timestamps to match your other models
});

module.exports = TrainingMedia;
