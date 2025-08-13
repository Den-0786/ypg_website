import pool from "../lib/database.js";

async function testWelfareAPI() {
  try {
    console.log("Testing welfare committee API...");

    // Test database connection
    console.log("Testing database connection...");
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful:", result.rows[0]);

    // Test if welfare_committee table exists
    console.log("Checking if welfare_committee table exists...");
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'welfare_committee'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log("✅ welfare_committee table exists");

      // Test fetching members
      const members = await pool.query(
        "SELECT * FROM welfare_committee WHERE deleted_at IS NULL"
      );
      console.log(`✅ Found ${members.rows.length} committee members`);
    } else {
      console.log("❌ welfare_committee table does not exist");
      console.log("Creating table...");

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS welfare_committee (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20) NOT NULL,
          position VARCHAR(100) NOT NULL,
          congregation VARCHAR(255) NOT NULL,
          picture TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL
        );
      `;

      await pool.query(createTableQuery);
      console.log("✅ welfare_committee table created successfully");
    }
  } catch (error) {
    console.error("❌ Error testing welfare API:", error);
  } finally {
    await pool.end();
  }
}

testWelfareAPI();
