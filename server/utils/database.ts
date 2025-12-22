import { Pool } from "pg";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let pool: Pool | null = null;

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  user_type?: string;
  is_verified?: boolean;
}

export async function ensureConnection(retries = 5): Promise<Pool> {
  if (!pool) {
    let connectionString = process.env.DATABASE_URL || '';
    const hasQuery = connectionString.includes('?');
    const hasSslMode = /[?&]sslmode=\w+/i.test(connectionString);
    if (connectionString && !hasSslMode) {
      connectionString = connectionString + (hasQuery ? '&' : '?') + 'sslmode=require';
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      min: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
      statementTimeoutMillis: 30000,
    });
  }

  let attempt = 0;
  let lastError: any = null;
  while (attempt <= retries) {
    try {
      await pool!.query('SELECT 1');
      return pool!;
    } catch (err) {
      lastError = err;
      console.error(`DB connect attempt ${attempt + 1} failed:`, (err as any)?.message || err);
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(res => setTimeout(res, delay));
      attempt++;
    }
  }
  throw lastError || new Error('Failed to establish database connection');
}

export async function initializeDatabase(): Promise<void> {
  await ensureConnection();
}

// Run pending .sql migrations in migrations directory
export async function runPendingMigrations(): Promise<void> {
  // Prefer the source tree migrations directory so production builds can find .sql files
  const candidates = [
    path.resolve(process.cwd(), 'server', 'migrations'),
    path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations'),
    path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations'),
  ];
  const migrationsDir = candidates.find((p) => fs.existsSync(p));
  if (!migrationsDir) {
    console.log('No migrations directory found; skipping SQL migrations');
    return;
  }
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  const client = await pool.connect();
  try {
    for (const file of files) {
      // Skip destructive drop-all migration in automated runs
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
        const msg = (e as any)?.message || '';
        // If the failure is due to existing relations or objects, consider the migration idempotent and mark as applied
        if (msg.includes('already exists') || msg.includes('relation') && msg.includes('already exists')) {
          console.warn(`⚠️ Migration reported existing objects (${file}); marking as applied.`);
          await client.query('INSERT INTO schema_migrations(filename) VALUES ($1) ON CONFLICT DO NOTHING', [file]);
          console.log(`✅ Migration marked applied: ${file}`);
          continue;
        }
        console.error(`❌ Migration failed (${file}):`, msg);
        break; // Stop further migrations on unexpected failure
      }
    }
  } finally {
    client.release();
  }
}

/**
 * Find user by email - checks admins and clients tables
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  // First try admins table
  let result = await pool.query(
    "SELECT id, email, password, full_name as name, role, user_type, is_verified, is_locked, locked_reason, created_at, updated_at FROM admins WHERE email = $1",
    [email]
  );
  
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  
  // Then try clients table
  result = await pool.query(
    "SELECT id, email, password, name, role, user_type, is_verified, is_locked, locked_reason, created_at, updated_at FROM clients WHERE email = $1",
    [email]
  );
  
  return result.rows[0] || null;
}

/**
 * Find user by ID - checks admins and clients tables
 */
export async function findUserById(id: string): Promise<User | null> {
  // First try admins table
  let result = await pool.query(
    "SELECT id, email, password, full_name as name, role, user_type, is_verified, created_at, updated_at FROM admins WHERE id = $1",
    [id]
  );
  
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  
  // Then try clients table
  result = await pool.query(
    "SELECT id, email, password, name, role, user_type, is_verified, created_at, updated_at FROM clients WHERE id = $1",
    [id]
  );
  
  return result.rows[0] || null;
}

/**
 * Create new user - inserts into clients table for regular users
 */
export async function createUser(user: {
  email: string;
  password: string;
  name: string;
  role?: string;
  user_type?: string;
}): Promise<User> {
  // New users always go to clients table, not staff
  const result = await pool.query(
    `INSERT INTO clients (email, password, name, role, user_type, is_verified, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5, false, NOW(), NOW()) 
     RETURNING id, email, password, name, role, user_type, is_verified, created_at, updated_at`,
    [user.email, user.password, user.name, user.role || 'client', user.user_type || 'client']
  );
  return result.rows[0];
}

/**
 * Update user - now updates clients table
 */
export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<User | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== "id" && key !== "created_at") {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    return findUserById(id);
  }

  values.push(id);
  
  // First check if this is an admin
  const adminResult = await pool.query('SELECT id FROM admins WHERE id = $1', [id]);
  if (adminResult.rows.length > 0) {
    const result = await pool.query(
      `UPDATE admins SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING id, email, password, full_name as name, role, user_type, is_verified, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  } else {
    // Update client
    const result = await pool.query(
      `UPDATE clients SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING id, email, password, name, role, user_type, is_verified, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  }
}

/**
 * Delete user - now deletes from admins or clients table based on where they exist
 */
export async function deleteUser(id: string): Promise<boolean> {
  // Check if admin
  let result = await pool.query(
    "DELETE FROM admins WHERE id = $1 RETURNING id",
    [id]
  );
  
  if (result.rowCount && result.rowCount > 0) {
    return true;
  }
  
  // Delete from clients if not admin
  result = await pool.query(
    "DELETE FROM clients WHERE id = $1 RETURNING id",
    [id]
  );
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Create default admin user if not exists
 */
export async function createDefaultAdmin(
  email: string,
  hashedPassword: string
): Promise<void> {
  const existingAdmin = await findUserByEmail(email);
  if (!existingAdmin) {
    await pool.query(
      `INSERT INTO admins (email, password, full_name, role, user_type, is_verified, created_at, updated_at)
       VALUES ($1, $2, 'Admin User', 'admin', 'admin', true, NOW(), NOW())`,
      [email, hashedPassword]
    );
    console.log(`✅ Default admin user created: ${email}`);
  }
}

/**
 * Get database pool - ensures connection before returning
 */
export async function getPool(): Promise<Pool> {
  return ensureConnection();
}

/**
 * Close database pool
 */
export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    await pool.end();
  }
}

// Export pool for backward compatibility (but it may be null initially)
export { pool };
