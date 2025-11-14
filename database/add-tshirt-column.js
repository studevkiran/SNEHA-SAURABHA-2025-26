/**
 * Add tshirt_size column to registrations and payment_attempts tables
 * Run: node database/add-tshirt-column.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function addTshirtColumn() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in environment variables');
        process.exit(1);
    }
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        console.log('🔧 Adding tshirt_size column to tables...\n');
        
        // Add to registrations table
        console.log('📋 Adding tshirt_size to registrations table...');
        await pool.query(`
            ALTER TABLE registrations 
            ADD COLUMN IF NOT EXISTS tshirt_size VARCHAR(10)
        `);
        console.log('✅ Added to registrations table');
        
        // Add to payment_attempts table
        console.log('📋 Adding tshirt_size to payment_attempts table...');
        await pool.query(`
            ALTER TABLE payment_attempts 
            ADD COLUMN IF NOT EXISTS tshirt_size VARCHAR(10)
        `);
        console.log('✅ Added to payment_attempts table');
        
        // Verify columns exist
        console.log('\n🔍 Verifying columns...');
        
        const regResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'registrations' AND column_name = 'tshirt_size'
        `);
        
        const payResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'payment_attempts' AND column_name = 'tshirt_size'
        `);
        
        console.log('✅ registrations.tshirt_size:', regResult.rows[0] ? 'EXISTS' : 'MISSING');
        console.log('✅ payment_attempts.tshirt_size:', payResult.rows[0] ? 'EXISTS' : 'MISSING');
        
        await pool.end();
        console.log('\n✅ Migration complete!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
}

addTshirtColumn();
