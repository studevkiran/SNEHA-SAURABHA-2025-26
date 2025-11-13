# 🧪 Quick Registration Testing Guide

**Production URL**: https://www.sneha2026.in/

---

## ✅ What's Deployed

- Quick registration mode with club member dropdowns
- Manual fallback mode  
- Auto-fill functionality
- All 3,861 members loaded
- API working: `/api/club-members`

---

## 📋 Testing Steps

### Test 1: Rotaractor (Manual Only)
1. Go to https://www.sneha2026.in/
2. Click "Register Now"
3. Select **"Rotaractor"** (₹3,000)
4. Click Continue
5. ✅ Should see: Manual entry form (Name, Email, Mobile, Club dropdown)
6. Fill in all fields and test registration

### Test 2: Rotarian (Quick Mode)
1. Go to https://www.sneha2026.in/
2. Click "Register Now"
3. Select **"Rotarian"** (₹7,500)
4. Click Continue
5. ✅ Should see: "Select Your Club" search field
6. Type "Baikampady" in club search
7. Click "Baikampady" from dropdown
8. ✅ Should see: "Select Your Name" field appear
9. Type a name (e.g., "Bharath") in member search
10. Click a member from dropdown
11. ✅ Should see: Green "✓ Member Found" box with name, editable email, editable mobile
12. Edit email/mobile if needed
13. Select meal preference
14. Click Continue → Complete registration

### Test 3: Name Not Found Fallback
1. Go to https://www.sneha2026.in/
2. Select **"Rotarian"**
3. Click Continue
4. Type club name in search
5. Select a club
6. ✅ Should see: "🔍 Name not found? Click here to enter manually" link
7. Click the link
8. ✅ Should see: Switch to manual entry form (Name, Email, Mobile, Club)
9. Fill and complete registration

### Test 4: Other Registration Types
Test with these types (all should show quick mode):
- Rotarian with Spouse (₹14,000)
- Ann (₹7,500)
- Annet (₹7,500)
- Guest (₹5,000)
- Silver Donor (₹25,000)
- Silver Sponsor (₹50,000)
- Gold Sponsor (₹1,00,000)
- Platinum Sponsor (₹2,00,000)
- Patron Sponsor (₹5,00,000)

All should behave like Test 2 (quick mode with dropdowns).

---

## 🔍 What to Check

### Visual Checks
- [ ] Club dropdown appears when typing
- [ ] Member dropdown appears after club selection
- [ ] Green "Member Found" box appears when member selected
- [ ] Email and mobile fields are editable in autofilled mode
- [ ] "Name not found" link is visible and clickable
- [ ] Manual mode shows all fields properly
- [ ] Meal preference buttons work in all modes

### Functionality Checks
- [ ] Searching clubs filters the list
- [ ] Clicking a club loads members
- [ ] Searching members filters the list
- [ ] Clicking a member auto-fills data
- [ ] Switching to manual mode pre-fills club name
- [ ] Form validation works (10-digit mobile, email format)
- [ ] Review screen shows correct data
- [ ] Payment flow completes successfully
- [ ] WhatsApp confirmation is sent

### API Checks
You can test the API directly:
```bash
# Test Baikampady (should return 43 members)
curl "https://www.sneha2026.in/api/club-members?clubName=Baikampady"

# Test another club
curl "https://www.sneha2026.in/api/club-members?clubName=Mangalore%20Central"
```

---

## 🐛 Common Issues to Watch For

1. **Dropdown not appearing**: Check browser console for errors
2. **Member search disabled**: Club might not have members in database
3. **Auto-fill not working**: Check if member has email/mobile in database
4. **Manual mode not showing**: Check if registration type is Rotaractor
5. **Payment issues**: Verify Cashfree integration still works

---

## 📱 Device Testing

Test on:
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Desktop Firefox
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iPhone)
- [ ] Tablet (iPad/Android)

---

## ✅ Success Criteria

- [ ] Quick mode shows for 11 registration types
- [ ] Manual mode shows for Rotaractor
- [ ] Club search works and filters properly
- [ ] Member search works and filters properly
- [ ] Auto-fill populates email and mobile
- [ ] Email and mobile are editable after auto-fill
- [ ] "Name not found" link switches to manual mode
- [ ] Form validation prevents invalid submissions
- [ ] Payment completes successfully
- [ ] WhatsApp confirmation is sent
- [ ] No JavaScript errors in console

---

## 📞 Support Testing

After registration completes:
- [ ] Check WhatsApp message received (to registered mobile)
- [ ] Verify message contains correct details
- [ ] Check admin dashboard shows registration
- [ ] Verify payment status is "Paid"

---

**Ready to test!** 🚀

Visit: https://www.sneha2026.in/
