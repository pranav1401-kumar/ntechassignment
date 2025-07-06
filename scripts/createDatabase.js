const mysql = require('mysql2/promise');
require('dotenv').config();

const createDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    const dbName = process.env.DB_NAME || 'dashboard_db';
    
    console.log(`🗄️  Creating database: ${dbName}`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database ${dbName} created successfully`);
    
    return true;
  } catch (error) {
    console.error('❌ Error creating database:', error);
    throw error;
  } finally {
    await connection.end();
  }
};

module.exports = createDatabase;