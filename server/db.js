import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined in .env");
}

// PostgreSQL pool config
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Query helper
export const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error("❌ Database query error:", err);
    throw err;
  }
};

// Client helper (for transactions etc.)
export const getClient = async () => {
  try {
    return await pool.connect();
  } catch (err) {
    console.error("❌ Error getting database client:", err);
    throw err;
  }
};

console.log("✅ PostgreSQL pool connected");

export default pool;

