/**
 * API: Compare clubs.json with database and find ALL mismatches
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

  try {
    // Get all clubs from database
    const dbResult = await pool.query('SELECT id, name, zone FROM clubs ORDER BY id');
    const dbClubs = dbResult.rows;
    
    // Read clubs.json from public folder
    const clubsJsonPath = path.join(process.cwd(), 'public', 'data', 'clubs.json');
    const clubsJson = JSON.parse(fs.readFileSync(clubsJsonPath, 'utf8'));
    
    // Create lookup maps
    const dbByName = {};
    dbClubs.forEach(club => {
      dbByName[club.name] = club;
    });
    
    const jsonByName = {};
    clubsJson.forEach(club => {
      jsonByName[club.name] = club;
    });
    
    // Find mismatches
    const mismatches = [];
    const clubsOnlyInJson = [];
    const clubsOnlyInDb = [];
    
    // Check clubs in JSON
    clubsJson.forEach(jsonClub => {
      const dbClub = dbByName[jsonClub.name];
      
      if (!dbClub) {
        clubsOnlyInJson.push({
          name: jsonClub.name,
          json_id: jsonClub.id
        });
      } else if (dbClub.id !== jsonClub.id) {
        mismatches.push({
          name: jsonClub.name,
          json_id: jsonClub.id,
          db_id: dbClub.id,
          db_zone: dbClub.zone,
          id_below_92: jsonClub.id <= 92 && dbClub.id <= 92
        });
      }
    });
    
    // Check clubs only in DB
    dbClubs.forEach(dbClub => {
      if (!jsonByName[dbClub.name]) {
        clubsOnlyInDb.push({
          name: dbClub.name,
          db_id: dbClub.id,
          zone: dbClub.zone
        });
      }
    });
    
    return res.status(200).json({
      success: true,
      summary: {
        total_db_clubs: dbClubs.length,
        total_json_clubs: clubsJson.length,
        id_mismatches: mismatches.length,
        clubs_only_in_json: clubsOnlyInJson.length,
        clubs_only_in_db: clubsOnlyInDb.length
      },
      id_mismatches: mismatches,
      clubs_only_in_json: clubsOnlyInJson,
      clubs_only_in_db: clubsOnlyInDb
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
