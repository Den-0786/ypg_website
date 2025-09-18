import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Use the same working configuration as the test script
const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: false,
});

async function createMissingTables() {
  try {
    console.log("Creating missing tables...");

    // Create past_executives table
    const pastExecutivesQuery = `
      CREATE TABLE IF NOT EXISTS past_executives (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        reign_period VARCHAR(100) NOT NULL,
        image VARCHAR(255),
        dashboard_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create blog_posts table
    const blogPostsQuery = `
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        date DATE DEFAULT CURRENT_DATE,
        image VARCHAR(255),
        dashboard_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create events table
    const eventsQuery = `
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        date DATE NOT NULL,
        time TIME,
        location VARCHAR(255),
        type VARCHAR(50) DEFAULT 'general',
        image VARCHAR(255),
        status VARCHAR(50) DEFAULT 'upcoming',
        dashboard_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create team_members table (if not already created)
    const teamMembersQuery = `
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        bio TEXT,
        image VARCHAR(255),
        dashboard_deleted BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Execute all queries
    await pool.query(pastExecutivesQuery);
    console.log("✅ past_executives table created successfully!");

    await pool.query(blogPostsQuery);
    console.log("✅ blog_posts table created successfully!");

    await pool.query(eventsQuery);
    console.log("✅ events table created successfully!");

    await pool.query(teamMembersQuery);
    console.log("✅ team_members table created successfully!");

    // Test connections
    const testQueries = [
      {
        name: "past_executives",
        query: "SELECT COUNT(*) FROM past_executives",
      },
      { name: "blog_posts", query: "SELECT COUNT(*) FROM blog_posts" },
      { name: "events", query: "SELECT COUNT(*) FROM events" },
      { name: "team_members", query: "SELECT COUNT(*) FROM team_members" },
    ];

    for (const test of testQueries) {
      const result = await pool.query(test.query);
      console.log(
        `✅ ${test.name} table test successful. Current row count: ${result.rows[0].count}`
      );
    }

    console.log("✅ All missing tables created and tested successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  } finally {
    await pool.end();
  }
}

createMissingTables();
