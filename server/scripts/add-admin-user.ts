import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function addAdminUser() {
  let client;
  try {
    console.log('🔐 Adding admin user to database...');
    console.log(`📍 Connecting to: ${process.env.DATABASE_URL?.substring(0, 50)}...`);

    client = await pool.connect();
    console.log('✓ Connected to database');

    const email = 'admin@ecopro.com';
    const password = 'admin123';

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✓ Password hashed');

    // Insert or update admin user
    const result = await client.query(
      `INSERT INTO users (email, password, is_verified, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET
         role = $4,
         is_verified = $3,
         password = $2,
         updated_at = NOW()
       RETURNING id, email, role`,
      [email, passwordHash, true, 'admin']
    );

    const admin = result.rows[0];
    console.log('✓ Admin user created/updated:');
    console.log(`  - Email: ${admin.email}`);
    console.log(`  - Role: ${admin.role}`);
    console.log(`  - ID: ${admin.id}`);
    console.log('\n✅ Admin user is ready!');
    console.log('\nLogin with:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding admin user:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

addAdminUser();
