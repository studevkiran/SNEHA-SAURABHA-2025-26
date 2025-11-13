#!/usr/bin/env node

/**
 * Reset database with new production schema
 * Run: node database/apply-production-schema.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
  console.log('🔧 Starting database reset...\n');

  // Connect to database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'production-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📂 Loaded production-schema.sql');
    console.log('⚠️  WARNING: This will DELETE ALL existing data!\n');

    // Execute SQL
    console.log('🗑️  Dropping existing tables...');
    await pool.query(sql);

    console.log('\n✅ DATABASE RESET COMPLETE!\n');
    console.log('📋 Tables created:');
    console.log('   - registrations (confirmed payments only)');
    console.log('   - payment_attempts (all payment tries)');
    console.log('\n🔍 Indexes created for performance');
    console.log('⚙️  Triggers set up for auto-update timestamps\n');

    // Verify
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('📊 Current tables in database:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n🎯 Database is clean and ready for production!');
    console.log('💡 All old test data has been removed.\n');

  } catch (error) {
    console.error('\n❌ Error resetting database:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run
resetDatabase();
