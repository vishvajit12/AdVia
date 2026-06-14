// =====================================================================
// AdVia Backend — MySQL Connection Pool
// Creates a reusable connection pool using mysql2/promise so every
// controller can `await pool.query(...)`.
// =====================================================================
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'advia_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// Quick helper to verify the DB is reachable at startup.
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ MySQL connected:', process.env.DB_NAME || 'advia_db');
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   → Check your .env values and that MySQL is running.');
    console.error('   → Did you run: mysql -u root -p < database/schema.sql ?');
  }
}

module.exports = { pool, testConnection };
