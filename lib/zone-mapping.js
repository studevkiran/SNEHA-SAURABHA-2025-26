// Zone Mapping for Rotary District 3181 Clubs
// Based on ZONE_CLUB_DETAILS.md - Updated November 16, 2025

const ZONE_MAPPING = {
  // ZONE 1 - Robert Rego (4 clubs)
  'Bajpe': 'Zone 1',
  'Kinnigoli': 'Zone 1',
  'Moodbidri Midtown': 'Zone 1',
  'Mulky': 'Zone 1',
  
  // ZONE 2 - Shantharam Shetty (9 clubs)
  'Baikampady': 'Zone 2',
  'Mangalore Central': 'Zone 2',
  'Mangalore Coastal': 'Zone 2',
  'Mangalore East': 'Zone 2',
  'Mangalore Hillside': 'Zone 2',
  'Mangalore North': 'Zone 2',
  'Mangalore Port Town': 'Zone 2',
  'Mangalore Sunrise': 'Zone 2',
  'Surathkal': 'Zone 2',
  
  // ZONE 3 - Ravishanakar Rao (8 clubs)
  'Deralakatte': 'Zone 3',
  'Mangalore': 'Zone 3',
  'Mangalore City': 'Zone 3',
  'Mangalore Downtown': 'Zone 3',
  'Mangalore Metro': 'Zone 3',
  'Mangalore Midtown': 'Zone 3',
  'Mangalore Sea Side': 'Zone 3',
  'Mangalore South': 'Zone 3',
  
  // ZONE 4 - Multiple AGs (14 clubs)
  'BC Road City': 'Zone 4',
  'Bantwal': 'Zone 4',
  'Bantwal Loretto Hills': 'Zone 4',
  'Bantwal Town': 'Zone 4',
  'Belthangady': 'Zone 4',
  'Farangipete': 'Zone 4',
  'Madanthyar': 'Zone 4',
  'Modankap': 'Zone 4',
  'Moodabidri': 'Zone 4',
  'Moodbidri Temple Town': 'Zone 4',
  'Puttur City': 'Zone 4',
  'Siddakatte Phalguni': 'Zone 4',
  'Uppinangadi': 'Zone 4',
  'Vittal': 'Zone 4',
  
  // ZONE 5 - Multiple AGs (12 clubs)
  'Bellare Town': 'Zone 5',
  'Birumale Hills Puttur': 'Zone 5',
  'Kadaba Town': 'Zone 5',
  'Puttur': 'Zone 5',
  'Puttur Central': 'Zone 5',
  'Puttur East': 'Zone 5',
  'Puttur Elite': 'Zone 5',
  'Puttur Swarna': 'Zone 5',
  'Puttur Yuva': 'Zone 5',
  'Subramanya': 'Zone 5',
  'Sullia': 'Zone 5',
  'Sullia City': 'Zone 5',
  
  // ZONE 6 - Dhillon Chengappa (14 clubs)
  'Gonikoppal': 'Zone 6',
  'Hemavathi Kodlipet': 'Zone 6',
  'Hunsur': 'Zone 6',
  'Krishnarajanagar': 'Zone 6',
  'Kushalnagar': 'Zone 6',
  'Madikeri': 'Zone 6',
  'Madikeri Woods': 'Zone 6',
  'Malleshwara Alur Siddapura': 'Zone 6',
  'Misty Hills Madikeri': 'Zone 6',
  'Periyapatna Icon': 'Zone 6',
  'Periyapatna Midtown': 'Zone 6',
  'Shanivarsanthe': 'Zone 6',
  'Somwarpet Hills': 'Zone 6',
  'Virajpete': 'Zone 6',
  
  // ZONE 7 - Harish B (12 clubs)
  'Central Mysore': 'Zone 7',
  'E Club Mysure Center': 'Zone 7',
  'Ivory City Mysuru': 'Zone 7',
  'Krishnaraja': 'Zone 7',
  'Mysore': 'Zone 7',
  'Mysore East': 'Zone 7',
  'Mysore Jayaprakash Nagar': 'Zone 7',
  'Mysore Metro': 'Zone 7',
  'Mysore Midtown': 'Zone 7',
  'Mysore Shreegandha': 'Zone 7',
  'Panchsheel': 'Zone 7',
  'Seva Mysore': 'Zone 7',
  
  // ZONE 8 - Multiple AGs (12 clubs)
  'HD Kote': 'Zone 8',
  'Heritage Mysore': 'Zone 8',
  'Mysore Ambari': 'Zone 8',
  'Mysore Brindavan': 'Zone 8',
  'Mysore Diamonds': 'Zone 8',
  'Mysore Elite': 'Zone 8',
  'Mysore North': 'Zone 8',
  'Mysore Royal': 'Zone 8',
  'Mysore South East': 'Zone 8',
  'Mysore Stars': 'Zone 8',
  'Mysore West': 'Zone 8',
  'Vijaynagar Mysore': 'Zone 8',
  
  // ZONE 9 - Multiple AGs (7 clubs)
  'Bannur': 'Zone 9',
  'Chamarajanagar': 'Zone 9',
  'Chamarajanagar Silk City': 'Zone 9',
  'Kollegal': 'Zone 9',
  'Kollegal Midtown': 'Zone 9',
  'Nanjangud': 'Zone 9',
  'Yelanduru Greenway': 'Zone 9'
};

// Function to get zone for a club
function getZoneForClub(clubName) {
  console.log('🔍 getZoneForClub called with:', JSON.stringify(clubName));
  
  if (!clubName) {
    console.log('⚠️ No club name provided, returning Unmapped');
    return 'Unmapped';
  }
  
  // Exact match
  if (ZONE_MAPPING[clubName]) {
    console.log('✅ Exact match found:', clubName, '→', ZONE_MAPPING[clubName]);
    return ZONE_MAPPING[clubName];
  }
  
  // Case-insensitive match
  const normalizedClubName = clubName.trim();
  console.log('🔄 Trying case-insensitive match for:', JSON.stringify(normalizedClubName));
  
  for (const [club, zone] of Object.entries(ZONE_MAPPING)) {
    if (club.toLowerCase() === normalizedClubName.toLowerCase()) {
      console.log('✅ Case-insensitive match found:', club, '→', zone);
      return zone;
    }
  }
  
  console.log('❌ No match found for:', JSON.stringify(clubName), '- returning Unmapped');
  console.log('📋 Available clubs starting with "M":', Object.keys(ZONE_MAPPING).filter(c => c.startsWith('M')).slice(0, 10));
  
  return 'Unmapped';
}

// Function to get all clubs in a zone
function getClubsInZone(zoneNumber) {
  const zoneName = `Zone ${zoneNumber}`;
  return Object.entries(ZONE_MAPPING)
    .filter(([_, zone]) => zone === zoneName)
    .map(([club, _]) => club);
}

// Function to get all zones
function getAllZones() {
  return [...new Set(Object.values(ZONE_MAPPING))].sort();
}

module.exports = {
  ZONE_MAPPING,
  getZoneForClub,
  getClubsInZone,
  getAllZones
};
