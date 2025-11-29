const { ZONE_MAPPING, CLUB_MEMBERS, ZONE_CLUBS, CLUB_NAME_MAPPING } = require('../../lib/zone-mapping');

module.exports = async (req, res) => {
    try {
        // Set cache control for performance (cache for 1 hour)
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

        res.status(200).json({
            success: true,
            data: {
                ZONE_MAPPING,
                CLUB_MEMBERS,
                ZONE_CLUBS: getZoneClubsFromMapping(ZONE_MAPPING), // Ensure this is derived if not exported directly
                CLUB_ALIASES: CLUB_NAME_MAPPING
            }
        });
    } catch (error) {
        console.error('Error serving zone data:', error);
        res.status(500).json({ success: false, error: 'Failed to load zone data' });
    }
};

// Helper to reconstruct ZONE_CLUBS if not strictly exported or to ensure structure
// The lib/zone-mapping.js exports getClubsInZone but maybe not the raw object in the format we want
// Let's look at lib/zone-mapping.js again to be sure what it exports.
// It exports: ZONE_MAPPING, CLUB_MEMBERS, getZoneForClub, getClubsInZone, getAllZones, getClubMemberCount, normalizeClubName
// It does NOT export ZONE_CLUBS directly as a constant map of Zone -> [Clubs].
// So we should generate it here to send a clean object to frontend.

function getZoneClubsFromMapping(mapping) {
    const zoneClubs = {};

    // Invert the mapping: Club -> Zone  ===>  Zone -> [Clubs]
    for (const [club, zone] of Object.entries(mapping)) {
        if (!zoneClubs[zone]) {
            zoneClubs[zone] = [];
        }
        zoneClubs[zone].push(club);
    }

    // Sort clubs alphabetically within each zone
    for (const zone in zoneClubs) {
        zoneClubs[zone].sort();
    }

    return zoneClubs;
}
