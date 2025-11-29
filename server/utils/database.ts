import { Pool } from "pg";

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render PostgreSQL
  },
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

    // Create marketplace_products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS marketplace_products (
        id SERIAL PRIMARY KEY,
        seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

    console.log("✅ Database tables initialized");
  } catch (error) {
    console.error("❌ Database initialization error:", error);
    throw error;
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
}): Promise<User> {
  const result = await pool.query(
    `INSERT INTO users (email, password, name, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [user.email, user.password, user.name, user.role || 'vendor']
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
      name: "Admin User"
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
