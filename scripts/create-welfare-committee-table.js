import pool from "../lib/database.js";

async function createWelfareCommitteeTable() {
  try {
    console.log("Creating welfare_committee table...");

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

    // Create indexes
    console.log("Creating indexes...");
    const indexQueries = [
      "CREATE INDEX IF NOT EXISTS idx_welfare_committee_email ON welfare_committee(email);",
      "CREATE INDEX IF NOT EXISTS idx_welfare_committee_position ON welfare_committee(position);",
      "CREATE INDEX IF NOT EXISTS idx_welfare_committee_congregation ON welfare_committee(congregation);",
      "CREATE INDEX IF NOT EXISTS idx_welfare_committee_deleted_at ON welfare_committee(deleted_at);",
    ];

    for (const query of indexQueries) {
      await pool.query(query);
    }
    console.log("✅ Indexes created successfully");

    console.log("🎉 Welfare committee table setup completed!");
  } catch (error) {
    console.error("❌ Error creating welfare committee table:", error);
  } finally {
    await pool.end();
  }
}

createWelfareCommitteeTable();
