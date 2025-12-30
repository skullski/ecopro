# Phase 2: Account Lock Enforcement - Implementation Guide

**Status**: Ready to Start  
**Estimated Time**: 1 day (6-8 hours)  
**Priority**: HIGH - Required before launch  

---

## Overview

Phase 2 enforces the billing model by:
1. Preventing access when subscription expires
2. Validating signup limits (max users, max stores)
3. Showing account lock UI with payment options
4. Blocking API calls when account is locked

---

## Task 1: Subscription Check Middleware (2-3 hours)

### Goal
Check subscription status on every store owner API request. Lock access if expired.

### File to Create
`/home/skull/Desktop/ecopro/server/middleware/subscription-check.ts`

### Implementation Steps

```typescript
import { RequestHandler } from "express";
import { pool } from "@/server/utils/database";

export const requireActiveSubscription: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    // Get subscription from database
    const result = await pool.query(
      `SELECT * FROM subscriptions WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(402).json({ 
        error: "No subscription found",
        paymentRequired: true 
      });
    }

    const subscription = result.rows[0];

    // Check if trial is still active
    const now = new Date();
    const trialEnd = new Date(subscription.trial_ends_at);
    
    if (subscription.status === 'trial' && now < trialEnd) {
      // Trial still active, allow access
      return next();
    }

    // Check if paid subscription is active
    if (subscription.status === 'active') {
      const periodEnd = new Date(subscription.period_end);
      if (now < periodEnd) {
        // Paid subscription still active, allow access
        return next();
      }
    }

    // Subscription expired or not active - LOCK ACCOUNT
    return res.status(403).json({
      error: "Subscription expired. Please renew to continue.",
      accountLocked: true,
      paymentLink: "https://redotpay.com/checkout/session_123",
      trialEndedAt: subscription.trial_ends_at,
      renewalUrl: "/api/billing/renew"
    });

  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: "Server error checking subscription" });
  }
};
```

### Where to Use It

Add to these routes in `server/index.ts`:

```typescript
// For all /api/client/* store owner routes
app.use('/api/client/*', requireActiveSubscription);

// For all dashboard and store management
app.use('/api/seller/*', requireActiveSubscription);
app.use('/api/store/*', requireActiveSubscription);
```

### Test It

```bash
# Get valid token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"skull@gmail.com","password":"<TEST_PASSWORD>"}' | jq -r '.token')

# Test subscription active (should succeed)
curl -s http://localhost:8080/api/client/products \
  -H "Authorization: Bearer $TOKEN"

# Test with expired subscription (set trial_ends_at to past date)
# Then try again (should get 403)
```

---

## Task 2: Signup Validation (1-2 hours)

### Goal
Prevent new signups if user limit reached. Prevent store creation if store limit reached.

### File to Modify
`/home/skull/Desktop/ecopro/server/routes/auth.ts`

### Changes Needed

**In the register endpoint**, add this check before creating user:

```typescript
export const register: RequestHandler = async (req, res) => {
  // ... existing validation ...

  // NEW: Check max users limit
  const settingsResult = await pool.query(
    `SELECT max_users FROM platform_settings ORDER BY id DESC LIMIT 1`
  );
  const maxUsers = settingsResult.rows[0]?.max_users || 1000;

  const userCountResult = await pool.query(
    `SELECT COUNT(*) as count FROM users`
  );
  const currentUsers = parseInt(userCountResult.rows[0].count);

  if (currentUsers >= maxUsers) {
    return res.status(429).json({
      error: `Platform user limit reached (${maxUsers} users). Please try again later.`,
      limitReached: true
    });
  }

  // ... existing code to create user ...
};
```

### File to Modify
`/home/skull/Desktop/ecopro/server/routes/client-store.ts`

### Changes Needed

**In the create store endpoint**, add this check:

```typescript
export const createStore: RequestHandler = async (req, res) => {
  // ... existing validation ...

  const userId = (req.user as any)?.id;

  // NEW: Check max stores limit
  const settingsResult = await pool.query(
    `SELECT max_stores FROM platform_settings ORDER BY id DESC LIMIT 1`
  );
  const maxStores = settingsResult.rows[0]?.max_stores || 1000;

  const storeCountResult = await pool.query(
    `SELECT COUNT(*) as count FROM client_store_settings`
  );
  const currentStores = parseInt(storeCountResult.rows[0].count);

  if (currentStores >= maxStores) {
    return res.status(429).json({
      error: `Platform store limit reached (${maxStores} stores). Please try again later.`,
      limitReached: true
    });
  }

  // ... existing code to create store ...
};
```

### Test It

```bash
# Update platform settings to 1 max user
curl -X POST http://localhost:8080/api/billing/admin/settings \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"max_users":1}'

# Try to register new user (should fail with 429)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","password":"test","name":"Test"}'

# Reset to 1000
curl -X POST http://localhost:8080/api/billing/admin/settings \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"max_users":1000}'
```

---

## Task 3: Account Lock UI (1-2 hours)

### Goal
Show account locked screen when accessing expired subscription. Display payment option.

### File to Create
`/home/skull/Desktop/ecopro/client/pages/AccountLocked.tsx`

### Implementation Steps

```typescript
import { useEffect, useState } from 'react';
import { Lock, AlertTriangle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AccountLocked() {
  const [expiryDate, setExpiryDate] = useState<string>('');

  useEffect(() => {
    // Get expiry date from session storage or URL params
    const params = new URLSearchParams(window.location.search);
    const expiry = params.get('expiry') || localStorage.getItem('subscriptionExpiry');
    if (expiry) {
      setExpiryDate(new Date(expiry).toLocaleDateString());
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"></div>
            <div className="relative w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-white">Account Locked</h1>
          <p className="text-slate-400">Your subscription has expired</p>
        </div>

        {/* Alert */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-200">
            <p className="font-semibold">Subscription Expired</p>
            <p className="text-xs mt-1">
              {expiryDate && `on ${expiryDate}`}
              Your store access is temporarily disabled.
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-slate-800/50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Subscription Status:</span>
            <span className="text-red-400 font-semibold">Expired</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Monthly Price:</span>
            <span className="text-white font-semibold">$7.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Auto-Renew:</span>
            <span className="text-slate-300">Available on payment</span>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          onClick={() => {
            // TODO: Redirect to RedotPay checkout
            window.location.href = '/api/billing/create-checkout-session';
          }}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          <CreditCard className="w-5 h-5" />
          Renew Subscription
        </Button>

        {/* Help Text */}
        <p className="text-center text-xs text-slate-500">
          Questions? <a href="mailto:support@ecopro.com" className="text-emerald-400 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}

export default AccountLocked;
```

### File to Modify
`/home/skull/Desktop/ecopro/client/App.tsx`

### Add Route

```typescript
import { AccountLocked } from '@/pages/AccountLocked';

// In your routes section:
<Route path="/account-locked" element={<AccountLocked />} />
```

### Redirect Logic

When a 403 subscription error is received, redirect in `client/lib/api.ts`:

```typescript
// In your fetch wrapper, check for subscription errors:
if (response.status === 403 && data.accountLocked) {
  // Store expiry for display
  localStorage.setItem('subscriptionExpiry', data.expiry);
  // Redirect to lock screen
  window.location.href = '/account-locked?expiry=' + encodeURIComponent(data.trialEndedAt);
  return;
}
```

### Test It

```bash
# 1. Set trial end date to past
PGPASSWORD='...' psql ... -c "UPDATE subscriptions SET trial_ends_at = '2025-01-01' WHERE user_id = 2;"

# 2. Try to access API
curl http://localhost:8080/api/client/products \
  -H "Authorization: Bearer $TOKEN"
# Should get 403 error

# 3. Frontend should redirect to /account-locked

# 4. Reset for testing
PGPASSWORD='...' psql ... -c "UPDATE subscriptions SET trial_ends_at = NOW() + INTERVAL '30 days' WHERE user_id = 2;"
```

---

## Task 4: Integration Testing (1 hour)

### Test Scenarios

**Test 1: Trial Still Active**
```bash
# Should allow access
curl http://localhost:8080/api/client/products \
  -H "Authorization: Bearer $USER_TOKEN"
# Expected: 200 OK
```

**Test 2: Trial Expired**
```bash
# Expire the trial in database
PGPASSWORD='...' psql ... -c \
  "UPDATE subscriptions SET trial_ends_at = '2025-01-01' WHERE user_id = 2;"

# Try to access
curl http://localhost:8080/api/client/products \
  -H "Authorization: Bearer $USER_TOKEN"
# Expected: 403 Forbidden

# Reset
PGPASSWORD='...' psql ... -c \
  "UPDATE subscriptions SET trial_ends_at = NOW() + INTERVAL '30 days' WHERE user_id = 2;"
```

**Test 3: User Limit Enforced**
```bash
# Set max users to 1
curl -X POST http://localhost:8080/api/billing/admin/settings \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"max_users":1}'

# Try to register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@test.com","password":"test","name":"Test 2"}'
# Expected: 429 Too Many Requests

# Reset
curl -X POST http://localhost:8080/api/billing/admin/settings \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"max_users":1000}'
```

**Test 4: Account Locked UI**
```bash
# After trial expires, visit dashboard
http://localhost:8080
# Login with expired account
# Should redirect to /account-locked
# Should show: "Account Locked", "Subscription Expired", "Renew Subscription" button
```

---

## Checklist for Phase 2 Completion

```
Database & API:
☐ Create subscription-check middleware
☐ Add requireActiveSubscription to all /api/client/* routes
☐ Add max_users validation to register endpoint
☐ Add max_stores validation to create store endpoint
☐ Update route registration in server/index.ts

Frontend:
☐ Create AccountLocked.tsx page
☐ Add route in App.tsx
☐ Implement redirect logic in api.ts
☐ Test all UI states (trial active, expired, locked)

Testing:
☐ Test trial still active (access allowed)
☐ Test trial expired (403 error)
☐ Test user limit (429 error)
☐ Test store limit (429 error)
☐ Test account locked UI (redirect and display)
☐ Test admin override (can still manage)

Documentation:
☐ Update AGENTS.md Phase 2 status to complete
☐ Add code comments explaining lock logic
☐ Document error responses in API guide
```

---

## Code Templates Ready to Use

### Middleware Template
Save this for quick implementation:
```typescript
// server/middleware/subscription-check.ts
export const requireActiveSubscription: RequestHandler = async (req, res, next) => {
  // See Task 1 above for full code
};
```

### Validation Template
```typescript
// In auth.ts and client-store.ts
// See Task 2 above for full code
```

### UI Template
```typescript
// client/pages/AccountLocked.tsx
// See Task 3 above for full code
```

---

## Common Pitfalls to Avoid

1. **Don't** forget to add the middleware to ALL store owner routes
2. **Don't** lock admin users (check user_type before applying lock)
3. **Don't** perform heavy queries on every request (cache platform settings)
4. **Don't** show sensitive data in lock screen
5. **Don't** allow access to payment history/data when locked

---

## Questions Answered

**Q: Will existing users be locked when this deploys?**  
A: Only if their trial has ended. New users get 30 days from registration.

**Q: What about paid users?**  
A: Not relevant yet - Phase 3 is payment integration. All Phase 2 is trial-based.

**Q: Should admin be locked?**  
A: No - check `user_type !== 'admin'` before applying lock.

**Q: Can store owners unlock by paying without RedotPay?**  
A: Not in Phase 2 - Phase 3 adds RedotPay integration.

---

## Files Changed Summary

After Phase 2 completion:

```
Created:
  ✅ /server/middleware/subscription-check.ts (new middleware)
  ✅ /client/pages/AccountLocked.tsx (new UI page)

Modified:
  ✅ /server/index.ts (add middleware to routes)
  ✅ /server/routes/auth.ts (add max_users validation)
  ✅ /server/routes/client-store.ts (add max_stores validation)
  ✅ /client/App.tsx (add account-locked route)
  ✅ /client/lib/api.ts (add redirect logic)
  ✅ /AGENTS.md (update Phase 2 status)
```

---

## Estimated Timeline

- **Middleware**: 2-3 hours
- **Validation**: 1-2 hours
- **UI**: 1-2 hours
- **Testing**: 1 hour
- **Total**: 5-8 hours (~1 day)

---

## Next Steps After Phase 2

Once Phase 2 is complete:
1. Commit all changes to main branch
2. Run full test suite
3. Start Phase 3: RedotPay integration (separate guide)
4. Estimated launch: After Phase 3 complete

---

**Status**: ✅ Ready to Implement  
**Start Date**: Next session  
**Priority**: HIGH  
**Blocker for Launch**: YES  

---
