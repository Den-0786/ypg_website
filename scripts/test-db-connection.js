import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

console.log("Testing database connection...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
console.log(
  "DATABASE_URL_UNPOOLED:",
  process.env.DATABASE_URL_UNPOOLED ? "Set" : "Not set"
);

// Try with unpooled connection first
const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

console.log(
  "Using connection string:",
  connectionString ? "Available" : "Not available"
);

const pool = new Pool({
  connectionString: connectionString,
  ssl: false,
});

try {
  const result = await pool.query("SELECT NOW()");
  console.log("✅ Database connection successful:", result.rows[0]);
} catch (error) {
  console.error("❌ Database connection failed:", error.message);

  // Try alternative SSL configuration
  console.log("Trying with SSL configuration...");
  const pool2 = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    const result2 = await pool2.query("SELECT NOW()");
    console.log("✅ Database connection successful with SSL:", result2.rows[0]);
  } catch (error2) {
    console.error("❌ Database connection failed with SSL:", error2.message);
  } finally {
    await pool2.end();
  }
} finally {
  await pool.end();
}








