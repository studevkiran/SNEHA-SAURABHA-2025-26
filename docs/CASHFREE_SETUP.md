# Cashfree Payment Gateway Integration

## Overview
This project uses Cashfree Payment Gateway for processing conference registrations.

## Getting Started

### 1. Get Your Credentials
1. Login to [Cashfree Dashboard](https://dashboard.cashfree.com)
2. Go to **Developers** → **Credentials**
3. Copy your:
   - App ID (TEST for sandbox, PROD for live)
   - Secret Key (starts with `cfsk_ma_test_` or `cfsk_ma_prod_`)

### 2. Configure Environment
Add to your Vercel environment variables or `.env`:

```bash
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here

# For testing/sandbox:
CASHFREE_API_URL=https://sandbox.cashfree.com/pg

# For production:
# CASHFREE_API_URL=https://api.cashfree.com/pg
```

### 3. Configure Webhooks
In Cashfree Dashboard:
1. Go to **Developers** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/cashfree/webhook`
3. Select events: `PAYMENT_SUCCESS`, `PAYMENT_FAILED`

## API Endpoints

### Create Payment Order
**POST** `/api/cashfree/initiate`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "amount": 7500,
  "registrationType": "rotarian"
}
```

Response:
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.cashfree.com/pg/...",
  "paymentSessionId": "session_...",
  "orderId": "ORDER_123456789"
}
```

### Verify Payment
**POST** `/api/cashfree/verify`

Request:
```json
{
  "orderId": "ORDER_123456789"
}
```

### Webhook Handler
**POST** `/api/cashfree/webhook`

Automatically processes payment notifications from Cashfree.

## Security

- ✅ All credentials in environment variables
- ✅ HMAC SHA256 signature verification on webhooks
- ✅ Input validation on all endpoints
- ✅ HTTPS enforced (Vercel automatic)

## Testing

Use Cashfree sandbox mode for testing:
1. Set `CASHFREE_API_URL=https://sandbox.cashfree.com/pg`
2. Use test credentials
3. Complete test payments with test cards
4. Verify webhooks receive notifications

## Going Live

1. Switch to production credentials
2. Update `CASHFREE_API_URL` to `https://api.cashfree.com/pg`
3. Update webhook URL in Cashfree Dashboard
4. Test thoroughly with small amount
5. Monitor transactions closely

## Support

- [Cashfree Documentation](https://docs.cashfree.com/docs)
- [API Reference](https://docs.cashfree.com/reference/pg-new-apis-endpoint)
- [Support](https://www.cashfree.com/contact-us/)
