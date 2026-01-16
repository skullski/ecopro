import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

// Prefer environment variables (Render). Only load local files if DATABASE_URL isn't set.
if (!process.env.DATABASE_URL) {
  // Local/dev convenience: allow secrets in .env.local (gitignored)
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });
  }
}

function getConnectionString() {
  let connectionString = process.env.DATABASE_URL || '';
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  const hasQuery = connectionString.includes('?');
  const hasSslMode = /[?&]sslmode=\w+/i.test(connectionString);
  if (!hasSslMode) {
    connectionString = connectionString + (hasQuery ? '&' : '?') + 'sslmode=require';
  }
  return connectionString;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientDbError(err) {
  const msg = String(err?.message || err || '');
  const code = String(err?.code || '');
  // Common transient conditions on managed Postgres during deploys
  return (
    msg.includes('Connection terminated unexpectedly') ||
    msg.includes('terminating connection') ||
    msg.includes('Connection terminated') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('EPIPE') ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'EPIPE' ||
    // Postgres admin shutdown / restart
    code === '57P01' ||
    code === '57P02' ||
    code === '57P03'
  );
}

async function withRetries(fn, opts) {
  const attempts = Number(opts?.attempts ?? 8);
  const baseDelayMs = Number(opts?.baseDelayMs ?? 500);
  const maxDelayMs = Number(opts?.maxDelayMs ?? 5000);

  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn(i);
    } catch (e) {
      lastErr = e;
      if (!isTransientDbError(e) || i === attempts - 1) throw e;
      const delay = Math.min(baseDelayMs * Math.pow(2, i), maxDelayMs);
      console.warn(`DB transient error (attempt ${i + 1}/${attempts}): ${(e?.message || e)}; retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

async function runPendingMigrationsDirect() {
  const migrationsDir = path.resolve(process.cwd(), 'server', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found; skipping SQL migrations');
    return;
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();


  const attempts = Number(process.env.MIGRATION_CONNECT_RETRIES || 10);
  const baseDelayMs = Number(process.env.MIGRATION_RETRY_BASE_DELAY_MS || 500);
  const maxDelayMs = Number(process.env.MIGRATION_RETRY_MAX_DELAY_MS || 5000);

  await withRetries(
    async () => {
      const pool = new Pool({
        connectionString: getConnectionString(),
        ssl: { rejectUnauthorized: false },
        max: 3,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
      });

      pool.on('error', (err) => {
        console.error('Unexpected DB pool error (migrations):', err?.message || err);
      });

      const client = await pool.connect();
      try {
        await client.query(
          'CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT NOW())'
        );

        for (const file of files) {
          if (file.includes('drop_all_tables')) {
            console.log(`Skipping destructive migration: ${file}`);
            continue;
          }

          const exists = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
          if (exists.rowCount) continue;

          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
          console.log(`Applying migration: ${file}`);
          try {
            await client.query('BEGIN');
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations(filename) VALUES ($1)', [file]);
            await client.query('COMMIT');
            console.log(`✅ Migration applied: ${file}`);
          } catch (e) {
            try {
              await client.query('ROLLBACK');
            } catch {}
            const msg = e?.message || String(e);
            if (msg.includes('already exists') || (msg.includes('relation') && msg.includes('already exists'))) {
              console.warn(`⚠️ Migration reported existing objects (${file}); marking as applied.`);
              await client.query('INSERT INTO schema_migrations(filename) VALUES ($1) ON CONFLICT DO NOTHING', [file]);
              console.log(`✅ Migration marked applied: ${file}`);
              continue;
            }
            console.error(`❌ Migration failed (${file}):`, msg);
            throw e;
          }
        }
      } finally {
        client.release();
        await pool.end();
      }
    },
    { attempts, baseDelayMs, maxDelayMs }
  );
}

async function main() {
  try {
    console.log('Connecting to database...');
    // Just validate DATABASE_URL early
    getConnectionString();
    console.log('✓ DATABASE_URL configured');

    console.log('Running migrations...');
    await runPendingMigrationsDirect();
    console.log('✓ Migrations completed');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err?.message || err);
    process.exit(1);
  }
}

main();
