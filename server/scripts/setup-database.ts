import 'dotenv/config';
import { ensureConnection, runPendingMigrations } from '../utils/database.js';

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');
    
    const pool = await ensureConnection();
    console.log('✓ Connected to database');
    
    // Create schema_migrations table if it doesn't exist
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id SERIAL PRIMARY KEY,
          filename TEXT UNIQUE NOT NULL,
          applied_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✓ Ensured schema_migrations table exists');
    } finally {
      client.release();
    }
    
    // Run all pending migrations
    await runPendingMigrations();
    
    console.log('\n✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
