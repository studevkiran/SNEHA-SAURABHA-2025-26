# API Structure for Sneha Sourabha 2025-26

## Overview
This document outlines the backend API structure for the Sneha Sourabha conference registration website. All API endpoints are designed to work with environment variables for secure deployment on Vercel.

## Environment Variables Required

```env
# Database
DATABASE_URL=your_database_connection_string

# Payment Gateway
PAYMENT_API_KEY=your_payment_gateway_api_key
PAYMENT_SECRET_KEY=your_payment_gateway_secret_key
PAYMENT_WEBHOOK_SECRET=your_webhook_secret

# WhatsApp API
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_API_URL=https://api.whatsapp.com/...
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id

# Email Service
EMAIL_API_KEY=your_email_service_api_key
SMTP_HOST=smtp.yourservice.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_email_password

# Application
ADMIN_SECRET_KEY=your_admin_authentication_secret
JWT_SECRET=your_jwt_secret_for_sessions
```

## API Endpoints

### 1. Registration Endpoint
**POST /api/register**

Request Body:
```json
{
  "name": "string",
  "mobile": "string (10 digits)",
  "email": "string",
  "club_name": "string",
  "meal_preference": "Veg | Non-Veg | Jain",
  "registration_type": "string",
  "price": "number"
}
```

Response:
```json
{
  "success": true,
  "registration_id": "string",
  "payment_url": "string",
  "message": "Registration initiated successfully"
}
```

### 2. Payment Callback
**POST /api/payment/callback**

Webhook from payment gateway with transaction details.

### 3. WhatsApp Confirmation
**POST /api/send-whatsapp**

Internal endpoint triggered after successful payment.

Request Body:
```json
{
  "phone": "string",
  "registration_id": "string",
  "name": "string",
  "amount": "number",
  "transaction_id": "string"
}
```

### 4. Get Registration Details
**GET /api/registration/:id**

Query single registration by ID.

### 5. Admin Endpoints

**GET /api/admin/registrations**
- Requires authentication
- Returns all registrations with filtering options

**POST /api/admin/registration**
- Manual registration entry by admin

**PUT /api/admin/registration/:id**
- Update registration details

**DELETE /api/admin/registration/:id**
- Delete registration (soft delete recommended)

**GET /api/admin/export**
- Export registrations as CSV/Excel/PDF
- Query params: format, filter_by

**POST /api/admin/verify/:id**
- Mark registration as verified

**POST /api/admin/resend-confirmation/:id**
- Resend WhatsApp/email confirmation

### 6. Admin Authentication
**POST /api/admin/login**

Request Body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": "string",
    "username": "string",
    "role": "admin"
  }
}
```

## Database Schema

### Registrations Table
```sql
CREATE TABLE registrations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(10) NOT NULL,
  email VARCHAR(255) NOT NULL,
  club_name VARCHAR(255) NOT NULL,
  meal_preference ENUM('Veg', 'Non-Veg', 'Jain') NOT NULL,
  registration_type VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  transaction_id VARCHAR(100),
  upi_id VARCHAR(100),
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_status ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending',
  verification_status ENUM('Pending', 'Verified') DEFAULT 'Pending',
  whatsapp_confirmation ENUM('Sent', 'Pending', 'Failed') DEFAULT 'Pending',
  acknowledgment_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mobile (mobile),
  INDEX idx_email (email),
  INDEX idx_payment_status (payment_status),
  INDEX idx_registration_date (registration_date)
);
```

### Admin Users Table
```sql
CREATE TABLE admin_users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Audit Log Table
```sql
CREATE TABLE audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  registration_id VARCHAR(50),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id)
);
```

## Payment Gateway Integration

### Supported Gateways
- Razorpay (recommended for Indian payments)
- Stripe
- PayU
- Instamojo

### Integration Steps
1. Add gateway credentials to environment variables
2. Initialize gateway client in `/api/payment/init`
3. Handle webhook callbacks in `/api/payment/callback`
4. Verify payment signature
5. Update registration status
6. Trigger confirmations

## WhatsApp Integration

### Using WhatsApp Business API
- Provider: Twilio, MessageBird, or official WhatsApp Business API
- Template message must be pre-approved
- Include: Name, Registration ID, Amount, Event details, Venue

Example Template:
```
Hello {{name}},

Your registration for Sneha Sourabha 2025-26 is confirmed!

Registration ID: {{reg_id}}
Amount Paid: ₹{{amount}}
Transaction ID: {{txn_id}}

Event: 30-31 Jan & 1 Feb 2026
Venue: Silent Shores, Mysore

See you at the conference!
```

## File Structure for Backend

```
/api
  /register.js          # Registration endpoint
  /payment
    /init.js            # Initialize payment
    /callback.js        # Payment webhook
  /whatsapp
    /send.js            # Send WhatsApp message
  /admin
    /auth.js            # Admin login
    /registrations.js   # CRUD operations
    /export.js          # Export data
  /utils
    /db.js              # Database connection
    /jwt.js             # JWT utilities
    /validators.js      # Input validation
/lib
  /payment-gateway.js   # Payment integration
  /whatsapp.js          # WhatsApp integration
  /email.js             # Email service
```

## Deployment on Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Link project: `vercel link`
3. Add environment variables: `vercel env add`
4. Deploy: `vercel --prod`

### vercel.json Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Security Considerations

1. **Input Validation**: Validate all inputs on server-side
2. **SQL Injection**: Use prepared statements
3. **XSS Protection**: Sanitize all user inputs
4. **CSRF Protection**: Implement CSRF tokens for admin panel
5. **Rate Limiting**: Limit API requests per IP
6. **HTTPS Only**: Force HTTPS in production
7. **Environment Variables**: Never commit secrets to git
8. **Payment Security**: Verify all webhook signatures
9. **Admin Authentication**: Use JWT with expiration
10. **Audit Trail**: Log all admin actions

## Testing

1. Test payment flow with test mode API keys
2. Test WhatsApp sending with sandbox numbers
3. Verify email delivery
4. Test admin panel operations
5. Load test with expected registration volume

## Monitoring

- Set up error tracking (Sentry, Rollbar)
- Monitor API response times
- Track payment success/failure rates
- Monitor WhatsApp delivery rates
- Set up alerts for critical failures
