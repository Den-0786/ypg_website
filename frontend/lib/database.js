import { Pool } from "pg";

// Use unpooled connection string which often works better with special characters
const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: false,
});

export default pool;
