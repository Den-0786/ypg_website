import pool from "../lib/database.js";

async function createAnalyticsTable() {
  try {
    console.log("Creating analytics table...");

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        page VARCHAR(255),
        user_agent TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);
    console.log("✅ analytics table created successfully");

    // Create indexes
    console.log("Creating analytics indexes...");
    const indexQueries = [
      "CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);",
      "CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(created_at);",
    ];

    for (const query of indexQueries) {
      await pool.query(query);
    }
    console.log("✅ Analytics indexes created successfully");

    console.log("🎉 Analytics table setup completed!");
  } catch (error) {
    console.error("❌ Error creating analytics table:", error);
  } finally {
    await pool.end();
  }
}

createAnalyticsTable();





