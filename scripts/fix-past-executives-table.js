import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: false,
});

async function fixPastExecutivesTable() {
  try {
    console.log("Checking past_executives table structure...");

    // Check current table structure
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'past_executives' 
      ORDER BY ordinal_position;
    `);

    console.log("Current table structure:");
    structureResult.rows.forEach((row) => {
      console.log(
        `- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });

    // Check if reign_period column exists
    const hasReignPeriod = structureResult.rows.some(
      (row) => row.column_name === "reign_period"
    );

    if (!hasReignPeriod) {
      console.log("Adding missing reign_period column...");
      await pool.query(`
        ALTER TABLE past_executives 
        ADD COLUMN reign_period VARCHAR(100) NOT NULL DEFAULT 'Unknown Period';
      `);
      console.log("✅ reign_period column added successfully!");
    } else {
      console.log("✅ reign_period column already exists");
    }

    // Check if other required columns exist
    const requiredColumns = [
      "name",
      "position",
      "image",
      "dashboard_deleted",
      "created_at",
      "updated_at",
    ];
    const existingColumns = structureResult.rows.map((row) => row.column_name);

    for (const column of requiredColumns) {
      if (!existingColumns.includes(column)) {
        console.log(`Adding missing ${column} column...`);
        let columnDef = "";
        switch (column) {
          case "name":
            columnDef = "VARCHAR(255) NOT NULL DEFAULT 'Unknown'";
            break;
          case "position":
            columnDef = "VARCHAR(255) NOT NULL DEFAULT 'Unknown Position'";
            break;
          case "image":
            columnDef = "VARCHAR(255)";
            break;
          case "dashboard_deleted":
            columnDef = "BOOLEAN DEFAULT false";
            break;
          case "created_at":
            columnDef = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
            break;
          case "updated_at":
            columnDef = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
            break;
        }
        await pool.query(
          `ALTER TABLE past_executives ADD COLUMN ${column} ${columnDef};`
        );
        console.log(`✅ ${column} column added successfully!`);
      }
    }

    // Test the table
    console.log("Testing table with sample query...");
    const testResult = await pool.query(
      "SELECT * FROM past_executives LIMIT 1"
    );
    console.log(
      "✅ Table test successful. Sample row:",
      testResult.rows[0] || "No rows yet"
    );

    console.log("✅ past_executives table structure fixed successfully!");
  } catch (error) {
    console.error("❌ Error fixing table:", error);
  } finally {
    await pool.end();
  }
}

fixPastExecutivesTable();



