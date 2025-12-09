// Zone Mapping for Rotary District 3181 Clubs
// Rebuilt from clubs.json - 12/5/2025

const ZONE_MAPPING = {
  // ZONE 1 (4 clubs)
  'Bajpe': 'Zone 1',
  'Kinnigoli': 'Zone 1',
  'Moodbidri Mid Town': 'Zone 1',
  'Mulky': 'Zone 1',

  // ZONE 2A (5 clubs)
  'Baikampady': 'Zone 2A',
  'Mangalore Central': 'Zone 2A',
  'Mangalore Coastal': 'Zone 2A',
  'Mangalore Port Town': 'Zone 2A',
  'Mangalore Sunrise': 'Zone 2A',

  // ZONE 2B (4 clubs)
  'Mangalore East': 'Zone 2B',
  'Mangalore Hill-Side': 'Zone 2B',
  'Mangalore North': 'Zone 2B',
  'Surathkal': 'Zone 2B',

  // ZONE 3A (4 clubs)
  'Mangalore': 'Zone 3A',
  'Mangalore Metro': 'Zone 3A',
  'Mangalore Midtown': 'Zone 3A',
  'Mangalore Seaside': 'Zone 3A',

  // ZONE 3B (4 clubs)
  'Deralakatte': 'Zone 3B',
  'Mangalore City': 'Zone 3B',
  'Mangalore Down Town': 'Zone 3B',
  'Mangalore South': 'Zone 3B',

  // ZONE 4A (4 clubs)
  'Bantwal Loretto Hills': 'Zone 4A',
  'Moodabidri': 'Zone 4A',
  'Moodbidri Temple Town': 'Zone 4A',
  'Siddakatte Phalguni': 'Zone 4A',

  // ZONE 4B (4 clubs)
  'Bantwal': 'Zone 4B',
  'Bantwal Town': 'Zone 4B',
  'Belthangady': 'Zone 4B',
  'Madanthyar': 'Zone 4B',

  // ZONE 4C (3 clubs)
  'B C Road City': 'Zone 4C',
  'Farangipete': 'Zone 4C',
  'Modankap': 'Zone 4C',

  // ZONE 4D (3 clubs)
  'Puttur City': 'Zone 4D',
  'Uppinangadi': 'Zone 4D',
  'Vittal': 'Zone 4D',

  // ZONE 5A (4 clubs)
  'Kadaba Town': 'Zone 5A',
  'Puttur': 'Zone 5A',
  'Puttur Central': 'Zone 5A',
  'Subramanya': 'Zone 5A',

  // ZONE 5B (4 clubs)
  'Puttur Elite': 'Zone 5B',
  'Puttur Swarna': 'Zone 5B',
  'Puttur Yuva': 'Zone 5B',
  'Puttur-East': 'Zone 5B',

  // ZONE 5C (4 clubs)
  'Bellare Town': 'Zone 5C',
  'Birumale Hills Puttur': 'Zone 5C',
  'Sullia': 'Zone 5C',
  'Sullia City': 'Zone 5C',

  // ZONE 6A (5 clubs)
  'Gonikoppal': 'Zone 6A',
  'Madikeri': 'Zone 6A',
  'Madikeri Woods': 'Zone 6A',
  'Misty Hills Madikeri': 'Zone 6A',
  'Virajpet': 'Zone 6A',

  // ZONE 6B (5 clubs)
  'Hemavathi Kodlipet': 'Zone 6B',
  'Kushalnagar': 'Zone 6B',
  'Malleshwara Alur Siddapura': 'Zone 6B',
  'Shanivarsanthe': 'Zone 6B',
  'Somwarpet Hills': 'Zone 6B',

  // ZONE 6C (4 clubs)
  'Hunsur, Hunsur': 'Zone 6C',
  'Krishnarajanagar': 'Zone 6C',
  'Periyapatna Icons': 'Zone 6C',
  'Periyapatna Mid Town': 'Zone 6C',

  // ZONE 7A (7 clubs)
  'Ivory City Mysuru': 'Zone 7A',
  'Krishnaraja': 'Zone 7A',
  'Mysore': 'Zone 7A',
  'Mysore Metro': 'Zone 7A',
  'Mysore Shreegandha': 'Zone 7A',
  'Panchsheel Mysore': 'Zone 7A',
  'Seva Mysore': 'Zone 7A',

  // ZONE 7B (5 clubs)
  'Central Mysore': 'Zone 7B',
  'E-Club of Mysuru Center': 'Zone 7B',
  'Mysore East': 'Zone 7B',
  'Mysore Jayaprakash Nagar': 'Zone 7B',
  'Mysore Mid-Town': 'Zone 7B',

  // ZONE 8A (6 clubs)
  'H.D. Kote': 'Zone 8A',
  'Heritage Mysuru': 'Zone 8A',
  'Mysore Elite': 'Zone 8A',
  'Mysore Royal': 'Zone 8A',
  'Mysore Stars': 'Zone 8A',
  'Mysore West': 'Zone 8A',

  // ZONE 8B (6 clubs)
  'Mysore Ambari': 'Zone 8B',
  'Mysore Brindavan': 'Zone 8B',
  'Mysore North': 'Zone 8B',
  'Mysore South East': 'Zone 8B',
  'Mysuru Diamond': 'Zone 8B',
  'Vijayanagar Mysore': 'Zone 8B',

  // ZONE 9A (3 clubs)
  'Chamarajanagar': 'Zone 9A',
  'Chamarajanagar Silk City': 'Zone 9A',
  'Nanjangud': 'Zone 9A',

  // ZONE 9B (4 clubs)
  'Bannur': 'Zone 9B',
  'Kollegal': 'Zone 9B',
  'Kollegal Mid Town': 'Zone 9B',
  'Yelanduru Greenway': 'Zone 9B',

};

// NOTE: Club member counts need to be added manually
const CLUB_MEMBERS = {};

module.exports = {
  ZONE_MAPPING,
  CLUB_MEMBERS,
  CLUB_NAME_MAPPING: {}, // Add aliases if needed
  getZoneForClub: (clubName) => ZONE_MAPPING[clubName] || null,
  getClubsInZone: (zone) => Object.keys(ZONE_MAPPING).filter(c => ZONE_MAPPING[c] === zone),
  getAllZones: () => [...new Set(Object.values(ZONE_MAPPING))].sort(),
  getClubMemberCount: (clubName) => CLUB_MEMBERS[clubName] || 0,
  normalizeClubName: (name) => name.trim()
};
