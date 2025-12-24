import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

// Load env from .env then fall back to .env.production (without printing secrets)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });
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

async function runPendingMigrationsDirect() {
  const migrationsDir = path.resolve(process.cwd(), 'server', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found; skipping SQL migrations');
    return;
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  const pool = new Pool({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
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
        await client.query('ROLLBACK');
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
