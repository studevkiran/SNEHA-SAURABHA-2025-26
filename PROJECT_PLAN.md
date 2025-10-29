# 🎯 SNEHA-SAURABHA Admin & Attendance System
## Phase 1 + 2 Implementation Plan

**Project:** Rotary District Conference Registration System  
**Event Date:** 30-31 Jan & 1 Feb 2026  
**Start Date:** 29 Oct 2025  
**Target Completion:** Mid-Nov 2025  

---

## ✅ COMPLETED FEATURES

### Core Registration System
- [x] Mobile-first registration flow
- [x] 10 registration types with pricing
- [x] 91 Rotary clubs dropdown
- [x] Meal preference selection
- [x] Payment simulation
- [x] Success/Failure acknowledgment
- [x] **QR Code on receipt** (for venue check-in)
- [x] PDF download (with QR code)
- [x] Image download
- [x] WhatsApp floating button (9980557785)

---

## 🚧 IN PROGRESS - Phase 1: Enhanced Admin Dashboard

### 1. Mock Data & Setup
- [ ] Create realistic registration data (50+ sample records)
- [ ] Different registration types
- [ ] Various payment statuses
- [ ] Multiple clubs
- [ ] Manually added registrations
- [ ] Date range spread

### 2. Dashboard Overview Enhancement
- [ ] Total registrations counter (by type breakdown)
- [ ] Total revenue (₹) with target progress
- [ ] Payment status cards (Paid/Pending/Failed counts)
- [ ] Meal preference breakdown (Veg/Non-Veg/Jain)
- [ ] Club-wise registration chart
- [ ] Today's registrations highlight
- [ ] Manually added count indicator

### 3. Advanced Search & Filters
- [ ] **Search bar:** Name, Mobile, Email, Reg ID, Transaction ID
- [ ] **Filter by Registration Type:** Dropdown with all 10 types
- [ ] **Filter by Payment Status:** Paid/Pending/Failed/All
- [ ] **Filter by Club:** 91 clubs dropdown
- [ ] **Filter by Meal:** Veg/Non-Veg/Jain/All
- [ ] **Filter by Source:** Online/Manually Added/All
- [ ] **Sort options:** Date (newest/oldest), Amount (high/low), Name (A-Z)
- [ ] Real-time table updates
- [ ] Clear all filters button

### 4. Registration Table Enhancements
- [ ] **Columns:**
  - Confirmation ID
  - Name
  - Mobile
  - Registration Type
  - Amount
  - Payment Status (with color badges)
  - Source (Online/Manual badge)
  - Date
  - Actions (Edit/Delete/Resend)
- [ ] Color-coded payment status
- [ ] "MANUALLY ADDED" badge styling
- [ ] Responsive table (mobile-friendly)
- [ ] Pagination (20 per page)

### 5. Edit Registration
- [ ] Edit button per row
- [ ] Modal with form (all fields editable)
- [ ] Update registration data
- [ ] Activity log entry
- [ ] Success notification
- [ ] Refresh table

### 6. Delete Registration
- [ ] Delete button per row
- [ ] Confirmation dialog ("Are you sure?")
- [ ] Remove from database
- [ ] Update stats
- [ ] Activity log entry
- [ ] Success notification

### 7. Manual Registration Entry
- [ ] "Add Manual Registration" button
- [ ] Full registration form modal
- [ ] Auto-generate Confirmation ID
- [ ] Mark as "MANUALLY ADDED" flag
- [ ] Timestamp & admin name
- [ ] Add to database
- [ ] Generate receipt with QR
- [ ] Success notification

### 8. Resend Confirmation
- [ ] Resend WhatsApp button per row
- [ ] Resend Email button per row
- [ ] Message preview
- [ ] Confirmation dialog
- [ ] Update "last sent" timestamp
- [ ] Success/failure notification

### 9. Export Functionality
- [ ] Export to CSV button
- [ ] Export to Excel button (with formatting)
- [ ] Export current filtered view
- [ ] Include all fields
- [ ] Timestamp in filename
- [ ] Auto-download

### 10. Activity Log
- [ ] Track all admin actions:
  - Edits (what changed)
  - Deletions
  - Manual additions
  - Check-ins
- [ ] Show timestamp, admin name, action
- [ ] Separate log viewer section
- [ ] Exportable log

---

## 🎯 Phase 2: Attendance Tracking System

### 1. Attendance Dashboard Section
- [ ] New tab/section: "Attendance"
- [ ] **Overview Cards:**
  - Total Registered
  - Checked In (count + percentage)
  - Not Arrived Yet
  - Live arrival graph
- [ ] Real-time updates

### 2. QR Code Scanner
- [ ] Camera access request
- [ ] Live QR scanner UI
- [ ] Scan receipt QR code
- [ ] Parse QR data (Confirmation ID, Name, Type)
- [ ] Display registrant details
- [ ] "Check In" confirmation button
- [ ] Mark as attended with timestamp
- [ ] Prevent duplicate check-ins
- [ ] Success sound/animation
- [ ] Works on mobile/tablet

### 3. Manual Check-In
- [ ] Search interface (if QR not working)
- [ ] Search by: Name, Mobile, Confirmation ID
- [ ] Live search results
- [ ] Click to check-in
- [ ] Confirmation dialog
- [ ] Mark as attended
- [ ] Timestamp capture

### 4. Not Attended Yet List
- [ ] Filter registrations without check-in
- [ ] Show time since event started
- [ ] Highlight VIPs/Sponsors
- [ ] Sort by registration type
- [ ] "Send Reminder" button per row
- [ ] Bulk "Send Reminder to All" button

### 5. Attendance Reports
- [ ] Real-time attendance chart
- [ ] Check-in timeline graph
- [ ] Peak arrival times
- [ ] Type-wise attendance breakdown
- [ ] Export attendance list
- [ ] Print check-in report

### 6. WhatsApp Reminder System
- [ ] Send individual reminder
- [ ] Bulk send to no-shows
- [ ] Message templates:
  - "Event starting soon!"
  - "We're waiting for you!"
  - "Last chance to join!"
- [ ] Schedule reminders
- [ ] Track sent messages

---

## 🗂️ Technical Stack

### Frontend
- Pure HTML5/CSS3/JavaScript (ES6+)
- Libraries:
  - QRCode.js (receipt QR generation)
  - html5-qrcode (scanner)
  - jsPDF (PDF export)
  - html2canvas (image export)
  - SheetJS (Excel export)

### Backend (To Be Implemented)
- **Option 1: Firebase** (Recommended for quick start)
  - Firestore Database
  - Firebase Auth
  - Cloud Functions
  - Firebase Hosting
  
- **Option 2: Node.js + MongoDB**
  - Express.js API
  - MongoDB Atlas
  - JWT Authentication
  - Vercel/AWS deployment

### APIs & Services
- WhatsApp Business API (Twilio/official)
- Email Service (SendGrid/Nodemailer)
- SMS API (optional for OTP)

---

## 📊 Data Structure

### Registration Object
```javascript
{
  confirmationId: "SS12345678",
  fullName: "John Doe",
  mobile: "9876543210",
  email: "john@example.com",
  clubName: "Mangalore",
  clubId: 30,
  registrationType: "rotarian",
  registrationTypeName: "Rotarian",
  price: 4500,
  mealPreference: "Veg",
  paymentStatus: "Paid",
  transactionId: "TXN1234567890",
  upiId: "user@upi",
  registrationDate: "2025-10-29T10:30:00Z",
  source: "Online", // or "Manual"
  manuallyAddedBy: null, // admin name if manual
  verificationStatus: "Verified",
  attended: false,
  checkInTime: null,
  lastWhatsAppSent: null,
  lastEmailSent: null,
  notes: []
}
```

---

## 🔒 Security Considerations

### Admin Dashboard
- Username/Password authentication
- Session management
- Password hashing (bcrypt)
- HTTPS only in production
- Input validation
- SQL injection prevention
- XSS protection

### Data Protection
- Backup every 6 hours
- Export full database option
- Activity logging
- Data encryption at rest
- PII (Personally Identifiable Information) handling

---

## 📅 Timeline

### Week 1 (Oct 29 - Nov 4)
- ✅ QR Code on receipts
- [ ] Mock data generation
- [ ] Enhanced admin dashboard
- [ ] Search & filters
- [ ] Edit/Delete functionality

### Week 2 (Nov 5 - Nov 11)
- [ ] Manual registration entry
- [ ] Activity log
- [ ] Export functionality
- [ ] Resend confirmations
- [ ] Testing & bug fixes

### Week 3 (Nov 12 - Nov 18)
- [ ] Attendance dashboard
- [ ] QR code scanner
- [ ] Manual check-in
- [ ] Not attended list
- [ ] WhatsApp reminders

### Week 4 (Nov 19 - Nov 25)
- [ ] Integration testing
- [ ] Backend setup (if needed)
- [ ] Deployment
- [ ] Documentation
- [ ] Training

---

## 🎯 Success Metrics

- **Registration Goal:** 500+ attendees
- **Payment Collection:** Track real-time
- **Check-in Speed:** < 10 seconds per person
- **No-Show Rate:** < 10%
- **Data Accuracy:** 100%
- **System Uptime:** 99.9%

---

## 📞 Support & Contact

**WhatsApp:** 9980557785  
**Admin:** Kiran  
**Event:** Sneha Sourabha 2025-26  
**Venue:** Silent Shores, Mysore  

---

## 📝 Notes

- Event is 3 months away (plenty of time!)
- Start collecting registrations ASAP
- Test scanner well before event day
- Backup plan for internet outage at venue
- Print emergency QR scanner QR codes
- Have manual attendance backup

---

**Last Updated:** 29 October 2025  
**Next Review:** Weekly
