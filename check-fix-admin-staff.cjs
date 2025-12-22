require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAndFix() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check staff table
    console.log('\n=== Current Staff ===');
    const staffResult = await client.query('SELECT id, email, full_name, role FROM staff;');
    console.log(staffResult.rows);
    
    // Check if admin@ecopro.com is in staff
    const adminInStaffResult = await client.query(
      "SELECT id FROM staff WHERE email = 'admin@ecopro.com';"
    );
    
    if (adminInStaffResult.rows.length > 0) {
      console.log('\n⚠️  Found admin@ecopro.com in staff table - DELETING');
      await client.query(
        "DELETE FROM staff WHERE email = 'admin@ecopro.com';"
      );
      console.log('✅ Deleted admin@ecopro.com from staff table');
    } else {
      console.log('\n✅ admin@ecopro.com is not in staff table');
    }
    
    // Check admins table
    console.log('\n=== Current Admins ===');
    const adminsResult = await client.query('SELECT id, email, full_name, role, user_type FROM admins;');
    console.log(adminsResult.rows);
    
    // Check clients table
    console.log('\n=== Current Clients (first 5) ===');
    const clientsResult = await client.query('SELECT id, email, name, user_type FROM clients LIMIT 5;');
    console.log(clientsResult.rows);
    
    await client.end();
    console.log('\n✅ Done');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAndFix();
