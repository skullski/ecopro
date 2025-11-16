import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function queryDatabase() {
  try {
    console.log('🔍 Connecting to database...\n');
    
    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📊 Tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    console.log('');
    
    // Get users
    const usersResult = await pool.query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC');
    
    console.log('👥 Users in database:');
    if (usersResult.rows.length === 0) {
      console.log('  No users found');
    } else {
      usersResult.rows.forEach(user => {
        console.log(`  - ID: ${user.id}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Role: ${user.role}`);
        console.log(`    Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log('');
      });
    }
    
    console.log('✅ Query completed successfully');
  } catch (error) {
    console.error('❌ Error querying database:', error);
  } finally {
    await pool.end();
  }
}

queryDatabase();
