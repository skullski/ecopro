# CRITICAL TESTING REQUIREMENTS

## Rule for ALL Agent Sessions
**BEFORE committing any code change:**
- ✅ Test the feature locally/manually
- ✅ Verify API endpoints work
- ✅ Check database operations
- ✅ Test error cases
- ✅ Confirm build succeeds
- ✅ Only THEN commit and push

## Current Issues Being Fixed

### Lock Account Error: "Failed to access account"
- **Status**: Debugging
- **Endpoint**: POST /api/admin/lock-account
- **Issue**: Error returned when locking accounts
- **Root Cause**: Being investigated
- **Fix**: In progress

## Features Requiring Full Testing

### 1. Account Lock/Unlock Management
- GET /api/admin/locked-accounts - List ALL accounts
- POST /api/admin/lock-account - Lock with reason
- POST /api/admin/unlock-account - Unlock with extend/mark_paid options
- UI: Bulk select and bulk operations

### 2. Testing Checklist
```
- [ ] Can fetch all accounts
- [ ] Can lock single account
- [ ] Can lock multiple accounts (bulk)
- [ ] Can unlock single account
- [ ] Can unlock multiple accounts (bulk)
- [ ] Extend subscription option works
- [ ] Mark as paid temporarily works
- [ ] Reasons/notes saved correctly
- [ ] Timestamps recorded correctly
- [ ] Filter buttons work (All/Locked/Active)
- [ ] Status badges display correctly
```

## Never Commit Without Testing
Any change to:
- API endpoints
- Database queries
- Bulk operations
- Lock/Unlock logic

Must be tested in development before pushing to Render.
