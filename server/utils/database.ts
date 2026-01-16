import { Pool } from "pg";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let pool: Pool | null = null;

let lastPingAt = 0;
let pingInFlight: Promise<void> | null = null;

function readBoolEnv(name: string, fallback: boolean): boolean {
  const raw = String(process.env[name] ?? '').trim().toLowerCase();
  if (!raw) return fallback;
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

function readIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function getDbDefaults() {
  const isProd = process.env.NODE_ENV === 'production';
  // DEV_DB_INIT controls whether dev boot runs migrations/background jobs.
  // It should NOT implicitly change whether the app can reliably connect to Render Postgres.
  // If you want fast-fail behavior in dev, set DB_FAST_FAIL=1 explicitly.
  const devFastFailRaw = String(process.env.DB_FAST_FAIL || '').toLowerCase();
  const devFastFail = !isProd && (devFastFailRaw === '1' || devFastFailRaw === 'true' || devFastFailRaw === 'yes');
  // Render Postgres can be slow/variable from local dev networks.
  // Use more forgiving defaults in dev to avoid flapping/crashes.
  const connectTimeoutMs = readIntEnv('DB_CONNECT_TIMEOUT_MS', isProd ? 30000 : (devFastFail ? 2000 : 30000));
  const statementTimeoutMs = readIntEnv('DB_STATEMENT_TIMEOUT_MS', isProd ? 60000 : (devFastFail ? 5000 : 120000));
  const queryTimeoutMs = readIntEnv('DB_QUERY_TIMEOUT_MS', isProd ? 60000 : (devFastFail ? 5000 : 90000));
  const max = readIntEnv('DB_POOL_MAX', isProd ? 10 : (devFastFail ? 5 : 15));
  const idleTimeoutMs = readIntEnv('DB_IDLE_TIMEOUT_MS', 30000);
  const retries = readIntEnv('DB_CONNECT_RETRIES', isProd ? 5 : (devFastFail ? 0 : 6));
  const retryBaseDelayMs = readIntEnv('DB_RETRY_BASE_DELAY_MS', 500);
  const retryMaxDelayMs = readIntEnv('DB_RETRY_MAX_DELAY_MS', 4000);
  return {
    connectTimeoutMs,
    statementTimeoutMs,
    queryTimeoutMs,
    max,
    idleTimeoutMs,
    retries,
    retryBaseDelayMs,
    retryMaxDelayMs,
  };
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  user_type?: string;
  is_verified?: boolean;
  is_blocked?: boolean;
  blocked_reason?: string | null;
  blocked_at?: string | null;
  blocked_by_admin_id?: number | null;
  is_locked?: boolean;
  locked_reason?: string | null;
  locked_at?: string | null;
  locked_by_admin_id?: number | null;
  lock_type?: 'payment' | 'critical' | string | null;
  created_at?: string;
  updated_at?: string;
}

export async function ensureConnection(retries = getDbDefaults().retries): Promise<Pool> {
  if (!pool) {
    let connectionString = (process.env.DATABASE_URL || '').trim();
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set (Render Postgres required; local DB disabled)');
    }

    const hasScheme = /^postgres(ql)?:\/\//i.test(connectionString);
    if (!hasScheme) {
      // Common mispaste: missing scheme but otherwise looks like user:pass@host/db
      const looksLikeConn = /@[^\s]+\//.test(connectionString);
      if (looksLikeConn) {
        connectionString = `postgresql://${connectionString}`;
      } else {
        throw new Error(
          'DATABASE_URL is set but does not look like a PostgreSQL URL. It must start with postgres:// or postgresql:// (Render: use Internal Database URL / Add-from-database).'
        );
      }
    }

    // Rely on Pool `ssl` option. Strip sslmode to avoid certificate verification issues
    // (Render Postgres commonly presents a self-signed cert).
    try {
      const u = new URL(connectionString);
      u.searchParams.delete('sslmode');
      connectionString = u.toString();
    } catch {
      // keep original string if URL parsing fails
    }

    const defaults = getDbDefaults();
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      keepAlive: true,
      keepAliveInitialDelayMillis: 0,
      max: defaults.max,
      idleTimeoutMillis: defaults.idleTimeoutMs,
      connectionTimeoutMillis: defaults.connectTimeoutMs,
      query_timeout: defaults.queryTimeoutMs,
      statement_timeout: defaults.statementTimeoutMs,
    });

    // Set timezone to UTC for all connections to ensure consistent timestamps
    pool.on('connect', (client) => {
      client.query("SET timezone = 'UTC'");
    });

    pool.on('error', (err) => {
      console.error('Unexpected DB pool error:', (err as any)?.message || err);
      // If connection terminated unexpectedly, try to gracefully end the pool
      if ((err as any)?.message?.includes('Connection terminated')) {
        console.log('Connection terminated - pool will be recreated on next query');
        const oldPool = pool;
        pool = null;
        lastPingAt = 0;
        pingInFlight = null;
        // Try to gracefully end the old pool (don't await, just let it clean up)
        if (oldPool) {
          oldPool.end().catch(() => {});
        }
      }
    });
  }

  // Store reference to current pool for this function scope
  const currentPool = pool;
  if (!currentPool) {
    throw new Error('Pool was reset during initialization - retrying');
  }

  // IMPORTANT: avoid doing a DB ping on every request.
  // Many routes call ensureConnection() before running their real query.
  // Pinging here for every call adds an extra round-trip to Render Postgres and
  // can make the server feel very slow under load.
  const isProd = process.env.NODE_ENV === 'production';
  const pingTtlMs = readIntEnv('DB_PING_TTL_MS', isProd ? 30_000 : 60_000);
  const pingEveryCall = readBoolEnv('DB_PING_EVERY_CALL', false);

  const now = Date.now();
  const needsPing = pingEveryCall || pingTtlMs > 0 && (lastPingAt === 0 || now - lastPingAt > pingTtlMs);
  if (!needsPing) {
    return currentPool;
  }

  let attempt = 0;
  let lastError: any = null;
  const defaults = getDbDefaults();

  if (!pingInFlight) {
    pingInFlight = (async () => {
      while (attempt <= retries) {
        try {
          // Check if pool was reset by error handler
          if (!pool || pool !== currentPool) {
            throw new Error('Pool was reset - need to reinitialize');
          }
          const start = Date.now();
          await currentPool.query('SELECT 1');
          const elapsedMs = Date.now() - start;
          lastPingAt = Date.now();
          if (elapsedMs > 2000) {
            console.warn(`DB ping succeeded but was slow (${elapsedMs}ms).`);
          }
          return;
        } catch (err) {
          lastError = err;
          console.error(`DB connect attempt ${attempt + 1} failed:`, (err as any)?.message || err);

          // If pool was reset, break out and let caller retry
          if (!pool || pool !== currentPool) {
            throw new Error('Pool reset during connection attempt');
          }

          const delay = Math.min(defaults.retryBaseDelayMs * Math.pow(2, attempt), defaults.retryMaxDelayMs);
          await new Promise(res => setTimeout(res, delay));
          attempt++;
        }
      }
      throw lastError || new Error('Failed to establish database connection');
    })().finally(() => {
      pingInFlight = null;
    });
  }

  await pingInFlight;
  return currentPool;
}

// Get the current pool, ensuring connection first
export async function getPool(): Promise<Pool> {
  return ensureConnection();
}

export async function initializeDatabase(): Promise<void> {
  await ensureConnection();
}

// Run pending .sql migrations in migrations directory
export async function runPendingMigrations(): Promise<void> {
  // Prefer the source tree migrations directories so production builds can find .sql files.
  // This repo has migrations in BOTH:
  // - server/migrations
  // - migrations (top-level)
  const candidates = [
    path.resolve(process.cwd(), 'server', 'migrations'),
    path.resolve(process.cwd(), 'migrations'),
    path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations'),
    path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations'),
  ];
  const existingDirs = candidates.filter((p) => fs.existsSync(p));
  if (existingDirs.length === 0) {
    console.log('No migrations directory found; skipping SQL migrations');
    return;
  }

  const fileMap = new Map<string, string>();
  for (const dir of existingDirs) {
    const entries = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
    for (const filename of entries) {
      if (fileMap.has(filename)) continue;
      fileMap.set(filename, path.join(dir, filename));
    }
  }
  const files = Array.from(fileMap.keys()).sort();
  if (!pool) {
    await ensureConnection();
  }
  const client = await pool!.connect();
  try {
    // Ensure the migrations tracking table exists (dev/server runs should be able to bootstrap)
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT NOW())'
    );

    for (const file of files) {
      // Skip destructive drop-all migration in automated runs
      if (file.includes('drop_all_tables')) {
        console.log(`Skipping destructive migration: ${file}`);
        continue;
      }
      const exists = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
      if (exists.rowCount) continue;
      const fullPath = fileMap.get(file) || '';
      const sql = fs.readFileSync(fullPath, 'utf-8');
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
  const db = await ensureConnection();
  // First try admins table
  let result;
  try {
    result = await db.query(
      "SELECT id, email, password, full_name as name, role, user_type, is_verified, is_blocked, blocked_reason, is_locked, locked_reason, lock_type, totp_enabled, totp_secret_encrypted, totp_pending_secret_encrypted, totp_backup_codes_hashes, totp_enrolled_at, created_at, updated_at FROM admins WHERE email = $1",
      [email]
    );
  } catch (err: any) {
    // Backward compatible if lock_type column doesn't exist yet
    try {
      result = await db.query(
        "SELECT id, email, password, full_name as name, role, user_type, is_verified, is_blocked, blocked_reason, is_locked, locked_reason, lock_type, created_at, updated_at FROM admins WHERE email = $1",
        [email]
      );
    } catch (_err2: any) {
      try {
        result = await db.query(
          "SELECT id, email, password, full_name as name, role, user_type, is_verified, is_blocked, blocked_reason, is_locked, locked_reason, created_at, updated_at FROM admins WHERE email = $1",
          [email]
        );
      } catch (_err3: any) {
        result = await db.query(
          "SELECT id, email, password, full_name as name, role, user_type, is_verified, is_locked, locked_reason, created_at, updated_at FROM admins WHERE email = $1",
          [email]
        );
      }
    }
  }
  
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  
  // Then try clients table
  try {
    result = await db.query(
      "SELECT id, email, password, name, role, user_type, is_verified, is_blocked, blocked_reason, is_locked, locked_reason, lock_type, created_at, updated_at FROM clients WHERE email = $1",
      [email]
    );
  } catch (err: any) {
    try {
      result = await db.query(
        "SELECT id, email, password, name, role, user_type, is_verified, is_blocked, blocked_reason, is_locked, locked_reason, created_at, updated_at FROM clients WHERE email = $1",
        [email]
      );
    } catch (_err2: any) {
      result = await db.query(
        "SELECT id, email, password, name, role, user_type, is_verified, is_locked, locked_reason, created_at, updated_at FROM clients WHERE email = $1",
        [email]
      );
    }
  }
  
  return result.rows[0] || null;
}

/**
 * Find user by ID - checks admins and clients tables
 */
export async function findUserById(id: string): Promise<User | null> {
  const db = await ensureConnection();
  // First try admins table
  let result;
  try {
    result = await db.query(
      "SELECT id, email, password, full_name as name, role, user_type, is_verified, is_blocked, blocked_reason, is_locked, locked_reason, lock_type, totp_enabled, totp_secret_encrypted, totp_pending_secret_encrypted, totp_backup_codes_hashes, totp_enrolled_at, created_at, updated_at FROM admins WHERE id = $1",
      [id]
    );
  } catch (err: any) {
    try {
      result = await db.query(
        "SELECT id, email, password, full_name as name, role, user_type, is_verified, is_blocked, blocked_reason, is_locked, locked_reason, lock_type, created_at, updated_at FROM admins WHERE id = $1",
        [id]
      );
    } catch (_err2: any) {
      try {
        result = await db.query(
          "SELECT id, email, password, full_name as name, role, user_type, is_verified, is_blocked, blocked_reason, created_at, updated_at FROM admins WHERE id = $1",
          [id]
        );
      } catch (_err3: any) {
        result = await db.query(
          "SELECT id, email, password, full_name as name, role, user_type, is_verified, created_at, updated_at FROM admins WHERE id = $1",
          [id]
        );
      }
    }
  }
  
  if (result.rows.length > 0) {
    return result.rows[0];
  }
  
  // Then try clients table
  try {
    result = await pool.query(
      "SELECT id, email, password, name, role, user_type, is_verified, is_blocked, blocked_reason, is_locked, locked_reason, lock_type, created_at, updated_at FROM clients WHERE id = $1",
      [id]
    );
  } catch (err: any) {
    try {
      result = await pool.query(
        "SELECT id, email, password, name, role, user_type, is_verified, is_blocked, blocked_reason, created_at, updated_at FROM clients WHERE id = $1",
        [id]
      );
    } catch (_err2: any) {
      result = await pool.query(
        "SELECT id, email, password, name, role, user_type, is_verified, created_at, updated_at FROM clients WHERE id = $1",
        [id]
      );
    }
  }
  
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
  const db = await ensureConnection();
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
  const adminResult = await db.query('SELECT id FROM admins WHERE id = $1', [id]);
  if (adminResult.rows.length > 0) {
    const result = await db.query(
      `UPDATE admins SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING id, email, password, full_name as name, role, user_type, is_verified, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  } else {
    // Update client
    const result = await db.query(
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
  const db = await ensureConnection();
  // Check if admin
  let result = await db.query(
    "DELETE FROM admins WHERE id = $1 RETURNING id",
    [id]
  );
  
  if (result.rowCount && result.rowCount > 0) {
    return true;
  }
  
  // Delete from clients if not admin
  result = await db.query(
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
    const db = await ensureConnection();
    await db.query(
      `INSERT INTO admins (email, password, full_name, role, user_type, is_verified, created_at, updated_at)
       VALUES ($1, $2, 'Admin User', 'admin', 'admin', true, NOW(), NOW())`,
      [email, hashedPassword]
    );
    console.log(`✅ Default admin user created: ${email}`);
  }
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
