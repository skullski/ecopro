import { Pool } from "pg";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Database connection pool with aggressive optimization
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render PostgreSQL
  },
  max: 30, // Maximum pool connections for high concurrency
  min: 5, // Keep 5 connections ready
  idleTimeoutMillis: 5000, // Close idle connections after 5s
  connectionTimeoutMillis: 2000, // Ultra-fast connection timeout
  statement_timeout: 2000, // Global statement timeout
});

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  user_type?: string;
}

/**
 * Initialize database tables
 */
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'user',
        user_type VARCHAR(32),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Safeguard legacy deployments missing timestamp columns
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);

    // Ensure legacy deployments without created_at/updated_at get columns
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);

    // Create marketplace_products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_products (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        category VARCHAR(100),
        images TEXT[] DEFAULT '{}',
        stock INTEGER DEFAULT 1,
        status VARCHAR(32) DEFAULT 'active',
        condition VARCHAR(32) DEFAULT 'new',
        location VARCHAR(255),
        shipping_available BOOLEAN DEFAULT true,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure sellers table exists (for marketplace auth)
    await client.query(`
      CREATE TABLE IF NOT EXISTS sellers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create marketplace_orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_orders (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
        seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(32) DEFAULT 'pending',
        total_price DECIMAL(10, 2) NOT NULL,
        shipping_name VARCHAR(255),
        shipping_line1 VARCHAR(255),
        shipping_line2 VARCHAR(255),
        shipping_city VARCHAR(100),
        shipping_state VARCHAR(100),
        shipping_postal_code VARCHAR(20),
        shipping_country VARCHAR(100),
        shipping_phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller_id 
      ON marketplace_products(seller_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_marketplace_products_status 
      ON marketplace_products(status);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_marketplace_products_category 
      ON marketplace_products(category);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller_id 
      ON marketplace_orders(seller_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer_id 
      ON marketplace_orders(buyer_id);
    `);

    // Create client_stock_products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_stock_products (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE,
        description TEXT,
        category VARCHAR(100),
        quantity INTEGER NOT NULL DEFAULT 0,
        unit_price DECIMAL(10, 2),
        reorder_level INTEGER DEFAULT 10,
        location VARCHAR(255),
        supplier_name VARCHAR(255),
        supplier_contact VARCHAR(255),
        status VARCHAR(32) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create client_stock_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_stock_history (
        id SERIAL PRIMARY KEY,
        stock_id INTEGER NOT NULL REFERENCES client_stock_products(id) ON DELETE CASCADE,
        client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quantity_before INTEGER NOT NULL,
        quantity_after INTEGER NOT NULL,
        adjustment INTEGER NOT NULL,
        reason VARCHAR(32) NOT NULL,
        notes TEXT,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for stock tables
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_stock_client_id 
      ON client_stock_products(client_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_stock_status 
      ON client_stock_products(status);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_stock_category 
      ON client_stock_products(category);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_stock_sku 
      ON client_stock_products(sku);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_stock_quantity 
      ON client_stock_products(quantity);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_stock_history_stock_id 
      ON client_stock_history(stock_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_stock_history_client_id 
      ON client_stock_history(client_id);
    `);

    // Create client_store_products table (private store)
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_store_products (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        images TEXT[] DEFAULT '{}',
        category VARCHAR(100),
        stock_quantity INTEGER DEFAULT 0,
        status VARCHAR(32) DEFAULT 'active',
        is_featured BOOLEAN DEFAULT false,
        slug VARCHAR(255) UNIQUE,
        views INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create client_store_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_store_settings (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        store_name VARCHAR(255),
        store_description TEXT,
        store_logo TEXT,
        primary_color VARCHAR(7) DEFAULT '#3b82f6',
        secondary_color VARCHAR(7) DEFAULT '#8b5cf6',
        custom_domain VARCHAR(255),
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure newly introduced columns exist on legacy deployments
    await client.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS store_slug VARCHAR(255) UNIQUE;`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_client_store_settings_slug ON client_store_settings(store_slug);`);
    await client.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS template VARCHAR(24) DEFAULT 'classic';`);
    await client.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS banner_url TEXT;`);
    await client.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS currency_code VARCHAR(16) DEFAULT 'DZD';`);
    // Mercury hero image fields for storefront visual configuration
    await client.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS hero_main_url TEXT;`);
    await client.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS hero_tile1_url TEXT;`);
    await client.query(`ALTER TABLE client_store_settings ADD COLUMN IF NOT EXISTS hero_tile2_url TEXT;`);

    // Bot settings (per client) for messaging templates and provider config
    await client.query(`
      CREATE TABLE IF NOT EXISTS bot_settings (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(32) DEFAULT 'whatsapp_cloud',
        whatsapp_phone_id TEXT,
        whatsapp_token TEXT,
        template_order_confirmation TEXT,
        template_payment TEXT,
        template_shipping TEXT,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for store tables
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_store_products_client_id 
      ON client_store_products(client_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_store_products_status 
      ON client_store_products(status);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_store_products_slug 
      ON client_store_products(slug);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_client_store_products_featured 
      ON client_store_products(is_featured);
    `);

    // Migration tracking table (idempotent)
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);

    console.log("✅ Database tables initialized");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
  } finally {
    client.release();
  }
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
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Create new user
 */
export async function createUser(user: {
  email: string;
  password: string;
  name: string;
  role?: string;
  user_type?: string;
}): Promise<User> {
  const result = await pool.query(
    `INSERT INTO users (email, password, name, role, user_type) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [user.email, user.password, user.name, user.role || 'user', user.user_type || 'client']
  );
  return result.rows[0];
}

/**
 * Update user
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
  const result = await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id",
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
    await createUser({
      email,
      password: hashedPassword,
      name: "Admin User",
      role: 'admin',
      user_type: 'admin'
    });
    console.log(`✅ Default admin user created: ${email}`);
  }
}

/**
 * Close database pool
 */
export async function closeDatabasePool(): Promise<void> {
  await pool.end();
}

// Export pool for advanced queries
export { pool };
