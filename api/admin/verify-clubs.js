/**
 * API: Verify club names in database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Load official clubs list
    const clubsPath = path.join(process.cwd(), 'data', 'clubs.json');
    const clubsData = JSON.parse(fs.readFileSync(clubsPath, 'utf8'));
    const officialClubs = clubsData.map(c => c.name);
    const officialClubsLower = officialClubs.map(c => c.toLowerCase());
    
    // Get all unique club names from registrations
    const result = await pool.query(`
      SELECT DISTINCT club, COUNT(*) as count
      FROM registrations 
      WHERE payment_status != 'test'
      GROUP BY club 
      ORDER BY club
    `);
    
    const mismatches = [];
    const unknownClubs = [];
    const correctClubs = [];
    
    result.rows.forEach(row => {
      const dbClub = row.club;
      const dbClubLower = dbClub.toLowerCase();
      
      // Check if exact match exists
      if (officialClubs.includes(dbClub)) {
        correctClubs.push({
          name: dbClub,
          count: parseInt(row.count)
        });
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
            count: parseInt(row.count)
          });
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
          count: parseInt(row.count)
        });
      } else {
        unknownClubs.push({
          name: dbClub,
          count: parseInt(row.count)
        });
      }
    });
    
    // Check specific registration 0404
    const reg404 = await pool.query(`
      SELECT registration_id, name, club, registration_type, meal_preference, tshirt_size, 
             TO_CHAR(created_at, 'DD/MM/YYYY') as reg_date
      FROM registrations 
      WHERE registration_id = '2026RTY0404'
    `);
    
    const totalRegistrations = await pool.query(`
      SELECT COUNT(*) as count FROM registrations WHERE payment_status != 'test'
    `);
    
    return res.status(200).json({
      success: true,
      data: {
        totalRegistrations: parseInt(totalRegistrations.rows[0].count),
        totalUniqueClubs: result.rows.length,
        correctClubs: correctClubs,
        mismatches: mismatches,
        unknownClubs: unknownClubs,
        registration404: reg404.rows.length > 0 ? reg404.rows[0] : null
      }
    });
    
  } catch (error) {
    console.error('❌ Error verifying clubs:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
