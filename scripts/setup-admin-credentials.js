import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: connectionString,
  ssl: false,
});

async function setupAdminCredentials() {
  try {
    console.log("Setting up admin credentials...");

    // Create admin_credentials table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_credentials (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if admin credentials already exist
    const existingResult = await pool.query(
      "SELECT id FROM admin_credentials WHERE id = 1"
    );

    if (existingResult.rows.length > 0) {
      console.log("✅ Admin credentials already exist in database");
      return;
    }

    // Create default admin credentials
    const defaultUsername = "admin";
    const defaultPassword = "admin123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await pool.query(
      `
      INSERT INTO admin_credentials (id, username, password)
      VALUES (1, $1, $2)
    `,
      [defaultUsername, hashedPassword]
    );

    console.log("✅ Admin credentials created successfully!");
    console.log("Default credentials:");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log(
      "⚠️  IMPORTANT: Change these credentials immediately after first login!"
    );
  } catch (error) {
    console.error("❌ Error setting up admin credentials:", error);
  } finally {
    await pool.end();
  }
}

setupAdminCredentials();








