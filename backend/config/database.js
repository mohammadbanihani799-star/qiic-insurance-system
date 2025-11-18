const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL Connection Pool Configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qiic_insurance',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_MAX) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(poolConfig);

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully!');
    console.log(`📊 Database: ${process.env.DB_NAME || 'qiic_insurance'}`);
    console.log(`🏢 Host: ${process.env.DB_HOST || 'localhost'}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    return false;
  }
};

// Helper function to execute queries
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Query error:', error.message);
    throw error;
  }
};

// Helper function for transactions
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log('🔒 MySQL connection pool closed');
  } catch (error) {
    console.error('Error closing pool:', error.message);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  closePool
};
