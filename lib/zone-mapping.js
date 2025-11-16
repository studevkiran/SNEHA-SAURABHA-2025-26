// Zone Mapping for Rotary District 3181 Clubs
// Based on ZONE_CLUB_DETAILS.md

const ZONE_MAPPING = {
  // ZONE 1
  'Bantwal': 'Zone 1',
  'Bantwal Loretto Hills': 'Zone 1',
  'Bantwal Town': 'Zone 1',
  'Bellare Town': 'Zone 1',
  'Puttur': 'Zone 1',
  'Puttur Raintree': 'Zone 1',
  'Puttur Town': 'Zone 1',
  'Sullia': 'Zone 1',
  'Uppinangady': 'Zone 1',
  'Vittal Kalavara': 'Zone 1',
  
  // ZONE 2
  'B C Road City': 'Zone 2',
  'Bajpe': 'Zone 2',
  'Baikampady': 'Zone 2',
  'Belthangady': 'Zone 2',
  'Birumale Hills Puttur': 'Zone 2',
  'Dharmasthala': 'Zone 2',
  'Kadaba': 'Zone 2',
  'Mangaluru Lake City': 'Zone 2',
  'Moodabidri Town': 'Zone 2',
  'Mudipu': 'Zone 2',
  'Nada Kulur': 'Zone 2',
  'Ujire': 'Zone 2',
  
  // ZONE 3
  'Bijai Jain': 'Zone 3',
  'Jeppu': 'Zone 3',
  'Kankanady': 'Zone 3',
  'Kankanady Trinity': 'Zone 3',
  'Kottara': 'Zone 3',
  'Lalbagh': 'Zone 3',
  'Madikeri': 'Zone 3',
  'Mangalore': 'Zone 3',
  'Mangalore Midtown': 'Zone 3',
  'Mangaluru Down Town': 'Zone 3',
  'Mangaluru West': 'Zone 3',
  'Somwarapet': 'Zone 3',
  'Virajpet': 'Zone 3',
  'Virajpet Rainbow': 'Zone 3',
  'Virajpet Town': 'Zone 3',
  
  // ZONE 4
  'Bejai': 'Zone 4',
  'Kadri': 'Zone 4',
  'Kodagu Central': 'Zone 4',
  'Kodialbail Giri': 'Zone 4',
  'Madanthyar': 'Zone 4',
  'Mangalore Bunts Hostel': 'Zone 4',
  'Mangalore Centeal': 'Zone 4',
  'Mangalore East': 'Zone 4',
  'Mangalore Port': 'Zone 4',
  'Mangalore South': 'Zone 4',
  'Udupi Indrali': 'Zone 4',
  
  // ZONE 5
  'Kushalnagar': 'Zone 5',
  'Kushalnagar City': 'Zone 5',
  'Mangalore Kudmul Ranga Rao Nagar': 'Zone 5',
  'Mangalore Valencia': 'Zone 5',
  'Mangaluru Jyothi': 'Zone 5',
  'Manipal': 'Zone 5',
  'Mudigere': 'Zone 5',
  'Panambur': 'Zone 5',
  'Surathkal Srinivas Nagar': 'Zone 5',
  'Ullal': 'Zone 5',
  
  // ZONE 6
  'Kundapur': 'Zone 6',
  'Kundapur Coastal': 'Zone 6',
  'Kundapur South': 'Zone 6',
  'Thokur': 'Zone 6',
  'Udupi': 'Zone 6',
  'Udupi Bay Chaitanya': 'Zone 6',
  'Udupi Lakshmi Thota': 'Zone 6',
  'Udupi Lakshmi Tota': 'Zone 6',
  'Udupi Midtown': 'Zone 6',
  
  // ZONE 7
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
  
  // ZONE 8
  'Bannur': 'Zone 8',
  'Hassan': 'Zone 8',
  'Hassan Araleshwar': 'Zone 8',
  'Holenarasipura': 'Zone 8',
  'K R Nagar': 'Zone 8',
  'Kollegal': 'Zone 8',
  'Madikeri Midtown': 'Zone 8',
  'Mandya': 'Zone 8',
  'Mandya Crown': 'Zone 8',
  'Malavalli': 'Zone 8',
  'Malavalli Somapura': 'Zone 8',
  'Nanjangud': 'Zone 8',
  'Nagamangala': 'Zone 8',
  'Pandavapura': 'Zone 8',
  'Chamarajanagar': 'Zone 8'
};

// Function to get zone for a club
function getZoneForClub(clubName) {
  if (!clubName) return 'Unmapped';
  
  // Exact match
  if (ZONE_MAPPING[clubName]) {
    return ZONE_MAPPING[clubName];
  }
  
  // Case-insensitive match
  const normalizedClubName = clubName.trim();
  for (const [club, zone] of Object.entries(ZONE_MAPPING)) {
    if (club.toLowerCase() === normalizedClubName.toLowerCase()) {
      return zone;
    }
  }
  
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
