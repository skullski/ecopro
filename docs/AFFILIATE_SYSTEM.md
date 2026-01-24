# Affiliate/Influencer Marketing System

## Overview

The affiliate system allows influencers to earn commissions by referring new users to the platform. Each affiliate gets a unique voucher code (e.g., `AHMED20`) that users can enter during signup.

## How Payment Works (Manual System)

**Important**: This platform does NOT have automated payment gateway integration. Payments are handled manually through chat:

1. **Store owner** → Messages support saying "I want to pay my subscription"
2. **Support/Admin** → Checks if user has affiliate discount, replies with payment account
3. **Store owner** → Sends money manually (bank transfer, etc.) + sends screenshot proof
4. **Admin** → Verifies screenshot, generates 30-day subscription code
5. **Store owner** → Redeems code on their Profile page → Subscription activated

## How It Works

### For Users (Signing Up with a Voucher Code)
1. User goes to `/signup`
2. Enters their details and the affiliate's voucher code (optional)
3. If the code is valid, they see a message confirming the discount they'll receive
4. After signup, they're linked to that affiliate in the database

### When User Wants to Pay (Chat Flow)
1. User messages support: "I want to pay for my subscription"
2. Admin checks user's affiliate status via API: `GET /api/affiliates/admin/client/:clientId`
3. If user was referred by `AHMED20` with 20% discount:
   - Standard price: $7.00
   - Discount: $1.40
   - User should pay: **$5.60**
4. Admin tells user to pay $5.60 to the payment account
5. User pays and sends screenshot
6. Admin generates subscription code
7. Admin records the payment for commission: `POST /api/affiliates/admin/record-payment`
8. User redeems code on Profile page

**Note**: Each affiliate can have a different discount rate, allowing you to offer bigger discounts to larger influencers.

### For Affiliates (Influencers)
1. Admin creates an affiliate account with email/password
2. Affiliate logs in at `/affiliate/login`
3. Affiliate sees their dashboard at `/affiliate/dashboard` with:
   - Their unique voucher code (can copy to share)
   - Total referrals (users who signed up with their code)
   - Commission earnings (pending vs paid)
   - List of referrals and their subscription status
   - Commission history

### For Admins
1. Go to Platform Admin → Affiliates tab
2. Create new affiliates (set name, email, password, voucher code)
3. Configure commission settings per affiliate:
   - **Discount %**: Discount given to referred users (default 20%)
   - **Commission %**: Affiliate's share of platform revenue (default 50%)
   - **Commission Months**: How many months affiliate earns (default 2)
4. View affiliate performance (referrals, earnings)
5. Process payouts (mark commissions as paid)

## Commission Calculation

When a referred user pays their subscription:

1. System checks if user was referred by an affiliate
2. Counts which payment month this is (1st, 2nd, etc.)
3. If within commission window (default: first 2 months):
   - Commission = User Payment × Commission Percent
   - Example: $7 × 50% = $3.50 per month

**Total potential per referral**: $3.50 × 2 months = $7.00

## Database Tables

### `affiliates`
Stores affiliate accounts:
- `id`, `name`, `email`, `password_hash`
- `voucher_code` (unique, uppercase, e.g., "AHMED20")
- `discount_percent` (default 20%)
- `commission_percent` (default 50%)
- `commission_months` (default 2)
- `status` ('active', 'disabled', 'suspended')
- Cached stats: `total_referrals`, `total_paid_referrals`, `total_commission_earned`, `total_commission_paid`

### `affiliate_referrals`
Links users to affiliates:
- `affiliate_id`, `user_id`
- `voucher_code_used`, `discount_applied`
- `created_at`
- UNIQUE on `user_id` (each user can only be referred once)

### `affiliate_commissions`
Tracks each commission:
- `affiliate_id`, `referral_id`, `user_id`
- `payment_id` (the subscription payment that triggered this)
- `payment_month` (1, 2, etc.)
- `user_paid_amount`, `platform_revenue`
- `commission_percent`, `commission_amount`
- `status` ('pending', 'approved', 'paid', 'cancelled')
- `paid_at`, `paid_by`

### `affiliate_payouts`
Records bulk payout events:
- `affiliate_id`, `amount`
- `payment_method`, `reference`, `notes`
- `paid_by`, `created_at`

### User/Client Columns
Added to `clients` table:
- `referred_by_affiliate_id`
- `referral_voucher_code`

## API Endpoints

### Public
- `GET /api/affiliates/validate/:code` - Validate voucher code

### Affiliate Auth
- `POST /api/affiliates/login` - Login
- `POST /api/affiliates/logout` - Logout
- `GET /api/affiliates/me` - Get profile

### Affiliate Dashboard
- `GET /api/affiliates/stats` - Dashboard stats
- `GET /api/affiliates/referrals` - List referrals
- `GET /api/affiliates/commissions` - Commission history

### Admin (requires admin auth)
- `GET /api/affiliates/admin/list` - List all affiliates
- `POST /api/affiliates/admin/create` - Create affiliate
- `PATCH /api/affiliates/admin/:id` - Update affiliate
- `DELETE /api/affiliates/admin/:id` - Delete affiliate
- `GET /api/affiliates/admin/:id/details` - Full details
- `GET /api/affiliates/admin/stats` - Program overview
- `GET /api/affiliates/admin/client/:clientId` - **Get client's affiliate info (for discount calculation)**
- `POST /api/affiliates/admin/record-payment` - **Record manual payment for commission**
- `POST /api/affiliates/admin/commissions/:id/pay` - Mark single commission paid
- `POST /api/affiliates/admin/commissions/bulk-pay` - Pay all pending for an affiliate

## Admin Workflow (Important!)

### When a referred user wants to pay:

1. **Check affiliate status**:
   ```
   GET /api/affiliates/admin/client/123
   ```
   Response shows:
   ```json
   {
     "has_affiliate": true,
     "affiliate": { "name": "Ahmed", "voucher_code": "AHMED20", "discount_percent": 20 },
     "is_first_payment": true,
     "pricing": {
       "standard_price": 7.00,
       "discount_applicable": true,
       "discount_percent": 20,
       "discount_amount": 1.40,
       "final_price": 5.60
     }
   }
   ```

2. **Tell user to pay the discounted price** ($5.60)

3. **After user pays and you verify screenshot, generate code as usual**

4. **Record the payment for affiliate commission**:
   ```
   POST /api/affiliates/admin/record-payment
   { "client_id": 123, "amount_paid": 5.60, "payment_method": "bank_transfer" }
   ```
   This creates the commission record for the affiliate.
- `DELETE /api/affiliates/admin/:id` - Delete affiliate
- `GET /api/affiliates/admin/:id/details` - Full details
- `GET /api/affiliates/admin/stats` - Program overview
- `POST /api/affiliates/admin/commissions/:id/pay` - Mark single commission paid
- `POST /api/affiliates/admin/commissions/bulk-pay` - Pay all pending for an affiliate

## Frontend Routes

- `/affiliate/login` - Affiliate login page
- `/affiliate/dashboard` - Affiliate dashboard (requires affiliate auth)
- `/platform-admin` → Affiliates tab - Admin management

## Migration

Run the migration to create tables:
```bash
node run-migrations.js
```

Migration file: `/migrations/20260124_affiliate_system.sql`

## Configuration

### Default Settings
- Discount to referred users: 20% off first month
- Commission to affiliate: 50% of platform revenue
- Commission period: First 2 months of subscription

These can be customized per affiliate when creating/editing them.

## Security

- Affiliates have their own JWT tokens (type: 'affiliate')
- Cookie: `affiliate_token` (HttpOnly, 7 day expiry)
- Admin endpoints require admin auth
- Voucher codes are case-insensitive (stored uppercase)
- Password hashed with bcrypt (12 rounds)

## Future Enhancements

1. Email notifications for affiliates (new referral, commission earned)
2. Automatic payouts via payment providers
3. Tiered commission rates based on performance
4. Referral links in addition to voucher codes
5. Analytics dashboard with charts/graphs
6. Affiliate recruitment page (public application form)
