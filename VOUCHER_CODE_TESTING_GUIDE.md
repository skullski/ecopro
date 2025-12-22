# Voucher Code Usage Testing Guide

## Overview

This guide shows you how to simulate an expired account scenario and test voucher code redemption to reactivate it.

## Quick Start (5 minutes)

### Step 1: Create a Test Account

Go to the signup page and create a new account:
- Email: `voucher-test@example.com` (or any email)
- Password: Any secure password
- Name: "Voucher Test User"

Login with these credentials and note:
- Your **Client ID** (visible in profile or API response)
- Your **Auth Token** (from localStorage in browser console)

### Step 2: Set Account to Expired

Connect to the Render PostgreSQL database and run this SQL:

```sql
-- Set subscription to expired
UPDATE subscriptions
SET status = 'expired',
    current_period_end = NOW() - INTERVAL '1 day'
WHERE user_id = (SELECT id FROM clients WHERE email = 'voucher-test@example.com');

-- Lock the account
UPDATE clients
SET is_locked = true,
    locked_reason = 'Subscription expired. Please renew to continue.',
    locked_at = NOW()
WHERE email = 'voucher-test@example.com';
```

**Result:** Account is now locked and cannot be used until subscription is renewed.

### Step 3: Generate a Voucher Code

1. Login to the platform as **admin**
2. Go to **Admin Dashboard > Codes** tab
3. Select a tier: Bronze, Silver, or Gold
4. Click **"Generate Code"**
5. **Copy the generated code** from the page

**Example code format:** `A1B2-C3D4-E5F6-G7H8`

### Step 4: Redeem the Code

Using the test account:

**Option A: Via Frontend (Codes page)**
1. Go to `/codes` page
2. Paste the voucher code
3. Click "Redeem"
4. ✅ Account is unlocked and subscription reactivated

**Option B: Via API (cURL)**

```bash
curl -X POST http://localhost:8080/api/codes/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "code": "A1B2-C3D4-E5F6-G7H8"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "subscription": {
    "id": 123,
    "user_id": 456,
    "status": "active",
    "current_period_end": "2025-01-21T14:58:00.000Z",
    "updated_at": "2025-12-22T14:58:00.000Z"
  },
  "message": "Code redeemed successfully. Your subscription is now active for 30 days!"
}
```

### Step 5: Verify Reactivation

Check the account status:

```bash
curl -X GET http://localhost:8080/api/billing/subscription \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

Should show:
- `status: "active"`
- `hasAccess: true`
- `current_period_end`: 30 days from now

## What Happens During Redemption

When a voucher code is redeemed:

1. **Code Validation**
   - ✓ Code format check (XXXX-XXXX-XXXX-XXXX)
   - ✓ Code expiry check (must not be expired)
   - ✓ Code status check (must be 'issued', not already used)

2. **Database Updates** (in transaction)
   - ✓ Mark code as 'used'
   - ✓ Record redemption: `redeemed_by_client_id`, `redeemed_at`, `ip_address`
   - ✓ Create/update subscription: set to 'active' for 30 days
   - ✓ Unlock client account if locked

3. **Response**
   - ✓ Return updated subscription data
   - ✓ Show success message with new expiration date

## Testing Scenarios

### Scenario 1: Basic Redemption (Most Common)
**Setup:**
- Account with expired subscription
- Account locked

**Test:**
- Generate voucher code
- Redeem code
- Verify account unlocked and active

**Expected Result:** ✅ Account reactivated for 30 days

### Scenario 2: Code Expiration (1 Hour Limit)
**Setup:**
- Generate code
- Wait 1+ hour
- Try to redeem

**Expected Result:** ❌ Code expired error

### Scenario 3: Double Redemption (Single-Use)
**Setup:**
- Generate code
- First account redeems it
- Second account tries to redeem same code

**Expected Result:**
- ✅ First account: Success
- ❌ Second account: "Code already redeemed" error

### Scenario 4: Wrong Tier (Should NOT Happen with Current Design)
**Setup:**
- Issue code for 'bronze' tier
- Any account can redeem (codes are tier-agnostic for now)

**Expected Result:** ✅ Redeems successfully regardless of account tier

### Scenario 5: Assigned vs Unassigned Codes
**Setup A (Unassigned - Current Default):**
- Generate code WITHOUT specifying client
- Any client can redeem

**Setup B (Assigned - For Future):**
- Generate code FOR specific client
- Only that client can redeem

## API Endpoints for Testing

### 1. Generate Code (Admin Only)
```
POST /api/codes/admin/issue
Headers: Authorization: Bearer ADMIN_TOKEN
Body: { "tier": "bronze" }
Response: { "success": true, "code": "XXXX-XXXX-XXXX-XXXX", "expires_at": "..." }
```

### 2. List Codes (Admin Only)
```
GET /api/codes/admin/list?limit=20&offset=0
Headers: Authorization: Bearer ADMIN_TOKEN
Response: Array of code objects with metadata
```

### 3. Redeem Code (Client)
```
POST /api/codes/redeem
Headers: Authorization: Bearer CLIENT_TOKEN
Body: { "code": "XXXX-XXXX-XXXX-XXXX" }
Response: { "success": true, "subscription": {...} }
```

### 4. Get Subscription Status
```
GET /api/billing/subscription
Headers: Authorization: Bearer AUTH_TOKEN
Response: { "status": "active", "hasAccess": true, "current_period_end": "..." }
```

## Automated Test Script

Run the included bash script to automate the flow:

```bash
chmod +x test-voucher-code-flow.sh
./test-voucher-code-flow.sh
```

This script will:
1. Create a test account
2. Guide you through expiring it
3. Prompt you to generate a code in the admin panel
4. Test the redemption

## Manual Database Setup

Use the included SQL script to quickly set up an expired account:

```sql
-- Run this SQL on the Render database
-- File: setup-expired-test-account.sql

-- Creates test account: voucher-test@example.com
-- Sets subscription to expired
-- Locks the account
```

## Tracking Code Usage

View code redemption history:

```sql
-- See all redeemed codes
SELECT * FROM code_requests 
WHERE status = 'used' 
ORDER BY redeemed_at DESC;

-- See redemptions by client
SELECT 
  cr.generated_code,
  cr.code_tier,
  c.email as redeemed_by,
  cr.redeemed_at
FROM code_requests cr
JOIN clients c ON cr.redeemed_by_client_id = c.id
ORDER BY cr.redeemed_at DESC;

-- See activity log
SELECT * FROM code_activity_log
ORDER BY created_at DESC
LIMIT 20;
```

## Troubleshooting

### "Code not found" error
- Check code spelling (case-sensitive? test)
- Verify code format: XXXX-XXXX-XXXX-XXXX
- Verify code hasn't expired (1 hour limit)

### "Code already redeemed" error
- Code was already used by another client
- Generate a new code

### "Rate limit exceeded" error
- Too many redemption attempts
- Wait 5 minutes before retrying

### Account still locked after redemption
- Check subscription status shows "active"
- Refresh browser/app
- Verify `is_locked` is false in database

### "This code was not issued to your account"
- Code was assigned to a different client
- Use an unassigned code instead

## Future Enhancements

1. **Bulk Code Generation** - Generate multiple codes at once
2. **Code Expiry Policies** - Different expiry times per tier
3. **Usage Limits** - Limit codes to specific regions/dates
4. **Batch Redemption** - Apply multiple codes at once
5. **Code Analytics** - Dashboard showing redemption rates
6. **Webhook Notifications** - Alert when codes are redeemed

## Code Generation Rates

Current limits per admin (5-minute window):
- Max 3 code generations per 5 minutes
- Tracked in `code_validation_attempts` table

## Database Schema Reference

### code_requests
```sql
- id (primary key)
- generated_code (UNIQUE, VARCHAR)
- code_tier (ENUM: bronze, silver, gold, general, voucher, license)
- status (ENUM: issued, used, expired, revoked)
- created_at (timestamp)
- expires_at (timestamp, NOW() + 1 hour)
- redeemed_at (timestamp, NULL until used)
- redeemed_by_client_id (FK to clients, NULL until used)
- client_id (FK to clients, NULL for unassigned vouchers)
- ip_address (VARCHAR, captured at redemption)
- payment_method (VARCHAR, 'admin')
```

### subscriptions
```sql
- id (primary key)
- user_id (FK to clients)
- status (ENUM: trial, active, expired, canceled)
- trial_started_at (timestamp)
- trial_ends_at (timestamp)
- current_period_start (timestamp)
- current_period_end (timestamp)
```

### clients (relevant fields)
```sql
- id (primary key)
- email (UNIQUE)
- is_locked (boolean, FALSE by default)
- locked_reason (text, reason for lock)
- locked_at (timestamp)
```

---

**Last Updated:** December 22, 2025
**Version:** 1.0
