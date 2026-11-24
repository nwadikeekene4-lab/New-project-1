
const { Sequelize } = require("sequelize");
require("dotenv").config();

// Explicitly load PostgreSQL so Vercel includes the driver
// in its serverless deployment bundle.
require("pg");

let sequelize;

if (process.env.DATABASE_URL) {
  // Production database
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // Local database
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "postgres",
    }
  );
}

module.exports = sequelize;
    
