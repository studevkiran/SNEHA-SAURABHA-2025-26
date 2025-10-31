# Backend Setup Guide for Instamojo Integration

## 🚀 Complete Backend for Real Instamojo Payment Gateway

This backend enables **REAL** Instamojo payment integration with test/production mode toggle - just like Cashfree!

## ✨ Features

- ✅ **Real Instamojo API integration** (not a simulation)
- ✅ **Test mode** with actual Instamojo test gateway
- ✅ **Production ready** - just toggle environment variable
- ✅ **Secure server-side API calls**
- ✅ **Webhook handling** for payment callbacks
- ✅ **Payment verification**
- ✅ **Easy deployment** to Vercel, Railway, Render, or Heroku

## 📋 Prerequisites

- Node.js 18+ installed
- Your Instamojo test credentials (already configured)

## 🛠️ Local Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `express` - Web framework
- `cors` - Handle cross-origin requests
- `axios` - HTTP client for Instamojo API
- `dotenv` - Environment variables
- `body-parser` - Parse request bodies
- `nodemon` - Auto-restart during development

### Step 2: Configure Environment

The `.env` file is already created with your test credentials:

```
INSTAMOJO_API_KEY=084c9e123d2732c22f4ebb4f8c37481d
INSTAMOJO_AUTH_TOKEN=0cfbbdd9e0a37c7773f564281dd66f48
INSTAMOJO_SALT=06bb23a2ec6a4da5825189278b5de344
NODE_ENV=TEST
PORT=3000
FRONTEND_URL=http://localhost:8000
```

### Step 3: Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:

```
🚀 Server running on port 3000
🌍 Environment: TEST
💳 Instamojo API: https://test.instamojo.com/api/1.1
🔗 Frontend URL: http://localhost:8000
```

### Step 4: Keep Both Servers Running

**Terminal 1** (Backend):
```bash
cd backend
npm start
```

**Terminal 2** (Frontend):
```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

## 🧪 Testing the Integration

1. **Open**: http://localhost:8000
2. **Fill** the registration form completely
3. **Click** "Pay with Instamojo"
4. **You'll be redirected** to **REAL Instamojo test payment page!**
5. **Make test payment** using Instamojo's test cards
6. **Get redirected back** to success page with QR code

## 🔐 Instamojo Test Payment

When you click "Pay with Instamojo", you'll see the **actual Instamojo payment gateway** where you can:

- Pay with test UPI
- Pay with test cards
- Pay with test wallets
- See real payment flow

**Test Cards** (Instamojo provides these):
- Card: Any valid test card
- Instamojo automatically detects test environment

## 📡 API Endpoints

### Create Payment
```
POST http://localhost:3000/api/payment/create

Body:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobile": "9999999999",
  "type": "Rotarian",
  "amount": 7500
}

Response:
{
  "success": true,
  "paymentRequestId": "abc123",
  "paymentUrl": "https://test.instamojo.com/...",
  "shortUrl": "https://imjo.in/abc123"
}
```

### Verify Payment
```
GET http://localhost:3000/api/payment/verify/{paymentRequestId}/{paymentId}

Response:
{
  "success": true,
  "payment": {
    "status": "Credit",
    "amount": "7500.00",
    "buyerName": "John Doe",
    ...
  }
}
```

### Webhook
```
POST http://localhost:3000/api/webhook/instamojo

(Automatically called by Instamojo after payment)
```

## 🚀 Production Deployment

### Option 1: Vercel (Recommended - Free)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd backend
   vercel
   ```

3. **Set Production Environment Variables** in Vercel Dashboard:
   ```
   NODE_ENV=PRODUCTION
   INSTAMOJO_API_KEY=your_production_api_key
   INSTAMOJO_AUTH_TOKEN=your_production_auth_token
   INSTAMOJO_SALT=your_production_salt
   FRONTEND_URL=https://yourdomain.com
   ```

### Option 2: Railway (Free Tier)

1. **Go to**: https://railway.app
2. **Connect GitHub** repository
3. **Select** `backend` folder
4. **Set environment variables**
5. **Deploy**

### Option 3: Render (Free Tier)

1. **Go to**: https://render.com
2. **New Web Service**
3. **Connect repository**
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Add environment variables**
7. **Deploy**

## 🔄 Switch to Production Mode

When ready to go live:

1. **Get Production Credentials** from Instamojo Dashboard
2. **Update `.env`**:
   ```
   NODE_ENV=PRODUCTION
   INSTAMOJO_API_KEY=your_production_key
   INSTAMOJO_AUTH_TOKEN=your_production_token
   INSTAMOJO_SALT=your_production_salt
   ```
3. **Restart server**
4. **That's it!** Now using live Instamojo gateway

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process if needed
kill -9 <PID>

# Try different port
PORT=3001 npm start
```

### Frontend can't connect to backend
- Check both servers are running
- Frontend: http://localhost:8000
- Backend: http://localhost:3000
- Check CORS is enabled in backend

### Payment link not redirecting
- Check console logs in both servers
- Verify Instamojo credentials are correct
- Check `.env` file is loaded

### Webhook not receiving
- In production, webhook URL must be HTTPS
- Configure webhook URL in Instamojo dashboard
- Check webhook signature verification

## 📁 Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables (your credentials)
├── .env.example           # Example environment file
├── .gitignore            # Git ignore file
├── routes/
│   ├── payment.js        # Payment creation & verification
│   └── webhook.js        # Webhook handling
└── services/
    └── instamojo.js      # Instamojo API service
```

## 🎯 How It Works

1. **User clicks "Pay with Instamojo"**
2. **Frontend** calls `POST /api/payment/create`
3. **Backend** creates payment request with Instamojo API
4. **Backend** returns real Instamojo payment URL
5. **Frontend** redirects user to Instamojo payment page
6. **User completes payment** on Instamojo
7. **Instamojo redirects** back to your callback URL
8. **Instamojo sends webhook** to your server
9. **Backend verifies** webhook signature
10. **Frontend shows** success page with QR code

## 🔒 Security Features

- ✅ API credentials stored server-side only
- ✅ CORS protection
- ✅ Webhook signature verification (HMAC-SHA1)
- ✅ Input validation
- ✅ Environment-based configuration
- ✅ No credentials in frontend code

## 📞 Support

If you encounter issues:
1. Check both servers are running
2. Check browser console for errors
3. Check backend terminal for logs
4. Verify `.env` credentials are correct

---

**Now you have REAL Instamojo integration - just like Cashfree! 🎉**

Toggle `NODE_ENV=TEST` to `NODE_ENV=PRODUCTION` and you're live!
