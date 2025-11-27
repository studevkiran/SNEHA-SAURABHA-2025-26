#!/usr/bin/env node
/**
 * Quick fix for two specific club name mismatches:
 * 1. "BC Road City" → "B C Road City"
 * 2. "Kollegal Midtown" → "Kollegal Mid Town"
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function quickFix() {
  try {
    console.log('🔧 Quick Fix: Correcting specific club name mismatches\n');
    
    // Fix 1: BC Road City → B C Road City
    console.log('1️⃣ Fixing "BC Road City" → "B C Road City"');
    const fix1 = await pool.query(`
      UPDATE registrations 
      SET club = 'B C Road City' 
      WHERE club = 'BC Road City' 
      AND payment_status != 'test'
    `);
    console.log(`   ✅ Fixed ${fix1.rowCount} registrations\n`);
    
    // Fix 2: Kollegal Midtown → Kollegal Mid Town
    console.log('2️⃣ Fixing "Kollegal Midtown" → "Kollegal Mid Town"');
    const fix2 = await pool.query(`
      UPDATE registrations 
      SET club = 'Kollegal Mid Town' 
      WHERE club = 'Kollegal Midtown' 
      AND payment_status != 'test'
    `);
    console.log(`   ✅ Fixed ${fix2.rowCount} registrations\n`);
    
    // Verify the fixes
    console.log('🔍 Verifying fixes...\n');
    
    const bcRoad = await pool.query(`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE club = 'B C Road City' 
      AND payment_status != 'test'
    `);
    console.log(`   "B C Road City" now has: ${bcRoad.rows[0].count} registrations`);
    
    const kollegalMid = await pool.query(`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE club = 'Kollegal Mid Town' 
      AND payment_status != 'test'
    `);
    console.log(`   "Kollegal Mid Town" now has: ${kollegalMid.rows[0].count} registrations`);
    
    // Check if old names still exist
    const bcRoadOld = await pool.query(`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE club = 'BC Road City' 
      AND payment_status != 'test'
    `);
    
    const kollegalOld = await pool.query(`
      SELECT COUNT(*) as count 
      FROM registrations 
      WHERE club = 'Kollegal Midtown' 
      AND payment_status != 'test'
    `);
    
    if (bcRoadOld.rows[0].count > 0 || kollegalOld.rows[0].count > 0) {
      console.log('\n⚠️  Warning: Old names still exist!');
      if (bcRoadOld.rows[0].count > 0) {
        console.log(`   "BC Road City": ${bcRoadOld.rows[0].count} registrations`);
      }
      if (kollegalOld.rows[0].count > 0) {
        console.log(`   "Kollegal Midtown": ${kollegalOld.rows[0].count} registrations`);
      }
    } else {
      console.log('\n✅ All fixes applied successfully! Old names no longer exist.');
    }
    
    await pool.end();
    console.log('\n✨ Done!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

quickFix();
