/**
 * Delete ₹1 Test Entries from Database
 * Run: node database/delete-test-entries.js
 */

require('dotenv').config();
const { Pool } = require('pg');

async function deleteTestEntries() {
    // Check for DATABASE_URL
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in environment variables');
        console.log('💡 Tip: Make sure .env file has DATABASE_URL set');
        process.exit(1);
    }
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    try {
        console.log('🔍 Finding ₹1 test entries...');
        
        // First, show what will be deleted
        const testEntries = await pool.query(
            `SELECT id, full_name, mobile, email, amount, payment_status, created_at
             FROM registrations
             WHERE amount = 1
             ORDER BY created_at DESC`
        );
        
        console.log(`\n📊 Found ${testEntries.rows.length} test entries with amount = ₹1:\n`);
        
        if (testEntries.rows.length === 0) {
            console.log('✅ No test entries found. Database is clean!');
            await pool.end();
            return;
        }
        
        // Display entries
        testEntries.rows.forEach((entry, index) => {
            console.log(`${index + 1}. ID: ${entry.id}`);
            console.log(`   Name: ${entry.full_name}`);
            console.log(`   Mobile: ${entry.mobile}`);
            console.log(`   Email: ${entry.email}`);
            console.log(`   Amount: ₹${entry.amount}`);
            console.log(`   Status: ${entry.payment_status}`);
            console.log(`   Date: ${entry.created_at}`);
            console.log('');
        });
        
        // Delete entries
        console.log('🗑️  Deleting test entries...\n');
        
        const result = await pool.query(
            `DELETE FROM registrations
             WHERE amount = 1
             RETURNING id`
        );
        
        console.log(`✅ Successfully deleted ${result.rows.length} test entries!\n`);
        
        // Verify deletion
        const remainingTest = await pool.query(
            `SELECT COUNT(*) as count
             FROM registrations
             WHERE amount = 1`
        );
        
        console.log(`✅ Verification: ${remainingTest.rows[0].count} test entries remaining`);
        
        // Show summary of real registrations
        const summary = await pool.query(
            `SELECT 
                COUNT(*) as total_registrations,
                SUM(amount) as total_revenue,
                COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_count
             FROM registrations`
        );
        
        console.log('\n📈 Current Database Summary:');
        console.log(`   Total Registrations: ${summary.rows[0].total_registrations}`);
        console.log(`   Total Revenue: ₹${summary.rows[0].total_revenue?.toLocaleString('en-IN') || 0}`);
        console.log(`   Paid Registrations: ${summary.rows[0].paid_count}`);
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Error deleting test entries:', error);
        await pool.end();
        throw error;
    }
}

// Run the deletion
deleteTestEntries()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Failed:', error.message);
        process.exit(1);
    });
