const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function createTeamTable() {
  try {
    console.log("Creating team_members table...");

    const createTableQuery = `
            CREATE TABLE IF NOT EXISTS team_members (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                position VARCHAR(100) NOT NULL,
                department VARCHAR(100),
                bio TEXT,
                image VARCHAR(255),
                dashboard_deleted BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

    await pool.query(createTableQuery);
    console.log("✅ team_members table created successfully!");

    // Test the table
    const result = await pool.query("SELECT COUNT(*) FROM team_members");
    console.log(
      "✅ Table test successful. Current row count:",
      result.rows[0].count
    );
  } catch (error) {
    console.error("❌ Error creating team_members table:", error);
  } finally {
    await pool.end();
  }
}

createTeamTable();









