#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { query } = require('./lib/db-neon');
const { getClubMemberCount } = require('./lib/zone-mapping');

async function checkTallyMismatch() {
  console.log('🔍 TALLY MISMATCH REPORT\n');
  console.log('Comparing database registrations with expected totals...\n');
  
  try {
    // Get all registrations
    const allRegs = await query(`
      SELECT registration_id, name, club, zone, payment_status 
      FROM registrations 
      ORDER BY zone, club
    `);
    
    console.log(`📊 TOTAL DATABASE REGISTRATIONS: ${allRegs.rows.length}\n`);
    
    // Filter out test entries
    const validRegs = allRegs.rows.filter(r => {
      return r.payment_status !== 'test' && r.payment_status !== 'manual-B';
    });
    
    console.log(`✅ VALID REGISTRATIONS (excluding test): ${validRegs.length}\n`);
    console.log(`🧪 TEST REGISTRATIONS: ${allRegs.rows.length - validRegs.length}\n`);
    
    // Group by zone
    const zoneGroups = {};
    validRegs.forEach(r => {
      const zone = r.zone || 'Unmapped';
      if (!zoneGroups[zone]) {
        zoneGroups[zone] = { regs: [], clubs: {} };
      }
      zoneGroups[zone].regs.push(r);
      
      const club = r.club || 'Unknown';
      if (!zoneGroups[zone].clubs[club]) {
        zoneGroups[zone].clubs[club] = { count: 0, members: getClubMemberCount(club) };
      }
      zoneGroups[zone].clubs[club].count++;
    });
    
    // Sort zones
    const sortedZones = Object.keys(zoneGroups).sort((a, b) => {
      if (a === 'Unmapped') return 1;
      if (b === 'Unmapped') return -1;
      
      const extractNum = (z) => {
        const match = z.match(/Zone\s+(\d+)([A-Z])?/i);
        if (!match) return [0, ''];
        return [parseInt(match[1]), match[2] || ''];
      };
      const [numA, suffixA] = extractNum(a);
      const [numB, suffixB] = extractNum(b);
      if (numA !== numB) return numA - numB;
      return suffixA.localeCompare(suffixB);
    });
    
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('ZONE-WISE BREAKDOWN\n');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    let totalRegs = 0;
    let totalMembers = 0;
    
    sortedZones.forEach(zone => {
      const data = zoneGroups[zone];
      const zoneRegs = data.regs.length;
      const zoneMembers = Object.values(data.clubs).reduce((sum, c) => sum + c.members, 0);
      const zonePerc = zoneMembers > 0 ? ((zoneRegs / zoneMembers) * 100).toFixed(1) : '0.0';
      
      totalRegs += zoneRegs;
      totalMembers += zoneMembers;
      
      console.log(`${zone}:`);
      console.log(`  Registrations: ${zoneRegs}`);
      console.log(`  Total Members: ${zoneMembers}`);
      console.log(`  Percentage: ${zonePerc}%`);
      console.log(`  Clubs: ${Object.keys(data.clubs).length}\n`);
      
      // Show club breakdown
      const sortedClubs = Object.entries(data.clubs).sort((a, b) => {
        const percA = a[1].members > 0 ? (a[1].count / a[1].members) * 100 : 0;
        const percB = b[1].members > 0 ? (b[1].count / b[1].members) * 100 : 0;
        return percB - percA;
      });
      
      sortedClubs.forEach(([club, stats], idx) => {
        const perc = stats.members > 0 ? ((stats.count / stats.members) * 100).toFixed(1) : '0.0';
        console.log(`    ${idx + 1}. ${club}: ${stats.count}/${stats.members} (${perc}%)`);
      });
      console.log('');
    });
    
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('SUMMARY\n');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`Total Registrations: ${totalRegs}`);
    console.log(`Total Members: ${totalMembers}`);
    console.log(`Overall Percentage: ${totalMembers > 0 ? ((totalRegs / totalMembers) * 100).toFixed(1) : '0.0'}%\n`);
    
    // Check for clubs with 0 members
    console.log('⚠️  CLUBS WITH MISSING MEMBER DATA:\n');
    let missingCount = 0;
    sortedZones.forEach(zone => {
      const clubs = zoneGroups[zone].clubs;
      Object.entries(clubs).forEach(([club, stats]) => {
        if (stats.members === 0) {
          console.log(`  ${zone} → ${club}: ${stats.count} registrations but 0 members on record`);
          missingCount++;
        }
      });
    });
    
    if (missingCount === 0) {
      console.log('  ✅ All clubs have member data');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════\n');
    
    // Check for potential issues
    console.log('🔍 POTENTIAL ISSUES:\n');
    
    // Issue 1: Clubs with suspiciously low percentages
    console.log('Clubs with < 5% registration rate:');
    let lowPercentageCount = 0;
    sortedZones.forEach(zone => {
      const clubs = zoneGroups[zone].clubs;
      Object.entries(clubs).forEach(([club, stats]) => {
        if (stats.members > 0) {
          const perc = (stats.count / stats.members) * 100;
          if (perc < 5 && perc > 0) {
            console.log(`  ${zone} → ${club}: ${stats.count}/${stats.members} (${perc.toFixed(1)}%)`);
            lowPercentageCount++;
          }
        }
      });
    });
    if (lowPercentageCount === 0) {
      console.log('  ✅ No clubs with unusually low percentages');
    }
    
    console.log('');
    
    // Issue 2: Clubs with > 100% registration
    console.log('Clubs with > 100% registration rate (more registrations than members):');
    let overCount = 0;
    sortedZones.forEach(zone => {
      const clubs = zoneGroups[zone].clubs;
      Object.entries(clubs).forEach(([club, stats]) => {
        if (stats.members > 0) {
          const perc = (stats.count / stats.members) * 100;
          if (perc > 100) {
            console.log(`  ${zone} → ${club}: ${stats.count}/${stats.members} (${perc.toFixed(1)}%)`);
            overCount++;
          }
        }
      });
    });
    if (overCount === 0) {
      console.log('  ✅ No clubs exceed 100% registration');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkTallyMismatch();
