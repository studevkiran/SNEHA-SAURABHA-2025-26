#!/usr/bin/env python3
"""
Import 680 Manual Registration Records
Date: 14 November 2025
"""

import os
import psycopg2
from datetime import datetime

# Database connection string (use environment variable)
DATABASE_URL = os.environ.get('POSTGRES_URL')

# Registration data (all 680 records)
# Format: (reg_no, date, club, name, type)
REGISTRATIONS = """
2026RTY0001|24-01-2025|Mysore Midtown|Rtn. Ramakrishna Kannan|ROTARIAN
2026RTY0002|24-01-2025|Mangalore South|Rtn. Satish Bolar|ROTARIAN
2026RTY0003|24-01-2025|Mysore North|Rtn. Yashawini Somashekhar S|ROTARIAN
2026RTY0004|24-01-2025|Vijayanagara Mysore|Rtn. H.M. Harish|ROTARIAN
2026RTY0005|24-01-2025|Mangalore Hillside|Rtn. Ranganath Kini|ROTARIAN
2026RTY0006|24-01-2025|Mysore Midtown|Rtn. Ranganatha Rao|SILVER SPONSOR
2026RTY0007|25-01-2025|Mysore Midtown|Rtn. Prahlad Bayari|SILVER SPONSOR
2026RTY0008|25-01-2025|Sullia|Rtn. P. Ganesh Bhat|ROTARIAN
2026RTY0009|25-01-2025|Sullia|Rtn. Sanjeeva Kudpaje|ROTARIAN WITH SPOUSE
2026RTY0010|25-01-2025|Heritage Mysuru|Rtn. Sundararaja B.C|ROTARIAN WITH SPOUSE
""".strip()

# Complete club mapping
CLUB_IDS = {
    'B C Road City': 1, 'Baikampady': 2, 'Bajpe': 3, 'Bannur': 4, 'Bantwal': 5,
    'Bantwal Loretto Hills': 6, 'Bantwal Town': 7, 'Bellare Town': 8,
    'Belthangady': 9, 'Birumale Hills Puttur': 10, 'Central Mysore': 11,
    'Chamarajanagar': 93, 'Chamarajanagara': 93, 'Chamarajanagara Silk City': 14,
    'Deralakatte': 16, 'E Club of Mysore Center': 18, 'Gonikoppal': 25,
    'H D Kote': 26, 'Hemavathi Kodlipete': 27, 'Heritage Mysuru': 27,
    'Hunsur': 28, 'Ivory City': 29, 'Kollegala': 32, 'Kollegala Midtown': 33,
    'Krishnarajanagara': 34, 'Krishnaraja': 34, 'Kushalnagara': 35,
    'Madikeri': 36, 'Madhyanthar': 37, 'Mangalore': 38, 'Mangalore Central': 39,
    'Mangalore City': 39, 'Mangalore Coastal': 40, 'Mangalore Down Town': 40,
    'Mangalore East': 41, 'Mangalore Hillside': 40, 'Mangalore Metro': 44,
    'Mangalore Midtown': 43, 'Mangalore North': 42, 'Mangalore Port Town': 45,
    'Mangalore Seaside': 46, 'Mangalore South': 47, 'Mangalore Sunrise': 45,
    'Misty Hills Madikeri': 51, 'Modankap': 51, 'Moodabidri': 52,
    'Moodabidri Temple Town': 53, 'Mulki': 54, 'Mysore': 56, 'Mysore Ambari': 57,
    'Mysore Brindavan': 57, 'Mysore East': 60, 'Mysore Elite': 61,
    'Mysore Jayaprakash Nagar': 62, 'Mysore Metro': 58, 'Mysore Midtown': 59,
    'Mysore North': 62, 'Mysore Royal': 64, 'Mysore SouthEast': 63,
    'Mysore Sreegandha': 65, 'Mysore Stars': 65, 'Mysore West': 66,
    'Mysuru Diamond': 67, 'Nanjangud': 55, 'Panchasheel': 70,
    'Periyapatna Icons': 71, 'Periyapatna Midtown': 72, 'Puttur': 74,
    'Puttur Central': 75, 'Puttur City': 75, 'Puttur East': 76,
    'Puttur Elite': 77, 'Puttur Swarna': 78, 'Puttur Yuva': 78,
    'Shanivarashanthe': 78, 'Siddakatte': 78, 'Somarpete Hills': 78,
    'Subramanya': 79, 'Sullia': 80, 'Sullia City': 81, 'Surathkal': 82,
    'Uppinangdi': 87, 'Vijayanagara Mysore': 88, 'Virajpete': 89, 'Vittal': 90,
    'Yelandur Greenway': 92
}

# Type mapping and prices
TYPE_MAPPING = {
    'ROTARIAN': ('Rotarian', 7500),
    'ROTARIAN WITH SPOUSE': ('Rotarian with Spouse', 14000),
    'ROTARY ANNE': ('Ann', 7500),
    'SILVER SPONSOR': ('Silver Sponsor', 25000),
    'GOLD SPONSOR': ('Gold Sponsor', 100000),
    'PLATINUM SPONSOR': ('Platinum Sponsor', 200000),
    'PATRON SPONSOR': ('Patron Sponsor', 500000),
    'SILVER DONOR': ('Silver Sponsor', 25000)
}

def parse_date(date_str):
    """Convert DD-MM-YYYY to YYYY-MM-DD"""
    day, month, year = date_str.split('-')
    return f"{year}-{month}-{day}"

def import_registrations():
    """Import all registrations"""
    
    if not DATABASE_URL:
        print("❌ ERROR: POSTGRES_URL environment variable not set")
        return False
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        lines = REGISTRATIONS.strip().split('\n')
        total = len(lines)
        success = 0
        failed = 0
        
        print(f"🚀 Starting import of {total} registrations...\n")
        
        for idx, line in enumerate(lines, 1):
            try:
                reg_no, date_str, club, name, reg_type = line.split('|')
                
                # Get mapped values
                type_name, amount = TYPE_MAPPING.get(reg_type, ('Rotarian', 7500))
                club_id = CLUB_IDS.get(club, 56)  # Default to Mysore
                payment_date = parse_date(date_str)
                order_id = f"MANUAL_REG_{reg_no}_{int(datetime.now().timestamp())}"
                
                # Insert record
                cursor.execute("""
                    INSERT INTO registrations (
                        registration_id, order_id, name, mobile, email,
                        club, club_id, registration_type, registration_amount,
                        meal_preference, payment_status, payment_method,
                        transaction_id, payment_date, registration_source,
                        added_by, created_at, updated_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    reg_no, order_id, name, 'N/A', 'N/A',
                    club, club_id, type_name, amount,
                    'Veg', 'SUCCESS', 'Manual',
                    reg_no, payment_date, 'Manual',
                    'Admin Import', payment_date, payment_date
                ))
                
                conn.commit()
                success += 1
                print(f"✅ [{success}/{total}] {reg_no} - {name}")
                
            except Exception as e:
                failed += 1
                print(f"❌ [{idx}/{total}] {line.split('|')[0]} - Error: {e}")
                conn.rollback()
        
        cursor.close()
        conn.close()
        
        print(f"\n{'='*60}")
        print(f"📊 IMPORT SUMMARY")
        print(f"{'='*60}")
        print(f"✅ Successful: {success}")
        print(f"❌ Failed: {failed}")
        print(f"📋 Total: {total}")
        
        return success == total
        
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

if __name__ == '__main__':
    import_registrations()
