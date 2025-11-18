// Quick Database Setup Script
require('dotenv').config({ path: '.env.production' });
const mysql = require('mysql2/promise');
const fs = require('fs');

async function setupDatabase() {
  console.log('🔄 Connecting to MySQL...');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to MySQL!');

    // Read SQL file
    const sql = fs.readFileSync('../setup-hostinger-db.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
        console.log('✓ Executed statement');
      }
    }

    console.log('✅ Database setup complete!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
