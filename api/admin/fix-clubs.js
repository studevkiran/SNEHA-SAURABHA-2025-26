/**
 * API: Fix club name mismatches in database
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    
    const fixes = [];
    
    // Find mismatches
    for (const row of result.rows) {
      const dbClub = row.club;
      const dbClubLower = dbClub.toLowerCase();
      
      // Skip if exact match
      if (officialClubs.includes(dbClub)) {
        continue;
      }
      
      // Check for case-insensitive match
      const matchIndex = officialClubsLower.indexOf(dbClubLower);
      if (matchIndex >= 0) {
        const correctName = officialClubs[matchIndex];
        if (correctName !== dbClub) {
          fixes.push({
            wrong: dbClub,
            correct: correctName,
            count: parseInt(row.count)
          });
        }
        continue;
      }
      
      // Check for close matches (spaces, capitalization)
      const closeMatch = officialClubs.find(official => {
        const officialNorm = official.toLowerCase().replace(/\s+/g, '');
        const dbNorm = dbClub.toLowerCase().replace(/\s+/g, '');
        return officialNorm === dbNorm;
      });
      
      if (closeMatch) {
        fixes.push({
          wrong: dbClub,
          correct: closeMatch,
          count: parseInt(row.count)
        });
      }
    }
    
    if (fixes.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No club name mismatches to fix',
        fixed: 0,
        fixes: []
      });
    }
    
    // Apply fixes
    const fixedResults = [];
    let totalFixed = 0;
    
    for (const fix of fixes) {
      try {
        const updateResult = await pool.query(
          'UPDATE registrations SET club = $1 WHERE club = $2 AND payment_status != \'test\'',
          [fix.correct, fix.wrong]
        );
        
        fixedResults.push({
          wrong: fix.wrong,
          correct: fix.correct,
          rowsUpdated: updateResult.rowCount
        });
        
        totalFixed += updateResult.rowCount;
      } catch (err) {
        fixedResults.push({
          wrong: fix.wrong,
          correct: fix.correct,
          error: err.message
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Fixed ${totalFixed} registrations`,
      fixed: totalFixed,
      fixes: fixedResults
    });
    
  } catch (error) {
    console.error('❌ Error fixing clubs:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
