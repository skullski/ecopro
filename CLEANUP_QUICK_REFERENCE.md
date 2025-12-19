# Quick Cleanup - Files to DELETE

## 🗑️ Safe to Delete (31 files)

Copy-paste these commands to remove all leftovers:

```bash
# Category 1: Marketplace Leftovers (5 files)
rm -f server/lib/db.ts
rm -f shared/marketplace.ts
rm -rf order-bot
rm -f scripts/e2e_insert_product.js
rm -f scripts/e2e_insert_product.cjs

# Category 2: Debug/Test Files (13 files)
rm -f test-order.cjs
rm -f test-order-final.js
rm -f test-order-creation.js
rm -f test-real-order.js
rm -f test-db-query.js
rm -f test-db-query.cjs
rm -f test-checkout-flow.js
rm -f verify-order-api.js
rm -f diagnose-db.js
rm -f db-query.ts
rm -f create-indexes.ts
rm -f setup-test-data.js
rm -f fix-passwords.ts

# Category 3: Duplicate/Obsolete Scripts (5 files)
rm -f server/scripts/cleanup_admin_client_stores.js
rm -f scripts/run_migration.cjs
rm -f server/run-migration.ts
rm -f server/scripts/setup-database.ts

# Category 4: Temp Directory (9 files - entire folder)
rm -rf tmp

# Category 5: Old Database Utils (1 file)
rm -f server/utils/db.ts
```

## ✅ What to Keep

- ✅ All files in `/client/`
- ✅ All files in `/server/routes/`
- ✅ All files in `/server/middleware/`
- ✅ All files in `/server/migrations/`
- ✅ `/server/index.ts`
- ✅ `/server/dev.ts`
- ✅ `/server/utils/database.ts` (the correct one)
- ✅ `/shared/types.ts`
- ✅ `/shared/api.ts`
- ✅ `/server/scripts/cleanup_admin_client_stores.cjs` (working version)

## 📝 Before You Delete

```bash
# 1. Backup current state
git add .
git commit -m "Pre-cleanup backup"

# 2. Delete the files (copy from above)
# ... paste commands ...

# 3. Verify nothing broke
pnpm typecheck
pnpm build

# 4. Commit cleanup
git add .
git commit -m "cleanup: remove unused marketplace and test files"

# 5. Push
git push
```

## 📊 Summary

- Files to delete: **31**
- Functionality impact: **0** (all unused)
- Risk level: **Very Low**
- Time to complete: **< 5 minutes**

---

See `CLEANUP_LEFTOVERS_GUIDE.md` for detailed explanations.
