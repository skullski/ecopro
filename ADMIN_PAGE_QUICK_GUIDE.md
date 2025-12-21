# Admin Page Updates - Quick Reference Guide

## 🚀 How to Access New Features

### 1. Payment Failures Dashboard
**URL**: http://localhost:5174/platform-admin?tab=payment-failures  
**Access**: Admin account only  
**Purpose**: Monitor failed payments and manually retry

**What You'll See**:
- 3 summary cards (Total Failed, Pending Retries, Lost Revenue)
- List of all failed payment transactions
- Manual retry button for each transaction
- Automatic retry schedule information

**Key Actions**:
- Click "Retry" button to manually retry a failed payment
- Confirm dialog will appear
- System will mark payment as "pending_retry"

---

### 2. Enhanced Billing Tab
**URL**: http://localhost:5174/platform-admin?tab=billing  
**Access**: Admin account only  
**Purpose**: View subscription metrics and platform settings

**New Feature**: Subscription Status Breakdown
- Shows Trial Active, Active Paid, and Expired subscriptions
- Visual progress bars indicate distribution
- Real-time counts update when page loads

**Existing Features** (improved):
- MRR (Monthly Recurring Revenue) card
- Active/Unpaid/New Signup counts
- Churn Rate and Failed Payments metrics
- Platform settings display (limits, pricing, trial days)

---

### 3. Improved Products Tab
**URL**: http://localhost:5174/platform-admin?tab=products  
**Access**: Admin account only  
**Purpose**: Bulk moderate products and suspend stores

**New Features**:

#### Checkboxes
- Click checkbox next to each product to select
- Click "Select All" checkbox in header to select all visible products
- Selected count displays at top right (e.g., "5 selected")
- Click "Clear" button to deselect all

#### Search & Filter
- Type in search box to find products by title
- Use status dropdown to filter by: All, Active, Inactive
- Real-time filtering (searches as you type)

#### Bulk Actions (appear when products selected)
- **Remove Products** button (red)
  - Click to remove selected products
  - Shows how many will be removed
  - Confirmation dialog appears
  - All selected products permanently deleted

- **Suspend Store(s)** button (orange)
  - Click to suspend stores of selected products
  - Calculates unique store owners
  - Shows how many stores will be suspended
  - Store owners lose access immediately

#### Individual Product Actions
- Flag/Unflag button (existing)
- Product image and details displayed
- Status badge shows current state

---

## 📋 Admin Tabs Overview

| Tab | Purpose | Features |
|-----|---------|----------|
| **Overview** | Platform statistics | Users, stores, products, revenue |
| **Users** | Manage users | Search, promote to admin, delete |
| **Stores** | Manage stores | List, search, view details, suspend |
| **Products** | Content moderation | Flag, search, **bulk remove**, **suspend stores** |
| **Activity** | Audit logs | Real-time staff activity tracking |
| **Billing** | Payment metrics | Revenue, subscriptions, **status breakdown** |
| **Payment Failures** | **NEW!** | Failed payments, retry, schedule |
| **Settings** | Platform config | Max users, max stores limits |

---

## 🔧 Configuration

### Payment Failure Endpoints (Developers)

**Fetch Failed Payments**:
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8080/api/billing/admin/payment-failures
```

**Manually Retry Payment**:
```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"transactionId": "txn_abc123..."}' \
  http://localhost:8080/api/billing/admin/retry-payment
```

**Get Payment Metrics**:
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8080/api/billing/admin/metrics
```

---

## 💡 Usage Tips

### Bulk Operations
1. **Use search first** - Filter to specific products before bulk action
2. **Verify selection** - Check selected count before confirming
3. **Confirmation required** - All bulk actions need confirmation dialog
4. **Immediate effect** - Changes apply immediately after confirmation

### Payment Failures
1. **Manual retry** - Use when automatic retries fail
2. **Check schedule** - See when automatic retries will happen
3. **Monitor revenue** - Lost Revenue card shows impact of failures
4. **Store notification** - Consider notifying affected store owners

### Moderation
1. **Search for problematic content** - Use search box to find specific issues
2. **Flag for review** - Flag individual products if in doubt
3. **Bulk remove** - Remove multiple violations at once
4. **Suspend stores** - For repeat offenders with multiple violations

---

## ⚠️ Important Notes

### Payment Retries
- Automatic retries happen on schedule (5m → 15m → 1h → 24h)
- Manual retry immediately attempts payment with RedotPay
- If retry fails, system updates status back to "failed"
- Email notifications sent to store owner on successful retry (Phase 5)

### Store Suspension
- Suspended store owners lose immediate access to dashboard
- All orders/products remain intact but inaccessible
- Store owner receives warning email (Phase 5)
- Can appeal or pay to reinstate (Phase 6)

### Bulk Removal
- Products permanently deleted (cannot be undone)
- Consider flagging first if unsure
- Store owner can re-upload products (no ban)

---

## 🔐 Access Control

- **Admin only**: Requires `user_type = 'admin'` in database
- **Authentication required**: Must be logged in with admin account
- **RBAC enforced**: All backend routes check admin middleware
- **Audit logging**: All admin actions tracked in activity logs

**Test Admin Account**:
```
Email: admin@ecopro.com
Password: admin123
```

---

## 📊 Monitoring

### Key Metrics to Watch
- **MRR**: Should increase as stores grow
- **Churn Rate**: Keep below 5% ideally
- **Failed Payments**: Monitor for payment processor issues
- **New Signups**: Track weekly/monthly growth
- **Active vs Expired**: More active = healthier platform

### When to Take Action
- Failed payments > 5% → Contact payment processor
- Churn rate > 10% → Review pricing or features
- Suspicious products → Flag and review
- Multiple violations from seller → Consider suspension

---

## 🚀 What's Coming Next

### Phase 4: Payment Retry Logic
- Automatic retry scheduler (in background)
- Email notifications on retry attempts
- Retry history tracking
- Failed payment alerts

### Phase 5: Email Notifications
- Payment failure alerts to store owners
- Suspension warnings
- Renewal reminders
- Newsletter/broadcasts

### Phase 6: Store Management
- Store suspension workflow
- Appeal management system
- Store verification badges
- Repeat offender tracking

---

## ❓ FAQ

**Q: How do I access the admin panel?**  
A: Log in with admin account at `/login`, then navigate to `/platform-admin`

**Q: Can I undo a bulk product removal?**  
A: No, removals are permanent. Use the flag system for review instead.

**Q: What happens when I suspend a store?**  
A: Store owner loses dashboard access immediately. They see account locked message.

**Q: How long until automatic payment retry happens?**  
A: First retry in 5 minutes, then 15 minutes, then 1 hour, then 24 hours.

**Q: Can store owners appeal a suspension?**  
A: Future feature (Phase 6). Currently manual review required.

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review `ADMIN_PAGE_UPDATES_COMPLETE.md` for technical details
3. Check database logs: `SELECT * FROM payments WHERE status = 'failed'`
4. Contact: admin@ecopro.com

---

**Last Updated**: December 21, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅

