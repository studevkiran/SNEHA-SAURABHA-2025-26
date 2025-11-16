/**
 * API: Zone & Club Stats (cached)
 * Aggregates counts per zone and per club (excluding test & Guest/No Club in zone totals)
 */
const { Pool } = require('pg');

// Reuse pool across invocations
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

let cache = null;
let cacheTime = 0;
const CACHE_TTL_MS = (() => {
  const raw = process.env.STATS_CACHE_TTL_MS;
  if (!raw) return 60_000; // default 60s
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 60_000;
})();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const wantFresh = (req.query && (req.query.fresh === '1' || req.query.fresh === 'true'));
  // Serve from cache if fresh not explicitly requested
  if (!wantFresh && cache && Date.now() - cacheTime < CACHE_TTL_MS) {
    return res.status(200).json({ success: true, cached: true, data: cache });
  }

  try {
    const sql = `SELECT zone, club, payment_status FROM registrations`;
    const result = await pool.query(sql);

    const zoneTotals = {}; // { '1': count }
    const clubsByZone = {}; // { '1': [{club,count}] }
    let totalRegistrations = 0;
    let guestCount = 0;

    for (const row of result.rows) {
      // Exclude test entries from totals (test, manual-B for test registrations)
      if (row.payment_status === 'test' || row.payment_status === 'manual-B') continue;
      totalRegistrations++;

      const zoneText = row.zone || 'Unmapped';
      const clubName = row.club || 'Unknown';

      if (clubName === 'Guest/No Club') {
        guestCount++;
        continue; // do not include in zone tally
      }

      const m = zoneText.match(/Zone\s+(\d+)/i);
      if (!m) continue; // skip Unmapped

      const zNum = m[1];
      zoneTotals[zNum] = (zoneTotals[zNum] || 0) + 1;
      if (!clubsByZone[zNum]) clubsByZone[zNum] = {};
      clubsByZone[zNum][clubName] = (clubsByZone[zNum][clubName] || 0) + 1;
    }

    // Convert club object maps to sorted arrays
    const clubsByZoneArr = {};
    Object.entries(clubsByZone).forEach(([z, clubMap]) => {
      clubsByZoneArr[z] = Object.entries(clubMap)
        .map(([club, count]) => ({ club, count }))
        .sort((a, b) => b.count - a.count);
    });

    const responseData = {
      generatedAt: new Date().toISOString(),
      totalRegistrations,
      guestCount,
      zoneTotals,
      clubsByZone: clubsByZoneArr,
      cacheTtlMs: CACHE_TTL_MS
    };

    // Only store in cache when not explicitly bypassed
    if (!wantFresh) {
      cache = responseData;
      cacheTime = Date.now();
    }
    return res.status(200).json({ success: true, cached: !wantFresh ? false : 'bypassed', data: responseData, fresh: wantFresh });
  } catch (err) {
    console.error('Zone stats error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error', details: err.message });
  }
};
