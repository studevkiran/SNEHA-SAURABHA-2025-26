# Sneha Sourabha 2025-26 - Conference Registration Website

A complete mobile-first conference registration website for the Rotary District Conference with Kalparuksha amber-gold theme, payment integration, WhatsApp confirmation, and admin dashboard.

## Event Details

- **Event**: Sneha Sourabha - Rotary District Conference 2025-26
- **Dates**: 30-31 January & 1 February 2026
- **Venue**: Silent Shores, Mysore
- **Tagline**: "Join the district's grand celebration — be part of the legacy."

## Features

### Public Registration Flow
- **Mobile-First Design**: Optimized for mobile devices with no-scroll single-screen experience
- **Bright Amber-Gold Theme**: Beautiful Kalparuksha theme with amber and gold color scheme
- **Smooth Flow**: Seamless transition between registration steps without page flicker
- **Multi-Step Registration**:
  1. Home Page with Event Banner and Details
  2. Registration Type Selection (11 types with expandable details)
  3. Personal Details Form with Club Selection
  4. Review Page with Full Details
  5. Payment Integration (Ready for Gateway)
  6. Acknowledgment with PDF/Image Download

### Registration Types
1. **Rotarian** - ₹7,500
2. **Rotarian with Spouse** - ₹14,000
3. **Ann** - ₹7,500
4. **Annet** - ₹7,500
5. **Guest** - ₹5,000
6. **Rotaractor** - ₹3,000
7. **Silver Donor** - ₹25,000
8. **Silver Sponsor** - ₹50,000
9. **Gold Sponsor** - ₹1,00,000
10. **Platinum Sponsor** - ₹2,00,000
11. **Patron Sponsor** - ₹5,00,000

### Advanced Features
- **91 Rotary Clubs** loaded from JSON
- **Meal Preferences**: Veg, Non-Veg, Jain with color-coded toggles
- **WhatsApp Confirmation**: Ready for API integration
- **Email Notifications**: Structure in place
- **PDF/Image Download**: Acknowledgment can be downloaded
- **Admin Dashboard**: Full management interface

### Admin Dashboard
- Login-protected admin panel
- Overview with statistics (total registrations, revenue, payment status)
- Meal preference summary
- Complete registrations table with filters
- Search functionality
- Manual registration entry
- Edit/Update capabilities
- Export as CSV/Excel/PDF
- Resend confirmations
- Payment verification controls

## Technology Stack

- Pure HTML5
- CSS3 with modern features (CSS Grid, Flexbox, CSS Variables)
- Vanilla JavaScript (ES6+)
- No external dependencies for core functionality
- Ready for backend API integration

## Project Structure

```
├── index.html                  # Main registration page
├── admin/
│   └── index.html             # Admin dashboard
├── data/
│   └── clubs.json             # 91 Rotary clubs data
├── docs/
│   └── API_STRUCTURE.md       # Complete API documentation
├── images/
│   ├── header-left.jpg        # Left header image (upload required)
│   └── header-right.jpg       # Right header image (upload required)
├── scripts/
│   ├── app.js                 # Main application logic
│   └── admin.js               # Admin dashboard logic
├── styles/
│   ├── main.css               # Main styles with Kalparuksha theme
│   └── admin.css              # Admin dashboard styles
└── README.md                  # This file
```

## Getting Started

### 1. Open the Website

**Option A: Direct File**
- Open `index.html` in a web browser
- For best experience, use browser DevTools mobile view

**Option B: Live Server (Recommended)**
1. Install Live Server extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

**Option C: Python HTTP Server**
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`

### 2. Upload Event Images

Place your event banner images in the `images/` folder:
- `images/header-left.jpg` - Left header image (Rotary logo recommended)
- `images/header-right.jpg` - Right header image (Event branding)

### 3. Access Admin Dashboard

- URL: `admin/index.html` or `http://localhost:8000/admin`
- **Default Credentials** (change in production):
  - Username: `admin`
  - Password: `admin123`

## Configuration

### Updating Registration Prices

Edit `scripts/app.js` and modify the `registrationTypes` object:

```javascript
const registrationTypes = {
    'rotarian': {
        name: 'Rotarian',
        price: 7500,
        description: 'Full conference access for Rotarian members',
        inclusions: ['...']
    },
    // ... other types
};
```

### Adding/Removing Clubs

Edit `data/clubs.json`:

```json
[
  "Club Name 1",
  "Club Name 2",
  ...
]
```

### Theme Colors

Modify CSS variables in `styles/main.css`:

```css
:root {
    --primary-gold: #D4AF37;
    --dark-gold: #B8960C;
    --light-gold: #F4E4C1;
    --amber: #FFBF00;
    --cream: #FFF8DC;
    /* ... */
}
```

## Backend Integration

This project is **frontend-ready** and designed for easy backend integration.

### API Structure

See detailed API documentation in `docs/API_STRUCTURE.md` including:
- Registration endpoints
- Payment gateway integration
- WhatsApp API integration
- Email service integration
- Admin authentication
- Database schema
- Security considerations

### Environment Variables Required

For production deployment (Vercel, AWS, etc.):

```env
DATABASE_URL=your_database_connection
PAYMENT_API_KEY=your_payment_gateway_key
WHATSAPP_API_KEY=your_whatsapp_api_key
EMAIL_API_KEY=your_email_service_key
ADMIN_SECRET_KEY=your_admin_secret
```

### Payment Gateway Integration

Supports:
- Razorpay (recommended for India)
- Stripe
- PayU
- Instamojo

Add API keys via environment variables - no hardcoded secrets in code.

### WhatsApp Confirmation

Ready for integration with:
- Twilio
- MessageBird
- Official WhatsApp Business API

Template message structure provided in API documentation.

## Features in Detail

### Mobile Optimization
- Fixed viewport to prevent scrolling and flickering
- Dynamic viewport height (dvh) support
- Touch-optimized interactions
- Prevents pull-to-refresh and double-tap zoom
- Landscape mode support
- Responsive design for all screen sizes

### Registration Type Selection
- Click to expand card with full details
- Shows price and complete inclusions
- Real-time selection updates
- Smooth expand/collapse animation

### Form Validation
- Real-time validation
- 10-digit mobile number validation
- Email format validation
- Required field checking
- Visual feedback (green/red borders)

### Meal Preference
- Color-coded toggle buttons:
  - 🌱 Veg (Green)
  - 🍗 Non-Veg (Red)
  - 🍃 Jain (Orange)
- Single selection only
- Visual selection feedback

### Review Screen
- Complete registration summary
- Editable (back navigation)
- Shows all selected options
- Price breakdown

### Acknowledgment
- Confirmation ID generation
- Transaction details display
- Download as PDF (ready for jsPDF)
- Download as Image (ready for html2canvas)
- WhatsApp confirmation note

### Admin Dashboard
- Secure login system
- Real-time statistics
- Filterable data table
- Search across all fields
- Export functionality
- Manual entry for walk-ins
- Edit existing registrations
- Resend confirmations
- Payment verification

## Production Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Link project:
```bash
vercel link
```

3. Add environment variables:
```bash
vercel env add DATABASE_URL
vercel env add PAYMENT_API_KEY
# ... add all required env variables
```

4. Deploy:
```bash
vercel --prod
```

### Alternative Platforms
- **Netlify**: Drag and drop deployment
- **AWS S3 + CloudFront**: Static hosting
- **Firebase Hosting**: Free tier available
- **GitHub Pages**: For static frontend only

## Security Considerations

1. **Never commit secrets** - Use environment variables
2. **Input validation** - All user inputs validated
3. **SQL injection prevention** - Use prepared statements in backend
4. **XSS protection** - Sanitize all outputs
5. **HTTPS only** - Force secure connections
6. **Payment security** - Verify all webhooks
7. **Admin authentication** - Strong passwords, JWT tokens
8. **Rate limiting** - Prevent abuse
9. **Audit logs** - Track all admin actions
10. **Data backup** - Regular automated backups

## Libraries for Production

### PDF Generation
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

### Image Export
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

### Excel Export (Admin)
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Safari (iOS 12+)
- ✅ Firefox (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)

## Future Enhancements

- [ ] Real-time seat availability
- [ ] Group registration management
- [ ] QR code generation for entry
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Offline mode with service workers
- [ ] Progressive Web App (PWA)
- [ ] Payment installments
- [ ] Referral tracking
- [ ] Analytics dashboard

## Support

For technical support or questions:
- Check `docs/API_STRUCTURE.md` for backend implementation
- Review code comments for detailed explanations
- Test all features in mobile view for best experience

## License

MIT License - Free to use for your events!

## Credits

**Event**: Sneha Sourabha 2025-26 - Rotary District Conference  
**Theme**: Kalparuksha Amber-Gold Theme  
**Built**: October 28, 2025  
**Repository**: https://github.com/studevkiran/SNEHA-SAURABHA-2025-26.git

---

**Ready to deploy!** Add your images, configure environment variables, and push to production.
