#!/usr/bin/env node
/*
  cleanup_admin_client_stores.js

  Safe DB utility to locate client_store_settings rows owned by admin users.
  - By default runs in dry-run mode and prints matching rows
  - --delete will archive matching rows into client_store_settings_archive then delete them
  - --backup-only will only copy matching rows into archive table

  Usage examples:
    node server/scripts/cleanup_admin_client_stores.js         # dry-run (no changes)
    node server/scripts/cleanup_admin_client_stores.js --delete   # archive then delete
    node server/scripts/cleanup_admin_client_stores.js --backup-only # just backup

  NOTE: Requires DATABASE_URL in env pointing to the DB used by this project.
*/

const { Pool } = require('pg');
const readline = require('readline');

const argv = process.argv.slice(2);
const doDelete = argv.includes('--delete');
const backupOnly = argv.includes('--backup-only');
const dryRun = !doDelete && !backupOnly;

const DATABASE_URL = process.env.DATABASE_URL || process.env.DB_URL || null;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable. Set it to your database connection string.');
  process.exit(2);
}

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function promptYesNo(msg) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(msg + ' (y/N) ', (ans) => {
      rl.close();
      resolve(/^y(es)?$/i.test(ans));
    });
  });
}

async function main() {
  console.log('Connecting to DB (dry-run=%s, backupOnly=%s, delete=%s)', dryRun, backupOnly, doDelete);
  const client = await pool.connect();
  try {
    // Find admin-owned client_store_settings
    const findSql = `
      SELECT cs.*
      FROM client_store_settings cs
      JOIN users u ON cs.client_id = u.id
      WHERE u.role = 'admin' OR u.user_type = 'admin'
      ORDER BY cs.client_id
    `;

    const { rows } = await client.query(findSql);
    console.log('\nFound %d admin-owned client_store_settings rows.\n', rows.length);

    if (rows.length === 0) {
      console.log('Nothing to do. Exiting.');
      return;
    }

    // Pretty print a sample of rows
    rows.forEach((r, i) => {
      if (i < 20) {
        console.log(`#${i + 1} client_id=${r.client_id} store_slug=${r.store_slug} owner_name=${r.owner_name} owner_email=${r.owner_email}`);
      }
    });
    if (rows.length > 20) console.log(`...and ${rows.length - 20} more rows (truncated)`);

    if (dryRun) {
      console.log('\nDry-run mode: no changes will be made. Use --backup-only or --delete to act.\n');
      return;
    }

    // Create archive table if needed
    const createArchiveSql = `
      CREATE TABLE IF NOT EXISTS client_store_settings_archive (LIKE client_store_settings INCLUDING ALL);
    `;

    console.log('\nEnsuring archive table exists...');
    await client.query(createArchiveSql);

    if (backupOnly || doDelete) {
      console.log('Backing up matching rows into client_store_settings_archive...');
      const archiveInsertSql = `
        INSERT INTO client_store_settings_archive
        SELECT * FROM client_store_settings cs
        WHERE client_id IN (SELECT id FROM users WHERE role = 'admin' OR user_type = 'admin')
        RETURNING id, client_id, store_slug
      `;
      const res = await client.query(archiveInsertSql);
      console.log(`Backed up ${res.rowCount} rows into client_store_settings_archive`);

      if (backupOnly) {
        console.log('Backup-only requested — finished.');
        return;
      }
    }

    // Confirm deletion
    const ok = await promptYesNo('Are you sure you want to DELETE the admin-owned client_store_settings rows now? This will permanently remove them from client_store_settings (they are archived).');
    if (!ok) {
      console.log('Aborted by user. No deletion was performed.');
      return;
    }

    // Delete safely inside transaction
    await client.query('BEGIN');
    const deleteSql = `
      DELETE FROM client_store_settings
      WHERE client_id IN (SELECT id FROM users WHERE role = 'admin' OR user_type = 'admin')
      RETURNING id, client_id, store_slug
    `;
    const delRes = await client.query(deleteSql);
    await client.query('COMMIT');

    console.log(`Deleted ${delRes.rowCount} rows from client_store_settings (archived first)`);
    console.log('Done — admin-owned client store settings have been archived and removed.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error during cleanup:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
