# Affiliate Codes (Ad Men) Idea

**Date captured:** 2026-01-13

## Goal
Create a simple, trustworthy way to:
- Attribute new paying customers to specific ad partners (“ad men”) using a unique code.
- Reward the customer with a first-payment discount.
- Reward the ad partner with a commission only after the first payment succeeds.
- Provide an affiliate dashboard so partners can verify conversions and payouts.

## Business Rules (agreed in chat)
- Subscription is monthly (30-day cycle).
- Code/discount applies **only on the first successful month payment**.
- Month 2+ has **no discount and no commission**.
- If a monthly payment is not made, the account becomes locked (existing platform behavior).

### Example pricing (DZD)
- Monthly price: **2000 DZD**
- Discount (first payment only): **500 DZD**
- Affiliate commission (first payment only): **500 DZD**

First month with code:
- Customer pays **1500 DZD**
- Affiliate earns **500 DZD**
- Platform nets **1000 DZD**

Month 2+:
- Customer pays **2000 DZD**
- Affiliate earns **0 DZD**

## Attribution & Trust Model
- The code is evidence of attribution (user likely got it from the ad partner).
- However, payout happens only after payment success.
- Provide transparent statuses so partners trust the numbers:
  - `tracked` (code attached to user; no money yet)
  - `converted` (first payment successful; commission created)
  - `available` (after hold period / refund window)
  - `paid` (admin payout recorded)

## Recommended Implementation Shape (later)

### Data model (concept)
1) **Affiliates**
- Affiliate identity (name/contact), link to a login identity (recommended: `user_type = affiliate`) or separate affiliate entity.

2) **Affiliate Codes**
- Unique code string per affiliate (e.g. `FORSAWEB500`), enabled/disabled, optional max usage.

3) **Affiliate Attributions**
- One row per user that applied a code (user_id, affiliate_code_id, created_at).
- Enforce: one attribution per user.

4) **Affiliate Commissions (Ledger)**
- One row per successful conversion (affiliate_id, user_id, first_payment_id, amount_paid, commission_amount, status, timestamps).
- Ledger must be immutable/append-only in practice.

5) **Affiliate Payouts**
- Record admin payout batches (affiliate_id, amount, method, reference, created_at) and link the paid commission rows.

### Backend API (concept)
- Public/auth user flows:
  - Apply code at signup or before first checkout.
  - First payment endpoint applies discount if eligible.
- Affiliate portal:
  - View codes, tracked signups, conversions, commission totals, payout history.
  - Export statement (CSV) per month.
- Admin:
  - Create/disable codes.
  - View conversions and balances.
  - Mark payouts as paid.

### UI (concept)
- Affiliate dashboard page:
  - Metrics: tracked, converted, pending/available/paid amounts.
  - Conversion list (with masked user reference).
  - Payout history.

## Anti-abuse Rules (recommended)
- Code can only be applied if the user has **never had a successful payment**.
- Code can only be applied **once per user**.
- Prevent self-referral (affiliate cannot use their own code).
- Optional: hold period before commission becomes `available`.

## Open Questions for later
- How affiliates authenticate: new role (`user_type = affiliate`) vs magic link vs admin-only view.
- Hold period duration for commission availability.
- Whether code is applied at signup only, or also allowed on checkout.
- Whether codes should be “public” or “private per affiliate”.
