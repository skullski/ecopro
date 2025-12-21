Title: Remove premium gating, standardize API errors, and fix marketplace visibility

Summary:
- Removed VIP/premium gating across frontend and backend; platform is now free for all.
- Standardized JSON error responses across server routes using `server/utils/httpHelpers.jsonError()` and `jsonValidationErrors()`.
- Fixed marketplace product visibility: GET `/api/products` now returns marketplace-visible products and public product creation sets `published=true` and `visibility_source='marketplace'` by default.
- Added a seller signup page at `/seller-signup` and wired it into routing.
- Drafted a non-destructive migration `server/migrations/20251124_add_optional_product_columns.sql` to add `owner_email`, `views`, and `favorites` columns (not applied automatically).
- Added migration guidance `server/migrations/MIGRATIONS_README.md` with backup and verify steps.
- Replaced a broken legacy vendor dashboard file with a minimal placeholder to avoid TS build errors; original content preserved in `client/pages/VendorDashboard-old.tsx.disabled`.
- Created minimal smoke test script `test-auth.sh` and validated core flows (register/login/vendor creation/public product creation/listing).

Files changed (high level):
- server/routes/*: standardized errors and fixed several routes
- server/utils/productsDb.ts: explicit columns, snake/camel mapping, safe inserts
- client/pages/*: neutralized premium UI, added `/seller-signup`
- server/migrations/*: added non-destructive migration + README
- test-auth.sh: minimal smoke test

How to test locally:
1) Start development servers:

```bash
pnpm install
pnpm dev
```

2) In another terminal, run the smoke test (ensure server is on port 8080):

```bash
bash ./test-auth.sh
```

3) Optionally run typecheck and tests:

```bash
pnpm -s typecheck
pnpm -s test
```

Notes & Next Steps:
- The migration is NOT applied automatically. To apply it, provide a staging `DATABASE_URL` and I can run backup + migration for you.
- I replaced/stubbed a few legacy bits to make the repo build cleanly; if you want, I can work on restoring/refactoring the legacy dashboard under a separate branch.
- I can open the GitHub PR (link above) with reviewers if you want me to add labels or request specific reviewers.

PR link suggestion:
https://github.com/skullski/ecopro/pull/new/remove-premium-standardize-errors-marketplace-fixes
