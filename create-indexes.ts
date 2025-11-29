import { Pool } from "pg";

async function ensureIndexes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://eco_db_drrv_user:teCMT25hytwYFgWqpmg2Q0x97TJymRhs@dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com:5432/eco_db_drrv?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("🔄 Creating performance indexes...\n");

    const indexes = [
      {
        name: "idx_marketplace_products_seller_id",
        query: `CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller_id 
                ON marketplace_products(seller_id);`
      },
      {
        name: "idx_marketplace_products_status",
        query: `CREATE INDEX IF NOT EXISTS idx_marketplace_products_status 
                ON marketplace_products(status);`
      },
      {
        name: "idx_marketplace_products_category",
        query: `CREATE INDEX IF NOT EXISTS idx_marketplace_products_category 
                ON marketplace_products(category);`
      },
      {
        name: "idx_marketplace_products_price",
        query: `CREATE INDEX IF NOT EXISTS idx_marketplace_products_price 
                ON marketplace_products(price);`
      },
      {
        name: "idx_marketplace_products_created_at",
        query: `CREATE INDEX IF NOT EXISTS idx_marketplace_products_created_at 
                ON marketplace_products(created_at DESC);`
      },
      {
        name: "idx_marketplace_products_title_trgm",
        query: `CREATE INDEX IF NOT EXISTS idx_marketplace_products_title_trgm 
                ON marketplace_products USING GIN(to_tsvector('english', title));`
      },
      {
        name: "idx_marketplace_orders_seller_id",
        query: `CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller_id 
                ON marketplace_orders(seller_id);`
      },
      {
        name: "idx_marketplace_orders_buyer_id",
        query: `CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer_id 
                ON marketplace_orders(buyer_id);`
      },
      {
        name: "idx_marketplace_orders_status",
        query: `CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status 
                ON marketplace_orders(status);`
      },
      {
        name: "idx_users_email",
        query: `CREATE INDEX IF NOT EXISTS idx_users_email 
                ON users(email);`
      }
    ];

    for (const idx of indexes) {
      await pool.query(idx.query);
      console.log(`✅ ${idx.name}`);
    }

    console.log("\n✅ All indexes created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

ensureIndexes();
