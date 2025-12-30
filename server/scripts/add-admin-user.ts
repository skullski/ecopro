import dotenv from 'dotenv';
import { createDefaultAdmin, initializeDatabase, runPendingMigrations } from '../utils/database';
import { hashPassword } from '../utils/auth';

dotenv.config();

async function addAdminUser() {
  try {
    console.log('🔐 Adding admin user to database...');

    const email = (process.env.DEFAULT_ADMIN_EMAIL || '').trim();
    const password = (process.env.DEFAULT_ADMIN_PASSWORD || '').trim();

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    if (!email || !password) {
      throw new Error('DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD must be set');
    }

    await initializeDatabase();
    await runPendingMigrations();

    const passwordHash = await hashPassword(password);
    await createDefaultAdmin(email, passwordHash);

    console.log('✅ Admin bootstrap complete');
    console.log(`  Email: ${email}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding admin user:', error);
    process.exit(1);
  }
}

addAdminUser();
