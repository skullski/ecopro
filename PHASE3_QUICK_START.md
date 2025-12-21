# Phase 3: Quick Start Guide - Payment Integration

**Status**: ✅ Implementation Complete  
**Ready to Test**: YES  
**Estimated Time to Deploy**: 2-3 hours

---

## 1. What's Implemented

Phase 3 adds complete RedotPay payment processing for subscription renewals:

✅ Store owners can now pay $7/month to keep their subscription active  
✅ After 30-day free trial, stores must pay to continue operating  
✅ Secure payment processing with webhook signature verification  
✅ Comprehensive billing dashboard with payment history  
✅ Professional success/cancelled pages for user feedback  

---

## 2. Setup Steps (In Order)

### Step 1: Apply Database Migration (5 minutes)

```bash
# Navigate to repo
cd /home/skull/Desktop/ecopro

# Apply migration
psql -U postgres -d ecopro -f server/migrations/20251221_phase3_payments.sql

# Verify tables created
psql -U postgres -d ecopro -c "\dt checkout_sessions;"
psql -U postgres -d ecopro -c "\dt payment_transactions;"
```

### Step 2: Configure Environment Variables (5 minutes)

Add to `.env.local` or deployment environment:

```bash
# RedotPay API Credentials (get from RedotPay dashboard)
REDOTPAY_API_KEY=your_api_key_here
REDOTPAY_SECRET_KEY=your_secret_key_here
REDOTPAY_WEBHOOK_SECRET=your_webhook_secret_here

# RedotPay Configuration
REDOTPAY_API_URL=https://api.redotpay.com/v1
REDOTPAY_REDIRECT_URL=http://localhost:5173/billing/success

# Application URL (for webhooks)
VITE_API_URL=http://localhost:5173
```

### Step 3: Verify TypeScript Compiles (2 minutes)

```bash
cd /home/skull/Desktop/ecopro
pnpm typecheck | grep -E "BillingSuccess|BillingCancelled|redotpay"

# Should show: 0 matches (no errors for Phase 3 code)
```

### Step 4: Start Development Server (2 minutes)

```bash
pnpm dev

# Should start without errors
# Open http://localhost:5173
```

---

## 3. Quick Test Flow

### Test 1: Access Billing Page

1. Log in as store owner
2. Navigate to `/dashboard/billing`
3. Should see: Subscription status, payment history table, "Renew Now" button

### Test 2: Create Checkout Session

1. Click "Renew Now" button
2. Should see loading state
3. Should redirect to RedotPay checkout page
4. Check browser console for response:
   ```javascript
   // In console:
   await fetch('/api/billing/checkout', {
     method: 'POST',
     headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
   }).then(r => r.json()).then(console.log)
   ```

### Test 3: Mock Successful Payment

At RedotPay test checkout:
- Card: `4111 1111 1111 1111`
- Expiry: `12/25`
- CVV: `123`

Should redirect to `/billing/success` page showing:
- ✓ Green checkmark
- "Payment Successful!"
- Amount: $7.00 DZD
- "Go to Dashboard" button

### Test 4: Cancel Payment

At RedotPay test checkout, click "Cancel"
Should redirect to `/billing/cancelled` page showing:
- ✗ Red X
- "Payment Cancelled"
- "Try Again" button

### Test 5: Check Database

```sql
-- Should see new checkout session
SELECT * FROM checkout_sessions ORDER BY created_at DESC LIMIT 1;

-- Should see payment record (after successful payment)
SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;

-- Should see updated subscription
SELECT status, current_period_end FROM subscriptions WHERE user_id = 1;
```

---

## 4. Files Created

| File | Size | Purpose |
|------|------|---------|
| `server/utils/redotpay.ts` | 350+ lines | RedotPay API integration |
| `server/routes/billing.ts` | +100 lines | New API endpoints |
| `client/pages/admin/Billing.tsx` | 350+ lines | Billing dashboard |
| `client/pages/BillingSuccess.tsx` | 180+ lines | Success page |
| `client/pages/BillingCancelled.tsx` | 220+ lines | Cancelled page |
| `server/migrations/20251221_phase3_payments.sql` | 150+ lines | Database schema |
| `PHASE3_PAYMENT_TESTING_GUIDE.md` | 300+ lines | Testing documentation |
| `PHASE3_COMPLETION_SUMMARY.md` | 500+ lines | Implementation report |

---

## 5. Key Features

### RedotPay Integration
- ✅ Session creation and token generation
- ✅ HTTPS API communication with Bearer auth
- ✅ Amount validation (exactly $7.00 / 700 cents)
- ✅ Webhook signature verification (HMAC-SHA256)
- ✅ Idempotency enforcement (prevent double-charging)

### Database Schema
- ✅ `checkout_sessions` table (tracks active sessions)
- ✅ `payment_transactions` table (audit trail)
- ✅ Enhancements to `payments` and `subscriptions` tables
- ✅ Proper indexes for performance

### API Endpoints
- ✅ `POST /api/billing/checkout` - Create payment session
- ✅ `GET /api/billing/payments` - Payment history
- ✅ `POST /api/billing/webhook/redotpay` - Webhook handler

### User Experience
- ✅ Professional billing dashboard
- ✅ Clear success confirmation page
- ✅ Helpful cancellation page with retry option
- ✅ Payment history with transaction details
- ✅ Real-time subscription status

### Security
- ✅ HMAC-SHA256 webhook verification
- ✅ Duplicate payment prevention (idempotency)
- ✅ Amount validation
- ✅ JWT authentication on payment endpoints
- ✅ Rate limiting (100 req/15 min)

---

## 6. Testing Checklist

Before deployment, verify:

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] TypeScript compiles without errors
- [ ] Create checkout session works
- [ ] Redirect to RedotPay succeeds
- [ ] Test payment with mock card completes
- [ ] Success page displays correctly
- [ ] Subscription updates to 'active' in database
- [ ] Payment recorded with 'completed' status
- [ ] Payment appears in history table
- [ ] Cancel checkout works
- [ ] Cancelled page displays correctly
- [ ] Webhook signature verification works
- [ ] Duplicate webhooks prevented (idempotency)

---

## 7. Deployment Checklist

Before going to production:

- [ ] Update `REDOTPAY_API_KEY` to production key
- [ ] Update `REDOTPAY_SECRET_KEY` to production secret
- [ ] Update `REDOTPAY_WEBHOOK_SECRET` to production secret
- [ ] Update `REDOTPAY_REDIRECT_URL` to production domain
- [ ] Register webhook URL in RedotPay dashboard
- [ ] Verify HTTPS/SSL certificates
- [ ] Test with production RedotPay (if available)
- [ ] Load test concurrent payments
- [ ] Monitor webhook delivery
- [ ] Set up alerts for failed payments

---

## 8. Support URLs

- **Testing Guide**: `PHASE3_PAYMENT_TESTING_GUIDE.md` (detailed test scenarios)
- **Implementation Report**: `PHASE3_COMPLETION_SUMMARY.md` (complete overview)
- **Implementation Spec**: `PHASE3_IMPLEMENTATION_GUIDE.md` (technical details)
- **Webhook Docs**: See RedotPay API documentation

---

## 9. Common Issues & Solutions

### Issue: "Checkout URL is undefined"
**Solution**: Check API response in console, verify REDOTPAY_API_KEY is set

### Issue: "Webhook signature verification failed"
**Solution**: Verify REDOTPAY_WEBHOOK_SECRET matches RedotPay dashboard

### Issue: "Duplicate transaction error"
**Solution**: Normal - system prevents duplicate payments via idempotency check

### Issue: "Payment doesn't update subscription"
**Solution**: Check server logs for webhook processing errors

### Issue: "Can't redirect to RedotPay"
**Solution**: Verify REDOTPAY_REDIRECT_URL environment variable is set

---

## 10. Next Phases

### Phase 4: Payment Retry Logic (8+ hours)
Automatically retry failed payments with exponential backoff:
- Retry after 5 minutes, 15 minutes, 1 hour, 1 day
- Email notifications for each retry
- Admin dashboard for retry management

### Phase 5: Email Notifications (6+ hours)
Automated emails for payment events:
- Payment receipts
- Renewal reminders (7 days before expiry)
- Failed payment alerts
- Account expiration warnings
- PDF receipt attachments

### Phase 6: Admin Analytics (5+ hours)
Dashboard metrics for platform payments:
- Revenue trends
- Payment success rate
- Failed payment analysis
- Churn rate
- Customer lifetime value

---

## 11. Code Structure

```
server/
├── utils/
│   └── redotpay.ts ............... RedotPay API integration (350+ lines)
├── routes/
│   └── billing.ts ................ API endpoints (expanded)
├── migrations/
│   └── 20251221_phase3_payments.sql .. Database schema
└── index.ts ...................... Webhook route registration

client/
├── pages/
│   ├── admin/
│   │   └── Billing.tsx ........... Billing dashboard (350+ lines)
│   ├── BillingSuccess.tsx ........ Success page (180+ lines)
│   └── BillingCancelled.tsx ...... Cancelled page (220+ lines)
└── App.tsx ....................... Router integration
```

---

## 12. Success Criteria

Phase 3 is successfully implemented when:

✅ Store owner can create checkout session  
✅ Store owner is redirected to RedotPay  
✅ Payment processes successfully  
✅ Store owner sees success confirmation  
✅ Subscription updated to 'active'  
✅ Payment recorded in database  
✅ Payment appears in history table  
✅ Webhook signature verification works  
✅ Duplicate payments prevented  
✅ Failed payments handled gracefully  
✅ All TypeScript compiles without errors  
✅ Tests pass end-to-end  

---

**Implementation Date**: December 21, 2025  
**Status**: ✅ COMPLETE & READY FOR TESTING  
**Estimated Deploy Time**: 2-3 hours  
**Next Step**: Configure RedotPay credentials and run testing suite
