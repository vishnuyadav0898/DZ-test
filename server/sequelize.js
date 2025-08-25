import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Create Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false, // set true if you want to see SQL queries
  dialectOptions: {
    ssl: process.env.NODE_ENV === "production" ? { require: true, rejectUnauthorized: false } : false,
  },
});

// Test the connection
try {
  await sequelize.authenticate();
  console.log("✅ PostgreSQL connected via Sequelize");
} catch (error) {
  console.error("❌ Unable to connect to PostgreSQL:", error);
}

export default sequelize;
