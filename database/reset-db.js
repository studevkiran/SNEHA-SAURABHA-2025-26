// Database Reset Script
const { Pool } = require('pg');
const fs = require('fs');

// Read DATABASE_URL from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="(.+)"/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

async function resetDatabase() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 Connecting to database...');
    const sql = fs.readFileSync('database/reset-database.sql', 'utf8');
    
    console.log('🗑️  Dropping existing tables...');
    console.log('🏗️  Creating fresh schema...');
    
    await pool.query(sql);
    
    console.log('✅ Database reset complete!');
    console.log('📋 Tables created: registrations, payment_logs');
    console.log('🔍 Indexes created for optimal performance');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

resetDatabase();
