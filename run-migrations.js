import { ensureConnection, runPendingMigrations } from './server/utils/database.js';

async function main() {
  try {
    console.log('Connecting to database...');
    const pool = await ensureConnection();
    console.log('✓ Connected to database');
    
    console.log('Running migrations...');
    await runPendingMigrations();
    console.log('✓ Migrations completed');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
