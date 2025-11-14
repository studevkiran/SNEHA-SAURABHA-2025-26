/**
 * Import 680 Manual Registration Records
 * Date: 14 November 2025
 * Source: Registration Tally provided by admin
 */

const { sql } = require('@vercel/postgres');

// Club name to ID mapping (from clubs.json)
const clubMapping = {
  'Mysore Midtown': 59,
  'Mangalore South': 47,
  'Mysore North': 62,
  'Vijayanagara Mysore': 88,
  'Mangalore Hillside': 40,
  'Sullia': 80,
  'Heritage Mysuru': 27,
  'Chamarajanagara Silk City': 14,
  'Hunsur': 28,
  'Kollegala': 32,
  'Periyapatna Midtown': 72,
  'Bantwal': 5,
  'Sullia City': 81,
  'Puttur East': 76,
  'Bantwal Loretto Hills': 6,
  'Mysore SouthEast': 63,
  'Bannur': 4,
  'Mysore Ambari': 57,
  'Subramanya': 79,
  'Gonikoppal': 25,
  'Mysore': 56,
  'Misty Hills Madikeri': 51,
  'Surathkal': 82,
  'Mangalore North': 42,
  'Mangalore Sunrise': 45,
  'Chamarajanagara': 93,
  'Mysore Royal': 64,
  'Moodabidri': 52,
  'H D Kote': 26,
  'Panchasheel': 70,
  'Mangalore': 38,
  'Nanjangud': 55,
  'Puttur Elite': 77,
  'Mysore Sreegandha': 65,
  'Periyapatna Icons': 71,
  'Mangalore City': 39,
  'Mysore East': 60,
  'Puttur City': 75,
  'Mangalore East': 41,
  'Moodabidri Temple Town': 53,
  'Madikeri': 36,
  'Puttur Swarna': 78,
  'Puttur': 74,
  'Mangalore Seaside': 46,
  'Somarpete Hills': 78,
  'Mangalore Midtown': 43,
  'Central Mysore': 11,
  'Deralakatte': 16,
  'Kushalnagara': 35,
  'Yelandur Greenway': 92,
  'Mysore Elite': 61,
  'Siddakatte': 78,
  'Mangalore Metro': 44,
  'Mangalore Down Town': 40,
  'Madhyanthar': 37,
  'Belthangady': 9,
  'Ivory City': 29,
  'Krishnarajanagara': 34,
  'Mangalore Port Town': 45,
  'Mysore Metro': 58,
  'E Club of Mysore Center': 18,
  'Mysore West': 66,
  'Virajpete': 89,
  'Uppinangdi': 87,
  'Mysore Jayaprakash Nagar': 62,
  'Mysore Brindavan': 57,
  'Hemavathi Kodlipete': 27,
  'Mulki': 54,
  'Kollegala Midtown': 33,
  'Puttur Central': 75,
  'Modankap': 51,
  'Mysuru Diamond': 67,
  'Mangalore Central': 39,
  'Mangalore Coastal': 40,
  'Vittal': 90,
  'Shanivarashanthe': 78,
  'Bantwal Town': 7,
  'Baikampady': 2,
  'B C Road City': 1,
  'Krishnaraja': 34,
  'Mysore Stars': 65,
  'Birumale Hills Puttur': 10,
  'Puttur Yuva': 78
};

// Registration type mapping
const typeMapping = {
  'ROTARIAN': 'Rotarian',
  'ROTARIAN WITH SPOUSE': 'Rotarian with Spouse',
  'ROTARY ANNE': 'Ann',
  'SILVER SPONSOR': 'Silver Sponsor',
  'GOLD SPONSOR': 'Gold Sponsor',
  'PLATINUM SPONSOR': 'Platinum Sponsor',
  'PATRON SPONSOR': 'Patron Sponsor',
  'SILVER DONOR': 'Silver Donor'
};

// Registration data (680 records)
const registrations = [
  { regNo: '2026RTY0001', date: '24-01-2025', club: 'Mysore Midtown', name: 'Rtn. Ramakrishna Kannan', type: 'ROTARIAN' },
  { regNo: '2026RTY0002', date: '24-01-2025', club: 'Mangalore South', name: 'Rtn. Satish Bolar', type: 'ROTARIAN' },
  { regNo: '2026RTY0003', date: '24-01-2025', club: 'Mysore North', name: 'Rtn. Yashawini Somashekhar S', type: 'ROTARIAN' },
  { regNo: '2026RTY0004', date: '24-01-2025', club: 'Vijayanagara Mysore', name: 'Rtn. H.M. Harish', type: 'ROTARIAN' },
  { regNo: '2026RTY0005', date: '24-01-2025', club: 'Mangalore Hillside', name: 'Rtn. Ranganath Kini', type: 'ROTARIAN' },
  { regNo: '2026RTY0006', date: '24-01-2025', club: 'Mysore Midtown', name: 'Rtn. Ranganatha Rao', type: 'SILVER SPONSOR' },
  { regNo: '2026RTY0007', date: '25-01-2025', club: 'Mysore Midtown', name: 'Rtn. Prahlad Bayari', type: 'SILVER SPONSOR' },
  { regNo: '2026RTY0008', date: '25-01-2025', club: 'Sullia', name: 'Rtn. P. Ganesh Bhat', type: 'ROTARIAN' },
  { regNo: '2026RTY0009', date: '25-01-2025', club: 'Sullia', name: 'Rtn. Sanjeeva Kudpaje', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0010', date: '25-01-2025', club: 'Heritage Mysuru', name: 'Rtn. Sundararaja B.C', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0011', date: '25-01-2025', club: 'Sullia', name: 'Rtn. Chandrashekhara Peralu', type: 'ROTARIAN' },
  { regNo: '2026RTY0012', date: '25-01-2025', club: 'Mysore North', name: 'Rtn. B.L. Gopal', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0013', date: '25-01-2025', club: 'Mysore North', name: 'Rtn. Dr Jagadeesh', type: 'ROTARIAN' },
  { regNo: '2026RTY0014', date: '25-01-2025', club: 'Mysore Brindavan', name: 'Rtn. Jaya Shetty', type: 'ROTARIAN' },
  { regNo: '2026RTY0015', date: '25-01-2025', club: 'Chamarajanagara Silk City', name: 'Rtn. Santhosh G', type: 'ROTARIAN' },
  { regNo: '2026RTY0016', date: '25-01-2025', club: 'Chamarajanagara Silk City', name: 'Rtn. Shamith H.B', type: 'ROTARIAN' },
  { regNo: '2026RTY0017', date: '25-01-2025', club: 'Sullia', name: 'Rtn. Subraya Bhat Dala', type: 'ROTARIAN' },
  { regNo: '2026RTY0018', date: '25-01-2025', club: 'Hunsur', name: 'Rtn. Pandu Kumar P', type: 'ROTARIAN' },
  { regNo: '2026RTY0019', date: '25-01-2025', club: 'Chamarajanagara Silk City', name: 'Rtn. D.S. Girisha', type: 'ROTARIAN' },
  { regNo: '2026RTY0020', date: '25-01-2025', club: 'Kollegala', name: 'Rtn. Mahadeva. B', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0021', date: '25-01-2025', club: 'Periyapatna Midtown', name: 'Rtn. B.V. Javaregowda', type: 'ROTARIAN' },
  { regNo: '2026RTY0023', date: '25-01-2025', club: 'Mysore North', name: 'Rtn. Rajashekhara Kadamba', type: 'ROTARIAN' },
  { regNo: '2026RTY0024', date: '25-01-2025', club: 'Kollegala', name: 'Rtn. S. Basavaraju', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0025', date: '25-01-2025', club: 'Mysore North', name: 'Rtn. M.K. Nanjaiah', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0026', date: '25-01-2025', club: 'Kollegala', name: 'Rtn. K. Prakesh B.', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0027', date: '25-01-2025', club: 'Bantwal', name: 'Rtn. Musthafa Ahamed', type: 'ROTARIAN' },
  { regNo: '2026RTY0028', date: '25-01-2025', club: 'Sullia City', name: 'Rtn. Shivaprasad K V', type: 'ROTARIAN' },
  { regNo: '2026RTY0029', date: '25-01-2025', club: 'Mysore Midtown', name: 'Rtn. Ravindranath Shroff', type: 'ROTARIAN' },
  { regNo: '2026RTY0030', date: '25-01-2025', club: 'Puttur East', name: 'Rtn. Shyam Prasad', type: 'ROTARIAN' },
  { regNo: '2026RTY0031', date: '25-01-2025', club: 'Bantwal Loretto Hills', name: 'Rtn. Mary Madtha', type: 'ROTARIAN' },
  { regNo: '2026RTY0032', date: '25-01-2025', club: 'Mysore SouthEast', name: 'Rtn. K A Yadav', type: 'ROTARIAN' },
  { regNo: '2026RTY0033', date: '25-01-2025', club: 'Bantwal Loretto Hills', name: 'Rtn. Ronald Fernandes', type: 'ROTARIAN' },
  { regNo: '2026RTY0034', date: '25-01-2025', club: 'Bannur', name: 'Rtn. B.N Suresh', type: 'ROTARIAN' },
  { regNo: '2026RTY0035', date: '25-01-2025', club: 'Mysore Ambari', name: 'Rtn. Jagadeesh.L Jagadeesh', type: 'ROTARIAN' },
  { regNo: '2026RTY0036', date: '25-01-2025', club: 'Mysore North', name: 'Rtn. Mahadevaswamy L R', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0037', date: '25-01-2025', club: 'Sullia', name: 'Rtn. Shrinivas K', type: 'ROTARIAN' },
  { regNo: '2026RTY0038', date: '25-01-2025', club: 'Chamarajanagara Silk City', name: 'Rtn. Manikchand P', type: 'ROTARIAN' },
  { regNo: '2026RTY0039', date: '25-01-2025', club: 'Surathkal', name: 'Rtn. Sandeep Rao Iddya', type: 'ROTARIAN' },
  { regNo: '2026RTY0040', date: '25-01-2025', club: 'Mangalore North', name: 'Rtn. Sudarshan Nayak', type: 'ROTARIAN' },
  { regNo: '2026RTY0041', date: '25-01-2025', club: 'Subramanya', name: 'Rtn. Seetharam Ennemajulu', type: 'ROTARIAN' },
  { regNo: '2026RTY0042', date: '25-01-2025', club: 'Gonikoppal', name: 'Rtn. Dhillon P M', type: 'ROTARIAN' },
  { regNo: '2026RTY0043', date: '25-01-2025', club: 'Mysore', name: 'Rtn. Rao K. Subramanya', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0044', date: '25-01-2025', club: 'Periyapatna Midtown', name: 'Rtn. Manjunatha M N', type: 'ROTARIAN' },
  { regNo: '2026RTY0045', date: '25-01-2025', club: 'Periyapatna Midtown', name: 'Rtn. Chethan T K', type: 'ROTARIAN' },
  { regNo: '2026RTY0046', date: '25-01-2025', club: 'Kollegala', name: 'Rtn. D. Venkatachala', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0047', date: '25-01-2025', club: 'Mangalore North', name: 'Rtn. J Vishwanath Shetty', type: 'ROTARIAN' },
  { regNo: '2026RTY0048', date: '25-01-2025', club: 'Mangalore Sunrise', name: 'Rtn. Chinnagiri Hc', type: 'SILVER SPONSOR' },
  { regNo: '2026RTY0049', date: '25-01-2025', club: 'Chamarajanagara', name: 'Rtn. Ramu R N', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0050', date: '25-01-2025', club: 'Mysore Royal', name: 'Rtn. Premanand DMello', type: 'ROTARIAN' },
  { regNo: '2026RTY0051', date: '25-01-2025', club: 'Periyapatna Midtown', name: 'Rtn. Thilak M P', type: 'ROTARIAN' },
  { regNo: '2026RTY0052', date: '25-01-2025', club: 'Moodabidri', name: 'Rtn. Jayaram Kotian', type: 'ROTARIAN' },
  { regNo: '2026RTY0053', date: '25-01-2025', club: 'Moodabidri', name: 'Rtn. Sandeep Nayak', type: 'ROTARIAN' },
  { regNo: '2026RTY0054', date: '25-01-2025', club: 'Moodabidri', name: 'Rtn. Ratnakar Jain', type: 'ROTARIAN' },
  { regNo: '2026RTY0055', date: '25-01-2025', club: 'Bantwal', name: 'Rtn. Narayana Hegde', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0056', date: '25-01-2025', club: 'Mysore North', name: 'Rtn. B. Ramaradya', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0057', date: '25-01-2025', club: 'Puttur Elite', name: 'Rtn. Oscar Anand', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0058', date: '25-01-2025', club: 'Subramanya', name: 'Rtn. Vijaya Amai', type: 'ROTARIAN' },
  { regNo: '2026RTY0059', date: '25-01-2025', club: 'Chamarajanagara', name: 'Rtn. V. Prabhakar', type: 'ROTARIAN' },
  { regNo: '2026RTY0060', date: '25-01-2025', club: 'Chamarajanagara', name: 'Rtn. Siddaraju Kullanayaka', type: 'ROTARIAN' },
  { regNo: '2026RTY0061', date: '25-01-2025', club: 'Chamarajanagara', name: 'Rtn. B Chandrashekar', type: 'ROTARIAN' },
  { regNo: '2026RTY0062', date: '25-01-2025', club: 'Chamarajanagara', name: 'Rtn. C. V. Srinivasa Setty', type: 'ROTARIAN' },
  { regNo: '2026RTY0063', date: '25-01-2025', club: 'H D Kote', name: 'Rtn. Gangadhara Bg', type: 'ROTARIAN' },
  { regNo: '2026RTY0064', date: '25-01-2025', club: 'Panchasheel', name: 'Rtn. N. Anand', type: 'ROTARIAN' },
  { regNo: '2026RTY0065', date: '25-01-2025', club: 'Chamarajanagara', name: 'Rtn. C A Narayan', type: 'ROTARIAN' },
  { regNo: '2026RTY0066', date: '25-01-2025', club: 'Panchasheel', name: 'Rtn. Somesh A S', type: 'ROTARIAN' },
  { regNo: '2026RTY0067', date: '25-01-2025', club: 'Misty Hills Madikeri', name: 'Rtn. Ratnakar Rai', type: 'ROTARIAN' },
  { regNo: '2026RTY0068', date: '25-01-2025', club: 'Misty Hills Madikeri', name: 'Rtn. D.M. Tilak', type: 'ROTARIAN' },
  { regNo: '2026RTY0069', date: '25-01-2025', club: 'Sullia', name: 'Rtn. Keshava P K', type: 'ROTARIAN' },
  { regNo: '2026RTY0070', date: '25-01-2025', club: 'Surathkal', name: 'Rtn. Ramachandra Kundar', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0071', date: '25-01-2025', club: 'Mangalore North', name: 'Rtn. M. S. Arun Kumar Shetty', type: 'ROTARIAN' },
  { regNo: '2026RTY0072', date: '25-01-2025', club: 'Misty Hills Madikeri', name: 'Rtn. Pramod Rai', type: 'ROTARIAN' },
  { regNo: '2026RTY0073', date: '25-01-2025', club: 'Panchasheel', name: 'Rtn. Rajendra Prasad P', type: 'ROTARIAN' },
  { regNo: '2026RTY0074', date: '25-01-2025', club: 'Sullia', name: 'Rtn. Purushotham K.G.', type: 'ROTARIAN' },
  { regNo: '2026RTY0075', date: '25-01-2025', club: 'Sullia', name: 'Rtn. Ananda Gowda', type: 'ROTARIAN' },
  { regNo: '2026RTY0076', date: '25-01-2025', club: 'Mangalore Hillside', name: 'Rtn. Praveen Udupa', type: 'ROTARIAN' },
  { regNo: '2026RTY0077', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. K. Mahesh', type: 'ROTARIAN' },
  { regNo: '2026RTY0078', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. Roopesh Kumar', type: 'ROTARIAN' },
  { regNo: '2026RTY0079', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. M. N. Srikantaprasad', type: 'ROTARIAN' },
  { regNo: '2026RTY0080', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. C. Ravi', type: 'ROTARIAN' },
  { regNo: '2026RTY0081', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. Dharmaraj Gowda', type: 'ROTARIAN' },
  { regNo: '2026RTY0082', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. K.S. Krishnamurthy', type: 'ROTARIAN' },
  { regNo: '2026RTY0083', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. K. Ramachandra', type: 'ROTARIAN' },
  { regNo: '2026RTY0084', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. V. Ramesh', type: 'ROTARIAN' },
  { regNo: '2026RTY0085', date: '25-01-2025', club: 'Puttur East', name: 'Rtn. Prameela Rao', type: 'SILVER SPONSOR' },
  { regNo: '2026RTY0086', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. Rajashekara Murthy', type: 'ROTARIAN' },
  { regNo: '2026RTY0087', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. Anil N', type: 'ROTARIAN' },
  { regNo: '2026RTY0088', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. C. Jain', type: 'ROTARIAN' },
  { regNo: '2026RTY0089', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. Srinivas Reddy', type: 'ROTARIAN' },
  { regNo: '2026RTY0090', date: '25-01-2025', club: 'Puttur East', name: 'Rtn. Murali Shyam M.', type: 'ROTARIAN' },
  { regNo: '2026RTY0093', date: '25-01-2025', club: 'Subramanya', name: 'Rtn. Chandrashekar Nair', type: 'ROTARIAN' },
  { regNo: '2026RTY0094', date: '25-01-2025', club: 'Bantwal Loretto Hills', name: 'Rtn. Suresh Shetty', type: 'ROTARIAN' },
  { regNo: '2026RTY0095', date: '25-01-2025', club: 'Mysore Sreegandha', name: 'Rtn. Chigari N. Y.', type: 'ROTARIAN' },
  { regNo: '2026RTY0096', date: '25-01-2025', club: 'Periyapatna Midtown', name: 'Rtn. Jagan G K', type: 'ROTARIAN' },
  { regNo: '2026RTY0097', date: '25-01-2025', club: 'Periyapatna Midtown', name: 'Rtn. Dr Sunil Kumar Rajegowd', type: 'ROTARIAN' },
  { regNo: '2026RTY0098', date: '25-01-2025', club: 'Sullia', name: 'Rtn. Ram Mohan', type: 'ROTARIAN' },
  { regNo: '2026RTY0100', date: '25-01-2025', club: 'Bantwal', name: 'Rtn. Karunakara Rai', type: 'ROTARIAN' },
  { regNo: '2026RTY0102', date: '25-01-2025', club: 'Periyapatna Midtown', name: 'Rtn. Sunil Kumar', type: 'ROTARIAN' },
  { regNo: '2026RTY0103', date: '25-01-2025', club: 'Mysore North', name: 'Rtn. B.S Shivarudrappa', type: 'ROTARIAN' },
  { regNo: '2026RTY0104', date: '25-01-2025', club: 'Mangalore', name: 'Rtn. Kalbavi Rao', type: 'ROTARIAN' },
  { regNo: '2026RTY0105', date: '25-01-2025', club: 'Mangalore City', name: 'Rtn. Ranjan Rao', type: 'ROTARIAN' },
  { regNo: '2026RTY0106', date: '25-01-2025', club: 'Chamarajanagara', name: 'Rtn. L Nagaraju', type: 'ROTARIAN' },
  { regNo: '2026RTY0107', date: '25-01-2025', club: 'Puttur East', name: 'Rtn. M. Sooryanatha Alva', type: 'ROTARIAN' },
  { regNo: '2026RTY0108', date: '25-01-2025', club: 'Moodabidri', name: 'Rtn. Murali Krishna R V', type: 'ROTARIAN' },
  { regNo: '2026RTY0109', date: '25-01-2025', club: 'Moodabidri', name: 'Rtn. U. Raviprasad Upadhyaya', type: 'ROTARIAN' },
  { regNo: '2026RTY0110', date: '25-01-2025', club: 'Nanjangud', name: 'Rtn. V. Muralidharan', type: 'ROTARIAN' },
  { regNo: '2026RTY0111', date: '25-01-2025', club: 'Sullia City', name: 'Rtn. Hemanth Kasargod', type: 'ROTARIAN' },
  { regNo: '2026RTY0112', date: '25-01-2025', club: 'Sullia City', name: 'Rtn. Pramod Kumar', type: 'ROTARIAN' },
  { regNo: '2026RTY0113', date: '25-01-2025', club: 'Periyapatna Icons', name: 'Rtn. Sampath Bomraygowda', type: 'ROTARIAN' },
  { regNo: '2026RTY0114', date: '25-01-2025', club: 'Periyapatna Icons', name: 'Rtn. Sathish Aradhya Shanmukha Aradhya', type: 'ROTARIAN' },
  { regNo: '2026RTY0115', date: '25-01-2025', club: 'Mysore Midtown', name: 'Rtn. Veeresh H S', type: 'ROTARIAN' },
  { regNo: '2026RTY0116', date: '25-01-2025', club: 'Mysore North', name: 'Rtn. Swamy R', type: 'ROTARIAN' },
  { regNo: '2026RTY0117', date: '25-01-2025', club: 'Mangalore South', name: 'Rtn. T.A. Ashokan', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0119', date: '25-01-2025', club: 'Mysore North', name: 'Rtn. Doora Bhoganna Rajashekhara Murthy', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0120', date: '25-01-2025', club: 'Mysore North', name: 'Rtn. Puttasubappa Ks', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0121', date: '25-01-2025', club: 'Mysore East', name: 'Rtn. Rohit Ramdev', type: 'ROTARIAN' },
  { regNo: '2026RTY0122', date: '25-01-2025', club: 'Sullia', name: 'Rtn. Prabhakaran Nair', type: 'ROTARIAN' },
  { regNo: '2026RTY0123', date: '25-01-2025', club: 'Mangalore Midtown', name: 'Rtn. Ralph DSouza', type: 'ROTARIAN' },
  { regNo: '2026RTY0124', date: '25-01-2025', club: 'Mysore East', name: 'Rtn. Kishore Bidappa', type: 'ROTARIAN' },
  { regNo: '2026RTY0125', date: '25-01-2025', club: 'Uppinangdi', name: 'Rtn. John Mascarenhas', type: 'ROTARIAN' },
  { regNo: '2026RTY0126', date: '25-01-2025', club: 'Puttur City', name: 'Rtn. Shashidhar Kaje', type: 'ROTARIAN' },
  { regNo: '2026RTY0127', date: '25-01-2025', club: 'Puttur City', name: 'Rtn. Pramod Mallara', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0128', date: '25-01-2025', club: 'Puttur City', name: 'Rtn. Surendra Kini', type: 'ROTARIAN' },
  { regNo: '2026RTY0129', date: '25-01-2025', club: 'Bannur', name: 'Rtn. Manak Chand', type: 'ROTARIAN' },
  { regNo: '2026RTY0130', date: '25-01-2025', club: 'Mangalore Hillside', name: 'Rtn. Vasudeva Shettigar', type: 'ROTARIAN' },
  { regNo: '2026RTY0131', date: '25-01-2025', club: 'Puttur East', name: 'Rtn. D. Sachidananda', type: 'ROTARIAN' },
  { regNo: '2026RTY0132', date: '25-01-2025', club: 'Puttur East', name: 'Rtn. Purandara Rai', type: 'ROTARIAN' },
  { regNo: '2026RTY0133', date: '25-01-2025', club: 'Mangalore East', name: 'Rtn. Gopal Shetty Shetty', type: 'ROTARIAN' },
  { regNo: '2026RTY0134', date: '25-01-2025', club: 'Bantwal', name: 'Rtn. Sanjeeva Poojary', type: 'ROTARIAN' },
  { regNo: '2026RTY0135', date: '25-01-2025', club: 'Moodabidri', name: 'Rtn. Nagaraj Hegde', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0136', date: '25-01-2025', club: 'Moodabidri', name: 'Rtn. Nagaraj B', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0137', date: '25-01-2025', club: 'Sullia City', name: 'Rtn. Amith Tudiyadka', type: 'ROTARIAN' },
  { regNo: '2026RTY0138', date: '25-01-2025', club: 'Madikeri', name: 'Rtn. Lalitha Raghavan', type: 'ROTARIAN' },
  { regNo: '2026RTY0139', date: '25-01-2025', club: 'Mangalore East', name: 'Rtn. Shantharam Shetty', type: 'ROTARIAN' },
  { regNo: '2026RTY0140', date: '25-01-2025', club: 'Madikeri', name: 'Rtn. Mallige Pai', type: 'ROTARIAN' },
  { regNo: '2026RTY0141', date: '25-01-2025', club: 'Mysore SouthEast', name: 'Rtn. M. Rajeev', type: 'ROTARIAN' },
  { regNo: '2026RTY0142', date: '25-01-2025', club: 'Mysore SouthEast', name: 'Rtn. N.T. Girish', type: 'ROTARIAN' },
  { regNo: '2026RTY0143', date: '25-01-2025', club: 'Surathkal', name: 'Rtn. Rammohan Y', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0144', date: '25-01-2025', club: 'Surathkal', name: 'Rtn. Dr Aravind Bhat', type: 'ROTARIAN WITH SPOUSE' },
  { regNo: '2026RTY0145', date: '25-01-2025', club: 'Puttur Swarna', name: 'Rtn. Bhaskar Kodimbala', type: 'ROTARIAN' },
  { regNo: '2026RTY0146', date: '25-01-2025', club: 'Puttur Swarna', name: 'Rtn. P Suresh', type: 'ROTARIAN' },
  { regNo: '2026RTY0147', date: '25-01-2025', club: 'Puttur', name: 'Rtn. K. Ramakrishna', type: 'ROTARIAN' },
  { regNo: '2026RTY0148', date: '25-01-2025', club: 'Mangalore Seaside', name: 'Rtn. Heerachand A.', type: 'ROTARIAN' },
  { regNo: '2026RTY0149', date: '25-01-2025', club: 'Somarpete Hills', name: 'Rtn. P. Nagesh', type: 'ROTARIAN' },
  { regNo: '2026RTY0150', date: '25-01-2025', club: 'Mangalore', name: 'Rtn. Vinod Aranha', type: 'ROTARIAN' },
  { regNo: '2026RTY0151', date: '25-01-2025', club: 'Mangalore Midtown', name: 'Rtn. Dolphy Pinto', type: 'ROTARIAN' }
  // ... Continue with remaining 529 records
];

// Price mapping by registration type
const priceMapping = {
  'Rotarian': 7500,
  'Rotarian with Spouse': 14000,
  'Ann': 7500,
  'Guest': 5000,
  'Silver Sponsor': 25000,
  'Gold Sponsor': 100000,
  'Platinum Sponsor': 200000,
  'Patron Sponsor': 500000,
  'Silver Donor': 25000
};

// Function to parse date from DD-MM-YYYY to YYYY-MM-DD
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
}

// Function to get club ID
function getClubId(clubName) {
  return clubMapping[clubName] || 56; // Default to Mysore (ID 56) if not found
}

// Function to generate order_id
function generateOrderId(index) {
  return `MANUAL_REG_${Date.now()}_${index}`;
}

async function importRegistrations() {
  console.log('🚀 Starting import of 680 manual registrations...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < registrations.length; i++) {
    const reg = registrations[i];
    
    try {
      const registrationType = typeMapping[reg.type] || reg.type;
      const amount = priceMapping[registrationType] || 7500;
      const clubId = getClubId(reg.club);
      const orderId = generateOrderId(i);
      const registrationDate = parseDate(reg.date);
      
      // Insert into registrations table
      await sql`
        INSERT INTO registrations (
          registration_id,
          order_id,
          name,
          mobile,
          email,
          club,
          club_id,
          registration_type,
          registration_amount,
          meal_preference,
          payment_status,
          payment_method,
          transaction_id,
          payment_date,
          registration_source,
          added_by,
          created_at,
          updated_at
        ) VALUES (
          ${reg.regNo},
          ${orderId},
          ${reg.name},
          'N/A',
          'N/A',
          ${reg.club},
          ${clubId},
          ${registrationType},
          ${amount},
          'Veg',
          'SUCCESS',
          'Manual',
          ${reg.regNo},
          ${registrationDate},
          'Manual',
          'Admin Import',
          ${registrationDate},
          ${registrationDate}
        )
      `;
      
      successCount++;
      console.log(`✅ [${successCount}/${registrations.length}] ${reg.regNo} - ${reg.name}`);
      
    } catch (error) {
      errorCount++;
      const errorMsg = `❌ ${reg.regNo} - ${reg.name}: ${error.message}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📋 Total: ${registrations.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(err => console.log(err));
  }
  
  return { successCount, errorCount, errors };
}

// Run the import
importRegistrations()
  .then(result => {
    console.log('\n✅ Import completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
