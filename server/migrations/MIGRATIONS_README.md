Migration application guide

This repository includes a non-destructive migration file:

- `20251124_add_optional_product_columns.sql` — adds optional columns (`owner_email`, `views`, `favorites`) and indexes to the `products` table.
- `20251124_add_optional_product_columns.sql` — adds optional columns (`owner_email`, `views`, `favorites`) and indexes to the `products` table.

Example: why this migration exists

- Some older code paths (anonymous seller flows) reference `owner_email`, `views`, and `favorites`.
- The migration is additive and safe to apply in staging to ensure those fields exist and are indexable for lookups (e.g., claim-by-email flows).

Quick verification after applying:

```bash
psql "$DATABASE_URL" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products' ORDER BY ordinal_position;"
psql "$DATABASE_URL" -c "SELECT indexname, indexdef FROM pg_indexes WHERE tablename='products';"
```

Contact me if you want me to apply this to a staging DB — provide a staging `DATABASE_URL` and I'll run a backup and apply it.

Before running migrations

1. Backup your production/staging database.
   - Use `pg_dump` to create a full dump:

```bash
export DATABASE_URL="postgres://user:pass@host:5432/dbname"
pg_dump "$DATABASE_URL" -Fc -f backup-$(date +%Y%m%d_%H%M%S).dump
```

2. Review the migration file.
   - Open `server/migrations/20251124_add_optional_product_columns.sql` and confirm the ALTER statements are acceptable for your schema.

3. Test in a staging environment first.
   - Apply the migration to a staging DB identical to production.

How to apply the migration

1. Set `DATABASE_URL` to the target database.

```bash
export DATABASE_URL="postgres://user:pass@host:5432/dbname"
```

2. Run the migration using `psql`:

```bash
psql "$DATABASE_URL" -f server/migrations/20251124_add_optional_product_columns.sql
```

3. Verify the columns were added:

```bash
psql "$DATABASE_URL" -c "\d products"
```

Rollback strategy

- This migration is additive (adds columns and indexes). To rollback, you can remove the columns with `ALTER TABLE products DROP COLUMN ...` — this is destructive and will lose data stored in those columns.
- Prefer restoring from the `pg_dump` backup if you need to revert.

Notes & safety

- Do not run migrations directly on production without a backup and maintenance window.
- If using a managed DB (RDS, Cloud SQL), verify downtime requirements for schema changes and test on a clone first.
- If you use a migration tool (Flyway, Liquibase, etc.), adapt the SQL file to your toolchain.

If you want, I can apply this migration to a staging database (you must provide a `DATABASE_URL` with a test database).