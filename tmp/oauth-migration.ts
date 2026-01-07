import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
  const client = await pool.connect();
  try {
    // Check if columns exist
    const { rows } = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('google_id', 'facebook_id', 'avatar_url')
    `);
    const existing = rows.map(r => r.column_name);
    
    if (!existing.includes('google_id')) {
      await client.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE');
      console.log('Added google_id column');
    } else {
      console.log('google_id already exists');
    }
    
    if (!existing.includes('facebook_id')) {
      await client.query('ALTER TABLE users ADD COLUMN facebook_id VARCHAR(255) UNIQUE');
      console.log('Added facebook_id column');
    } else {
      console.log('facebook_id already exists');
    }
    
    if (!existing.includes('avatar_url')) {
      await client.query('ALTER TABLE users ADD COLUMN avatar_url TEXT');
      console.log('Added avatar_url column');
    } else {
      console.log('avatar_url already exists');
    }
    
    console.log('Migration complete!');
  } finally {
    client.release();
    await pool.end();
  }
}
migrate().catch(e => { console.error(e); process.exit(1); });
