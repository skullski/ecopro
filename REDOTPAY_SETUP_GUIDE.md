# RedotPay Configuration Guide

## Error: 403 Forbidden

If you see this error when trying to pay:
```
Checkout Failed
Failed to create checkout session: Failed to parse RedotPay response: <html>...<h1>403 Forbidden</h1>...
```

**Cause**: RedotPay API credentials are missing or incorrect in your `.env` file.

---

## Setup Instructions

### Step 1: Get RedotPay Credentials

1. Go to [RedotPay Dashboard](https://dashboard.redotpay.com) (or sandbox: https://sandbox.redotpay.com)
2. Sign up or login to your account
3. Navigate to **Settings > API Keys** or **Developers > API Credentials**
4. Copy these values:
   - **API Key** (public key)
   - **Secret Key** (private key, keep this secret!)
   - **Webhook Secret** (for verifying webhook signatures)

### Step 2: Update `.env` File

Open `/home/skull/Desktop/ecopro/.env` and add:

```bash
# RedotPay Configuration (Sandbox for testing)
REDOTPAY_API_KEY=your_api_key_from_redotpay
REDOTPAY_SECRET_KEY=your_secret_key_from_redotpay
REDOTPAY_WEBHOOK_SECRET=your_webhook_secret_from_redotpay
REDOTPAY_API_URL=https://api.sandbox.redotpay.com/v1
REDOTPAY_REDIRECT_URL=http://localhost:5173/billing/success
VITE_API_URL=http://localhost:5173
```

### Step 3: Test Credentials

For **sandbox/testing**, RedotPay provides test cards:
- **Test Card Number**: 4111111111111111
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)

### Step 4: Production Credentials

When deploying to production:

1. Switch RedotPay to **Production Mode** in your RedotPay dashboard
2. Get production API credentials
3. Update `.env` with production credentials:

```bash
REDOTPAY_API_KEY=prod_api_key_xxx
REDOTPAY_SECRET_KEY=prod_secret_key_xxx
REDOTPAY_WEBHOOK_SECRET=prod_webhook_secret_xxx
REDOTPAY_API_URL=https://api.redotpay.com/v1
REDOTPAY_REDIRECT_URL=https://yourdomain.com/billing/success
VITE_API_URL=https://yourdomain.com
```

### Step 5: Configure Webhook URL

In RedotPay Dashboard → Webhooks:

- **Webhook URL**: `https://yourdomain.com/api/billing/webhook`
- **Events**: Select "Payment Completed", "Payment Failed"
- **Secret**: Use the webhook secret from Step 2

---

## Testing Payment Flow

1. Go to billing page: `/dashboard/billing`
2. Click **"Start Paid Plan"** or **"Renew Next Month"**
3. Use test card credentials (see Step 3)
4. You should be redirected to success page

---

## Troubleshooting

### 403 Forbidden
- ❌ RedotPay_API_KEY is missing or empty
- ❌ RedotPay_API_KEY is incorrect
- ❌ Using production URL with sandbox credentials (or vice versa)

**Solution**: Double-check your credentials in RedotPay dashboard

### Invalid Request Body
- ❌ Amount format is wrong
- ❌ Currency code is invalid (should be "DZD" for Algerian Dinar)

**Solution**: Check the request in browser console

### Webhook Not Triggered
- ❌ Webhook URL not registered in RedotPay dashboard
- ❌ Webhook secret doesn't match
- ❌ Firewall blocking RedotPay servers

**Solution**: Register webhook URL and test from RedotPay dashboard

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `REDOTPAY_API_KEY` | Public API key for authentication | `pk_test_xxx` or `pk_live_xxx` |
| `REDOTPAY_SECRET_KEY` | Secret key for signing requests | `sk_test_xxx` or `sk_live_xxx` |
| `REDOTPAY_WEBHOOK_SECRET` | Secret for verifying webhooks | `whsec_xxx` |
| `REDOTPAY_API_URL` | API endpoint | `https://api.sandbox.redotpay.com/v1` or `https://api.redotpay.com/v1` |
| `REDOTPAY_REDIRECT_URL` | Where to redirect after payment | `http://localhost:5173/billing/success` |
| `VITE_API_URL` | Frontend API URL | `http://localhost:5173` |

---

## Current Status

✅ Placeholder credentials added to `.env`  
⏳ You need to: Add your actual RedotPay credentials  
⏳ You need to: Register webhook URL in RedotPay dashboard

---

## Need Help?

- RedotPay Docs: https://docs.redotpay.com
- RedotPay Support: https://support.redotpay.com
- Check `/server/utils/redotpay.ts` for implementation details

