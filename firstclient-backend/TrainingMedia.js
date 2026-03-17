const { DataTypes } = require("sequelize");
const sequelize = require("./database");

const TrainingMedia = sequelize.define("TrainingMedia", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
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
});

module.exports = TrainingMedia;
