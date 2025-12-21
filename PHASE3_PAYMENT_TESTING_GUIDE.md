# Phase 3: Payment Integration - Testing Guide

## Overview
This guide walks through testing the complete Phase 3 RedotPay payment integration for subscription renewals.

## Prerequisites

### 1. Environment Variables
Add these to `.env.local` (or set in deployment):

```bash
# RedotPay Configuration
REDOTPAY_API_KEY=your_redotpay_api_key_here
REDOTPAY_SECRET_KEY=your_redotpay_secret_key_here
REDOTPAY_WEBHOOK_SECRET=your_redotpay_webhook_secret_here
REDOTPAY_API_URL=https://api.redotpay.com/v1
REDOTPAY_REDIRECT_URL=http://localhost:5173/billing/success

# Public API URL (for webhooks)
VITE_API_URL=http://localhost:5173
```

### 2. Database Migration
Apply the Phase 3 migration to create new tables:

```bash
# Run migration
psql -U postgres -d ecopro -f server/migrations/20251221_phase3_payments.sql

# Verify tables created
psql -U postgres -d ecopro -c "\dt checkout_sessions; \dt payment_transactions;"
```

### 3. Verify Files Created
- ✅ `server/utils/redotpay.ts` - RedotPay integration utilities
- ✅ `server/routes/billing.ts` - Updated with 3 new endpoints
- ✅ `client/pages/admin/Billing.tsx` - Billing dashboard UI
- ✅ `client/pages/BillingSuccess.tsx` - Success page
- ✅ `client/pages/BillingCancelled.tsx` - Cancelled page
- ✅ `server/index.ts` - Webhook routes registered

---

## Testing Scenarios

### Scenario 1: Create Checkout Session

**Endpoint**: `POST /api/billing/checkout`

**Test Steps**:
1. Log in as store owner
2. Navigate to `/dashboard/billing`
3. Click "Renew Now" button
4. Should see loading state briefly
5. Should redirect to RedotPay checkout page

**Expected Response** (from `/api/billing/checkout`):
```json
{
  "message": "Checkout session created successfully",
  "sessionToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
  "checkoutUrl": "https://checkout.redotpay.com/pay/SESSION_ID",
  "expiresAt": "2025-12-21T15:45:00.000Z",
  "amount": 7.00,
  "currency": "DZD"
}
```

**Database Check**:
```sql
SELECT * FROM checkout_sessions ORDER BY created_at DESC LIMIT 1;
-- Should show new session with status='pending'
```

---

### Scenario 2: Successful Payment (Mock)

**Test with RedotPay Test Card**:
- Card Number: `4111 1111 1111 1111`
- Expiry: `12/25`
- CVV: `123`
- Amount: `7.00 DZD`

**Test Steps**:
1. At RedotPay checkout, enter test card details
2. Complete payment
3. Should redirect to `/billing/success?session=SESSION_TOKEN`
4. Success page shows:
   - ✓ Green checkmark icon
   - ✓ "Payment Successful!" heading
   - ✓ Amount: $7.00 DZD
   - ✓ Status: ✓ Activated
   - ✓ Next billing date (30 days from now)
5. Click "Go to Dashboard" button
6. Should redirect to `/dashboard`

**Database Check**:
```sql
-- Check subscription updated
SELECT id, user_id, status, current_period_end, auto_renew 
FROM subscriptions 
WHERE user_id = USER_ID;
-- Should show status='active', current_period_end=30 days from now

-- Check payment recorded
SELECT id, user_id, amount, status, transaction_id 
FROM payments 
WHERE user_id = USER_ID 
ORDER BY created_at DESC LIMIT 1;
-- Should show status='completed'

-- Check checkout session updated
SELECT id, status, redotpay_session_id 
FROM checkout_sessions 
WHERE user_id = USER_ID 
ORDER BY created_at DESC LIMIT 1;
-- Should show status='completed'
```

---

### Scenario 3: User Cancels Checkout

**Test Steps**:
1. At RedotPay checkout, click "Cancel" or close browser tab
2. Should redirect to `/billing/cancelled?session=SESSION_TOKEN`
3. Cancelled page shows:
   - ✗ Red X icon
   - "Payment Cancelled" heading
   - Explanation message
   - "Try Again" button (redirects to billing page)
   - "Return to Dashboard" button

**Database Check**:
```sql
-- Subscription should still exist but unchanged
SELECT status FROM subscriptions WHERE user_id = USER_ID;

-- Checkout session should be marked cancelled
SELECT status FROM checkout_sessions 
WHERE user_id = USER_ID 
ORDER BY created_at DESC LIMIT 1;
-- Should show status='cancelled'
```

---

### Scenario 4: Webhook Payment Confirmation

**Simulating Webhook**:

Use `curl` to simulate RedotPay webhook:

```bash
# 1. Prepare payload
PAYLOAD=$(cat <<'EOF'
{
  "event": "payment.completed",
  "data": {
    "session_id": "REDOTPAY_SESSION_ID",
    "transaction_id": "TRANSACTION_ID_UNIQUE",
    "amount": 700,
    "currency": "DZD",
    "status": "completed",
    "metadata": {
      "user_id": 1,
      "subscription_id": 1,
      "type": "subscription_renewal"
    },
    "paid_at": "2025-12-21T14:30:00Z"
  }
}
EOF
)

# 2. Generate HMAC signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "WEBHOOK_SECRET" -hex | cut -d' ' -f2)

# 3. Send webhook
curl -X POST http://localhost:5173/api/billing/webhook/redotpay \
  -H "Content-Type: application/json" \
  -H "X-RedotPay-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

**Expected Response**:
```json
{
  "statusCode": 200,
  "message": "Webhook processed successfully",
  "transactionId": "TRANSACTION_ID_UNIQUE"
}
```

**Database Check After Webhook**:
```sql
-- Subscription activated
SELECT status, current_period_end FROM subscriptions 
WHERE user_id = 1;
-- Should show: status='active', current_period_end=30 days from now

-- Payment recorded
SELECT * FROM payments 
WHERE transaction_id = 'TRANSACTION_ID_UNIQUE';
-- Should show: status='completed', paid_at=timestamp

-- Payment transaction recorded
SELECT * FROM payment_transactions 
WHERE transaction_type = 'completed';
```

---

### Scenario 5: Payment Failure

**Test Steps**:
1. Use invalid test card (e.g., `4000 0000 0000 0002`)
2. Payment fails at RedotPay
3. Should redirect to `/billing/cancelled`

**Database Check**:
```sql
-- Check failed payment recorded
SELECT status, error_message FROM payments 
WHERE user_id = USER_ID 
ORDER BY created_at DESC LIMIT 1;
-- Should show status='failed' with error_message

-- Check subscription still on trial/unchanged
SELECT status FROM subscriptions WHERE user_id = USER_ID;
```

---

### Scenario 6: Webhook Signature Verification

**Test Invalid Signature**:

```bash
# Send webhook with wrong signature
curl -X POST http://localhost:5173/api/billing/webhook/redotpay \
  -H "Content-Type: application/json" \
  -H "X-RedotPay-Signature: WRONG_SIGNATURE" \
  -d '{...payload...}'
```

**Expected Response**:
```json
{
  "statusCode": 401,
  "error": "Invalid webhook signature"
}
```

---

### Scenario 7: Idempotency Check

**Test Duplicate Webhook**:

Send same webhook twice:

```bash
PAYLOAD='{"event": "payment.completed", "data": {"transaction_id": "UNIQUE_ID_123", ...}}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "WEBHOOK_SECRET" -hex | cut -d' ' -f2)

# First call - should succeed
curl -X POST http://localhost:5173/api/billing/webhook/redotpay \
  -H "X-RedotPay-Signature: $SIGNATURE" \
  -d "$PAYLOAD"

# Second call - should also succeed but not duplicate payment
curl -X POST http://localhost:5173/api/billing/webhook/redotpay \
  -H "X-RedotPay-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

**Expected**: Only one payment record created (database UNIQUE constraint enforces this)

```sql
SELECT COUNT(*) FROM payments WHERE transaction_id = 'UNIQUE_ID_123';
-- Should return: 1 (not 2)
```

---

## Testing Billing Dashboard

### Payment History Table

**Verify Columns**:
- Date (formatted: "Dec 21, 2025 2:30 PM")
- Amount ($7.00 DZD)
- Status (badge: pending/completed/failed)
- Payment Method (display from database)
- Transaction ID (short, with copy button)
- Actions (Details button)

**Test Details Dialog**:
1. Click payment row "Details" button
2. Dialog opens showing:
   - Amount
   - Currency
   - Status
   - Transaction ID
   - Payment Method
   - Date Paid
   - Subscription ID
3. Click outside to close

**Test Filters** (if implemented):
- Filter by status (pending, completed, failed)
- Filter by date range

---

## Testing Subscription Status Display

### Trial Period
```sql
INSERT INTO subscriptions (user_id, status, trial_started_at, trial_ends_at)
VALUES (1, 'trial', NOW(), NOW() + INTERVAL '30 days');
```

**UI Should Show**:
- Status badge: "Trial" (blue)
- "Renew Now" button
- "Trial ends in X days"
- Message: "Your free trial is active"

### Active Subscription
```sql
UPDATE subscriptions SET 
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '30 days'
WHERE user_id = 1;
```

**UI Should Show**:
- Status badge: "Active" (green)
- "Active Subscription" indicator
- "Billing period ends: Date"
- No "Renew Now" button (or grayed out)

### Expired Subscription
```sql
UPDATE subscriptions SET 
  status = 'expired',
  current_period_end = NOW() - INTERVAL '1 day'
WHERE user_id = 1;
```

**UI Should Show**:
- Alert: "Your subscription has expired"
- Status badge: "Expired" (red)
- "Renew Now" button (prominent)

---

## End-to-End Testing Checklist

- [ ] Create checkout session (POST /api/billing/checkout works)
- [ ] Redirect to RedotPay checkout page
- [ ] Process successful payment (redirect to /billing/success)
- [ ] Success page displays correctly
- [ ] Database: subscription status updated to 'active'
- [ ] Database: payment recorded with 'completed' status
- [ ] Navigate from success page to dashboard
- [ ] User can access store after payment
- [ ] Payment appears in history table
- [ ] Payment details dialog shows correct information
- [ ] Cancel checkout (redirect to /billing/cancelled)
- [ ] Cancelled page displays correctly
- [ ] Return to dashboard from cancelled page
- [ ] Subscription still shows trial status if during trial
- [ ] Webhook signature verification works
- [ ] Duplicate webhook prevented (idempotency)
- [ ] Webhook payment failure handling
- [ ] Failed payment recorded correctly
- [ ] Subscription remains unchanged after failed payment

---

## Troubleshooting

### Issue: "Checkout session created but no redirect"

**Possible Causes**:
1. `checkoutUrl` not returned from API
2. JavaScript error preventing redirect
3. CORS issue

**Solutions**:
```bash
# Check API response in browser console:
await fetch('/api/billing/checkout', {method: 'POST'}).then(r => r.json())

# Should return { checkoutUrl: "https://...", ... }
```

### Issue: Webhook not received by local server

**Possible Causes**:
1. RedotPay can't reach localhost
2. Webhook URL not configured in RedotPay dashboard
3. Signature verification failing

**Solutions**:
```bash
# Use ngrok to expose local server:
ngrok http 5173

# Update REDOTPAY_REDIRECT_URL to ngrok URL
# Update webhook URL in RedotPay dashboard
```

### Issue: Signature verification fails

**Debug**:
```bash
# Check webhook secret matches
echo "Your webhook secret: $REDOTPAY_WEBHOOK_SECRET"

# Verify HMAC calculation
echo -n 'payload' | openssl dgst -sha256 -hmac "$REDOTPAY_WEBHOOK_SECRET"
```

### Issue: Payment doesn't update subscription

**Check**:
```sql
-- Verify subscription exists
SELECT * FROM subscriptions WHERE user_id = 1;

-- Verify payment recorded
SELECT * FROM payments WHERE user_id = 1 ORDER BY created_at DESC;

-- Check server logs for webhook processing errors
tail -f logs/server.log | grep "webhook\|payment"
```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Update `REDOTPAY_API_URL` to production RedotPay API
- [ ] Update `REDOTPAY_REDIRECT_URL` to production domain
- [ ] Configure webhook URL in RedotPay dashboard (production)
- [ ] Rotate RedotPay API keys (use new production keys)
- [ ] Verify SSL/TLS certificates
- [ ] Test with production test cards from RedotPay
- [ ] Monitor webhook delivery logs
- [ ] Set up alerts for failed payments
- [ ] Test idempotency with duplicate webhooks
- [ ] Verify payment retry logic
- [ ] Load test checkout flow
- [ ] Test with multiple concurrent payments

---

## Monitoring & Metrics

### Key Metrics to Track

1. **Checkout Success Rate**
   ```sql
   SELECT 
     COUNT(*) as total_sessions,
     COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
     ROUND(100.0 * COUNT(CASE WHEN status = 'completed' THEN 1 END) / COUNT(*), 2) as success_rate
   FROM checkout_sessions
   WHERE created_at > NOW() - INTERVAL '7 days';
   ```

2. **Payment Success Rate**
   ```sql
   SELECT 
     COUNT(*) as total_payments,
     COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
     COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
     ROUND(100.0 * COUNT(CASE WHEN status = 'completed' THEN 1 END) / COUNT(*), 2) as success_rate
   FROM payments
   WHERE created_at > NOW() - INTERVAL '7 days';
   ```

3. **Revenue Tracking**
   ```sql
   SELECT 
     DATE(created_at) as date,
     COUNT(*) as payment_count,
     SUM(amount) as total_revenue,
     AVG(amount) as avg_payment
   FROM payments
   WHERE status = 'completed'
   GROUP BY DATE(created_at)
   ORDER BY date DESC;
   ```

4. **Failed Payments to Retry**
   ```sql
   SELECT COUNT(*) as failed_payments
   FROM payments
   WHERE status = 'failed'
   AND last_renewal_attempt_at IS NULL;
   ```

### Set Up Alerts

Create alerts for:
- High payment failure rate (> 5% in 1 hour)
- Webhook delivery failures
- Checkout session timeout rate
- Duplicate transaction attempts

---

## Next Steps

After Phase 3 testing passes:

1. **Phase 4: Payment Retry Logic**
   - Implement automatic retry for failed payments
   - Schedule retry jobs (exponential backoff)
   - Send email notifications for retry attempts

2. **Phase 5: Email Notifications**
   - Send receipt emails after successful payment
   - Send renewal reminders before expiry
   - Send payment failure notifications

3. **Phase 6: Admin Analytics**
   - Payment trends dashboard
   - Revenue by date/store owner
   - Payment method analytics
   - Churn analysis

---

## RedotPay API Reference

### Create Session Endpoint

**POST** `https://api.redotpay.com/v1/checkout/sessions`

```json
{
  "amount": 700,
  "currency": "DZD",
  "customer_email": "user@example.com",
  "customer_phone": "+213XXXXXXXXX",
  "description": "EcoPro monthly subscription",
  "metadata": {
    "user_id": 1,
    "subscription_id": 1
  },
  "success_url": "https://ecopro.com/billing/success?session=TOKEN",
  "cancel_url": "https://ecopro.com/billing/cancelled"
}
```

### Webhook Format

**POST** `https://your-domain.com/api/billing/webhook/redotpay`

```json
{
  "event": "payment.completed|payment.failed|payment.cancelled",
  "data": {
    "session_id": "SESSION_ID",
    "transaction_id": "UNIQUE_TRANSACTION_ID",
    "amount": 700,
    "currency": "DZD",
    "status": "completed",
    "metadata": { ... },
    "paid_at": "2025-12-21T14:30:00Z"
  }
}
```

**Header**:
- `X-RedotPay-Signature`: HMAC-SHA256 of payload using webhook secret

---

**Last Updated**: December 21, 2025  
**Status**: Ready for Phase 3 Testing  
**Next Review**: After first successful payment processed
