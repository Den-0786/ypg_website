import dotenv from "dotenv";
import { Pool } from "pg";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, "..", ".env.local") });

// Create a direct connection pool for this script
const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: connectionString,
  ssl: false,
});

// Override the connection string to remove SSL requirement
process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL_UNPOOLED?.replace(
  "?sslmode=require",
  ""
);

async function updateEventsTable() {
  try {
    console.log(
      "Updating events table to add start/end date and time fields..."
    );

    // Check if the new columns already exist
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name IN ('start_date', 'start_time', 'end_date', 'end_time')
    `);

    const existingColumns = columnCheck.rows.map((row) => row.column_name);
    console.log("Existing columns:", existingColumns);

    // Add new columns if they don't exist
    const alterQueries = [];

    if (!existingColumns.includes("start_date")) {
      alterQueries.push("ALTER TABLE events ADD COLUMN start_date DATE;");
    }

    if (!existingColumns.includes("start_time")) {
      alterQueries.push("ALTER TABLE events ADD COLUMN start_time TIME;");
    }

    if (!existingColumns.includes("end_date")) {
      alterQueries.push("ALTER TABLE events ADD COLUMN end_date DATE;");
    }

    if (!existingColumns.includes("end_time")) {
      alterQueries.push("ALTER TABLE events ADD COLUMN end_time TIME;");
    }

    // Execute alter queries
    for (const query of alterQueries) {
      await pool.query(query);
      console.log(`✅ Executed: ${query}`);
    }

    // If we added start_date, migrate existing date data
    if (!existingColumns.includes("start_date")) {
      console.log("Migrating existing date data to start_date...");
      await pool.query(
        "UPDATE events SET start_date = date WHERE start_date IS NULL;"
      );
      console.log("✅ Date migration completed");
    }

    // If we added start_time, migrate existing time data
    if (!existingColumns.includes("start_time")) {
      console.log("Migrating existing time data to start_time...");
      await pool.query(
        "UPDATE events SET start_time = time WHERE start_time IS NULL;"
      );
      console.log("✅ Time migration completed");
    }

    // Drop old columns if they exist and migration is complete
    const oldColumnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name IN ('date', 'time')
    `);

    const oldColumns = oldColumnCheck.rows.map((row) => row.column_name);

    if (oldColumns.includes("date")) {
      console.log("Dropping old 'date' column...");
      await pool.query("ALTER TABLE events DROP COLUMN date;");
      console.log("✅ Dropped 'date' column");
    }

    if (oldColumns.includes("time")) {
      console.log("Dropping old 'time' column...");
      await pool.query("ALTER TABLE events DROP COLUMN time;");
      console.log("✅ Dropped 'time' column");
    }

    console.log("🎉 Events table update completed successfully!");
  } catch (error) {
    console.error("❌ Error updating events table:", error);
  } finally {
    await pool.end();
  }
}

updateEventsTable();
