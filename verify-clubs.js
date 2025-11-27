#!/usr/bin/env node
/**
 * Verify and fix club name mismatches in registrations
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load official clubs list
const clubsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'clubs.json'), 'utf8'));
const officialClubs = clubsData.map(c => c.name);
const officialClubsLower = officialClubs.map(c => c.toLowerCase());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyClubs() {
  try {
    console.log('🔍 Checking club name mismatches in database...\n');
    
    // Get all unique club names from registrations
    const result = await pool.query(`
      SELECT DISTINCT club, COUNT(*) as count
      FROM registrations 
      WHERE payment_status != 'test'
      GROUP BY club 
      ORDER BY club
    `);
    
    console.log(`📊 Found ${result.rows.length} unique club names in database\n`);
    
    const mismatches = [];
    const unknownClubs = [];
    
    result.rows.forEach(row => {
      const dbClub = row.club;
      const dbClubLower = dbClub.toLowerCase();
      
      // Check if exact match exists
      if (officialClubs.includes(dbClub)) {
        console.log(`✅ "${dbClub}" (${row.count} registrations)`);
        return;
      }
      
      // Check if case-insensitive match exists
      const matchIndex = officialClubsLower.indexOf(dbClubLower);
      if (matchIndex >= 0) {
        const correctName = officialClubs[matchIndex];
        if (correctName !== dbClub) {
          mismatches.push({
            wrong: dbClub,
            correct: correctName,
            count: row.count
          });
          console.log(`⚠️  "${dbClub}" → should be "${correctName}" (${row.count} registrations)`);
        }
        return;
      }
      
      // Check for close matches (spaces, capitalization, etc.)
      const closeMatch = officialClubs.find(official => {
        const officialNorm = official.toLowerCase().replace(/\s+/g, '');
        const dbNorm = dbClub.toLowerCase().replace(/\s+/g, '');
        return officialNorm === dbNorm;
      });
      
      if (closeMatch) {
        mismatches.push({
          wrong: dbClub,
          correct: closeMatch,
          count: row.count
        });
        console.log(`⚠️  "${dbClub}" → should be "${closeMatch}" (${row.count} registrations)`);
      } else {
        unknownClubs.push({
          name: dbClub,
          count: row.count
        });
        console.log(`❌ "${dbClub}" - NOT FOUND in official list (${row.count} registrations)`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 SUMMARY');
    console.log('='.repeat(80) + '\n');
    
    if (mismatches.length > 0) {
      console.log(`⚠️  Found ${mismatches.length} club name mismatches:\n`);
      mismatches.forEach((m, i) => {
        console.log(`   ${i + 1}. "${m.wrong}" → "${m.correct}" (${m.count} registrations)`);
      });
      console.log('\n💡 Run fix-clubs.js to correct these mismatches');
    } else {
      console.log('✅ No club name mismatches found!');
    }
    
    if (unknownClubs.length > 0) {
      console.log(`\n❌ Found ${unknownClubs.length} unknown clubs:\n`);
      unknownClubs.forEach((u, i) => {
        console.log(`   ${i + 1}. "${u.name}" (${u.count} registrations)`);
      });
      console.log('\n⚠️  These clubs are not in the official clubs.json list!');
    }
    
    // Check specific registration 0404
    console.log('\n' + '='.repeat(80));
    console.log('🎯 Checking Registration 2026RTY0404');
    console.log('='.repeat(80) + '\n');
    
    const reg404 = await pool.query(`
      SELECT registration_id, name, club, registration_type, meal_preference, tshirt_size, 
             TO_CHAR(created_at, 'DD/MM/YYYY') as reg_date
      FROM registrations 
      WHERE registration_id = '2026RTY0404'
    `);
    
    if (reg404.rows.length > 0) {
      const r = reg404.rows[0];
      console.log(`Reg No:     ${r.registration_id}`);
      console.log(`Name:       ${r.name}`);
      console.log(`Club:       ${r.club}`);
      console.log(`Type:       ${r.registration_type}`);
      console.log(`Food:       ${r.meal_preference}`);
      console.log(`Size:       ${r.tshirt_size}`);
      console.log(`Reg Date:   ${r.reg_date}`);
      
      if (r.club !== 'Kollegal Mid Town') {
        console.log(`\n⚠️  Club name mismatch! Should be "Kollegal Mid Town"`);
      } else {
        console.log(`\n✅ Club name is correct!`);
      }
    } else {
      console.log('❌ Registration 2026RTY0404 not found!');
    }
    
    await pool.end();
    
    if (mismatches.length > 0) {
      process.exit(1); // Exit with error if mismatches found
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

verifyClubs();
