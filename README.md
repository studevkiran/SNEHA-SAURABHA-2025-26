# Event Registration Website

A mobile-first event registration website with Kalparuksha amber-gold theme.

## Features

- **Mobile-First Design**: Optimized for mobile devices with no-scroll single-screen experience
- **Bright Amber-Gold Theme**: Beautiful Kalparuksha theme with amber and gold color scheme
- **Smooth Flow**: Seamless transition between registration steps without page flicker
- **Multi-Step Registration**:
  1. Event Banner with Register button
  2. Registration Type Selection (Individual/Couple/Group)
  3. Personal Details Form
  4. Review Page
  5. Payment Screen
  6. Success/Failure Acknowledgment

## Technology Stack

- Pure HTML5
- CSS3 with modern features (CSS Grid, Flexbox, CSS Variables)
- Vanilla JavaScript (ES6+)
- No external dependencies

## Project Structure

```
├── index.html          # Main HTML file with all screens
├── styles/
│   └── main.css       # Kalparuksha theme styles
├── scripts/
│   └── app.js         # Application logic
└── README.md          # This file
```

## Getting Started

1. Open `index.html` in a web browser
2. For best experience, open in mobile view or use browser DevTools device emulation

### Using VS Code Live Server

1. Install Live Server extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Using Python HTTP Server

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Features in Detail

### Mobile Optimization
- Fixed viewport to prevent scrolling and flickering
- Dynamic viewport height (dvh) support
- Touch-optimized interactions
- Prevents pull-to-refresh and double-tap zoom
- Landscape mode support

### Theme Colors
- Primary Gold: `#D4AF37`
- Amber: `#FFBF00`
- Light Gold: `#F4E4C1`
- Cream: `#FFF8DC`

### Registration Flow
1. **Banner Screen**: Event banner image placeholder + Register Now button
2. **Type Selection**: Choose Individual (₹500), Couple (₹900), or Group (₹1500)
3. **Personal Details**: Name, Email, Phone, City with floating labels
4. **Review**: Confirm all details before payment
5. **Payment**: Simulate payment success/failure
6. **Acknowledgment**: Success or failure message with confirmation ID

## Customization

### Adding Event Banner
Replace the `.banner-placeholder` div in `index.html` with:
```html
<img src="your-banner-image.jpg" alt="Event Banner" style="width: 100%; height: 100%; object-fit: cover;">
```

### Changing Prices
Edit the `registrationTypes` object in `scripts/app.js`:
```javascript
const registrationTypes = {
    individual: { name: 'Individual', price: 500 },
    couple: { name: 'Couple', price: 900 },
    group: { name: 'Group', price: 1500 }
};
```

### Theme Colors
Modify CSS variables in `styles/main.css`:
```css
:root {
    --primary-gold: #D4AF37;
    --amber: #FFBF00;
    /* ... */
}
```

## Browser Compatibility

- Chrome/Edge (latest)
- Safari (iOS 12+)
- Firefox (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Backend integration for form submission
- Payment gateway integration (Razorpay, Stripe, etc.)
- Email confirmation system
- Database storage for registrations
- Admin dashboard

## Notes

- Event banner image should be uploaded to the project
- Currently uses client-side validation only
- Payment is simulated for demonstration
- No data is stored or transmitted in this version

## License

MIT License - Feel free to use for your events!

---

**Setup Date**: October 28, 2025  
**Repository**: https://github.com/studevkiran/SNEHA-SAURABHA-2025-26.git
