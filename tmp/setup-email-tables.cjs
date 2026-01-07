require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function run() {
  try {
    // Check if email_verifications table exists
    const result = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_verifications')"
    );
    console.log('email_verifications table exists:', result.rows[0].exists);
    
    if (!result.rows[0].exists) {
      console.log('Creating email_verifications table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS email_verifications (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          code VARCHAR(6) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          attempts INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(email, code)
        )
      `);
      await pool.query('CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email)');
      console.log('email_verifications table created!');
    }
    
    // Check password_resets table
    const result2 = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'password_resets')"
    );
    console.log('password_resets table exists:', result2.rows[0].exists);
    
    if (!result2.rows[0].exists) {
      console.log('Creating password_resets table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS password_resets (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          token_hash VARCHAR(64) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      await pool.query('CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON password_resets(expires_at)');
      console.log('password_resets table created!');
    }
    
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

run();
