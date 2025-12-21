# Phase 3 Implementation Guide - RedotPay Payment Integration

**Status**: Starting Implementation  
**Target Completion**: 12-15 hours  
**Focus**: Payment processing, subscription renewal, billing dashboard  

---

## 🎯 Phase 3 Objectives

### Primary Goals
1. **Integrate RedotPay** payment processor for subscription billing
2. **Create checkout flow** for renewing expired subscriptions
3. **Handle webhook callbacks** from RedotPay to update subscription status
4. **Build billing dashboard** showing payment history and subscription details
5. **Implement auto-renewal** and payment retry logic

### Success Criteria
- ✅ Users can pay $7/month for subscription
- ✅ Payment succeeds → subscription status updates to 'active'
- ✅ Users see payment history in dashboard
- ✅ Webhook properly validates and updates database
- ✅ Failed payments have retry mechanism
- ✅ Admin sees all payment data and metrics

---

## 📋 Database Requirements

### Existing Tables (Phase 1)
- **subscriptions**: id, user_id, status (trial/active/expired/cancelled), trial_ends_at, period_start, period_end, created_at, updated_at

### New Tables Needed

#### payments table
```sql
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id BIGINT NOT NULL REFERENCES subscriptions(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  transaction_id VARCHAR(255) UNIQUE,
  payment_method VARCHAR(50), -- 'redotpay', 'credit_card', 'bank_transfer'
  provider_response JSONB, -- Store full response from RedotPay
  error_message TEXT,
  retry_count INT DEFAULT 0,
  next_retry_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled'))
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
```

#### checkout_sessions table
```sql
CREATE TABLE checkout_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  subscription_id BIGINT REFERENCES subscriptions(id),
  status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'expired'
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'DZD',
  metadata JSONB, -- Store custom data
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'expired'))
);

CREATE INDEX idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX idx_checkout_sessions_session_token ON checkout_sessions(session_token);
CREATE INDEX idx_checkout_sessions_status ON checkout_sessions(status);
```

---

## 🔌 RedotPay API Integration

### Environment Variables Required
```bash
REDOTPAY_API_KEY=your_api_key_here
REDOTPAY_SECRET_KEY=your_secret_key_here
REDOTPAY_WEBHOOK_SECRET=your_webhook_secret_here
REDOTPAY_API_URL=https://api.redotpay.com/v1
REDOTPAY_REDIRECT_URL=https://ecopro.com/billing/success
```

### RedotPay Checkout Session Creation API
```
POST https://api.redotpay.com/v1/checkout/sessions
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "amount": 700, // in cents (700 = 7.00 DZD)
  "currency": "DZD",
  "customer_email": "user@example.com",
  "customer_phone": "+213123456789",
  "description": "EcoPro monthly subscription",
  "metadata": {
    "user_id": 123,
    "subscription_id": 456,
    "type": "subscription_renewal"
  },
  "success_url": "https://ecopro.com/billing/success?session={session_id}",
  "cancel_url": "https://ecopro.com/billing/cancelled"
}

RESPONSE:
{
  "session_id": "sess_123abc456def",
  "checkout_url": "https://checkout.redotpay.com/pay/sess_123abc456def",
  "expires_at": "2025-12-21T12:00:00Z",
  "status": "pending"
}
```

### Webhook Event Structure
```
POST https://ecopro.com/api/billing/webhook/redotpay
X-RedotPay-Signature: <HMAC-SHA256 signature>
Content-Type: application/json

{
  "event": "payment.completed",
  "data": {
    "session_id": "sess_123abc456def",
    "transaction_id": "txn_123abc456def",
    "amount": 700,
    "currency": "DZD",
    "status": "completed",
    "customer_email": "user@example.com",
    "metadata": {
      "user_id": 123,
      "subscription_id": 456,
      "type": "subscription_renewal"
    },
    "paid_at": "2025-12-21T10:30:00Z"
  },
  "timestamp": "2025-12-21T10:30:00Z"
}
```

---

## 🛠️ Implementation Steps

### Step 1: Create Database Migrations
**File**: `server/migrations/20251221_add_payments_tables.sql`

### Step 2: Create RedotPay Utilities
**File**: `server/utils/redotpay.ts`
- Session creation
- Signature verification (HMAC-SHA256)
- Error handling

### Step 3: Create Billing Routes
**File**: `server/routes/billing.ts` (expand existing)
- POST /api/billing/checkout - Create checkout session
- POST /api/billing/webhook/redotpay - Handle webhook
- GET /api/billing/payments - Get payment history
- GET /api/billing/subscription - Get current subscription

### Step 4: Update Server Integration
**File**: `server/index.ts`
- Import billing routes
- Register webhook endpoint
- Add raw body parser for signature verification

### Step 5: Create Billing UI
**File**: `client/pages/admin/Billing.tsx` (expand or create)
- Show current subscription status
- Show next renewal date
- Payment history table
- "Renew Subscription" button
- Billing receipts

### Step 6: Create Success/Failure Pages
**Files**:
- `client/pages/BillingSuccess.tsx`
- `client/pages/BillingCancelled.tsx`

---

## 📊 Data Flow

### Checkout Flow
```
1. User clicks "Renew Subscription" button
   ↓
2. Frontend calls POST /api/billing/checkout
   ↓
3. Backend:
   - Validates user auth
   - Creates checkout_sessions record
   - Calls RedotPay API to create session
   - Returns checkout_url
   ↓
4. Frontend redirects to checkout_url
   ↓
5. User fills payment details on RedotPay
   ↓
6. RedotPay processes payment
   ↓
7. If successful:
   - RedotPay sends webhook to /api/billing/webhook/redotpay
   - Backend verifies HMAC signature
   - Backend updates subscription status to 'active'
   - Backend redirects user to /billing/success
   ↓
8. User sees "Payment successful" and can use store again
```

### Webhook Flow
```
1. RedotPay sends webhook (event: payment.completed)
   ↓
2. Backend endpoint receives webhook
   ↓
3. Verify HMAC-SHA256 signature using REDOTPAY_WEBHOOK_SECRET
   ↓
4. Check if transaction_id already processed (idempotency)
   ↓
5. Extract user_id and subscription_id from metadata
   ↓
6. Update subscriptions table:
   - SET status = 'active'
   - SET period_start = NOW()
   - SET period_end = NOW() + 1 month
   ↓
7. Create payments record with transaction_id
   ↓
8. Send success email to user
   ↓
9. Return 200 OK to RedotPay
```

---

## 💰 Pricing Details

### Subscription Tiers
- **Free Trial**: 30 days (period_start + 30 days = trial_ends_at)
- **Pro**: $7/month (700 Algerian Dinars)
- No limitations on features

### Payment Terms
- Recurring monthly (auto-renew by default)
- Can be cancelled anytime
- Pro-rated refunds on cancellation
- 3 retry attempts for failed payments

---

## 🔐 Security Considerations

### Webhook Signature Verification
```typescript
// Verify RedotPay webhook authenticity
const hmac = crypto
  .createHmac('sha256', REDOTPAY_WEBHOOK_SECRET)
  .update(rawBodyString)
  .digest('hex');

if (hmac !== req.headers['x-redotpay-signature']) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### Idempotency
- Store transaction_id in payments table with UNIQUE constraint
- Check if transaction_id exists before processing
- Prevent duplicate charges if webhook retried

### Payment Amount Validation
- Verify amount = 700 (exactly $7.00)
- Verify currency = 'DZD'
- Fail if amount mismatch (fraud prevention)

---

## 📈 Monitoring & Alerts

### Metrics to Track
- Total revenue (MRR - Monthly Recurring Revenue)
- Payment success rate (% completed vs failed)
- Failed payment count (retry attempts)
- Churn rate (cancelled subscriptions)
- New signups with immediate payment
- Payment method breakdown

### Admin Alerts
- Large payment failures (>5 failed in 1 hour)
- Webhook failures (check logs)
- Unusual transaction amounts
- Multiple failed attempts from same user

---

## 🧪 Testing Strategy

### Test Scenarios
1. **Successful Payment**: User pays $7 → subscription updates
2. **Failed Payment**: Payment declined → error shown, retry offered
3. **Webhook Retry**: Webhook received twice → only process once
4. **Invalid Signature**: Tampered webhook → reject with 401
5. **Amount Mismatch**: Webhook with wrong amount → reject with 400
6. **Expired Session**: User takes >30min on checkout → session expires
7. **Network Timeout**: Webhook send fails → RedotPay retries
8. **Concurrent Payments**: Same user pays twice → handle correctly

### Test Cards (RedotPay)
- `4532 1111 1111 1111` - Visa, succeeds
- `5555 5555 5555 4444` - Mastercard, declines
- `3782 822463 10005` - Amex, succeeds

---

## 📝 Implementation Checklist

- [ ] Create payments table
- [ ] Create checkout_sessions table
- [ ] Create redotpay.ts utilities
- [ ] Create /api/billing/checkout endpoint
- [ ] Create /api/billing/webhook/redotpay endpoint
- [ ] Add raw body parser to server/index.ts
- [ ] Expand Billing UI page
- [ ] Create BillingSuccess.tsx
- [ ] Create BillingCancelled.tsx
- [ ] Add environment variables
- [ ] Test checkout flow end-to-end
- [ ] Test webhook verification
- [ ] Test payment history display
- [ ] Test failed payment retry
- [ ] Deploy to staging
- [ ] Smoke test on staging
- [ ] Deploy to production

---

## 🚀 Estimated Timeline

| Component | Time | Difficulty |
|-----------|------|-----------|
| Database migrations | 30 min | Easy |
| RedotPay utilities | 1 hour | Medium |
| Checkout endpoint | 1 hour | Medium |
| Webhook endpoint | 1.5 hours | Hard |
| Billing UI | 1.5 hours | Medium |
| Integration testing | 2 hours | Hard |
| **TOTAL** | **~7-8 hours** | - |

---

## 📞 RedotPay Documentation

- API Docs: https://docs.redotpay.com/api/
- Webhook Events: https://docs.redotpay.com/webhooks/
- Test Mode: Use API_KEY with `-test` suffix
- Support: support@redotpay.com

---

## 🔗 Reference Files

- Phase 1 (Database): PHASE1_BILLING_COMPLETE.md
- Phase 2 (Enforcement): PHASE2_IMPLEMENTATION_COMPLETE.md
- Billing Routes: server/routes/billing.ts (Phase 1 - get methods)
- Billing Admin: client/pages/admin/Billing.tsx

---

Next: Start with Task 1 - Database migrations for payments tables
