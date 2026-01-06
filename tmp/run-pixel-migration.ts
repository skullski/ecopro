import dotenv from 'dotenv';
dotenv.config();

import { ensureConnection } from '../server/utils/database';

async function runMigration() {
  console.log('Running pixel tracking migration...');
  
  try {
    const pool = await ensureConnection();
    
    // Create client_pixel_settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS client_pixel_settings (
          id SERIAL PRIMARY KEY,
          client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          facebook_pixel_id VARCHAR(50),
          facebook_access_token TEXT,
          tiktok_pixel_id VARCHAR(50),
          tiktok_access_token TEXT,
          is_facebook_enabled BOOLEAN DEFAULT false,
          is_tiktok_enabled BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(client_id)
      );
    `);
    console.log('✅ Created client_pixel_settings table');

    // Create pixel_events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pixel_events (
          id SERIAL PRIMARY KEY,
          client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          pixel_type VARCHAR(20) NOT NULL CHECK (pixel_type IN ('facebook', 'tiktok')),
          event_name VARCHAR(50) NOT NULL,
          event_data JSONB DEFAULT '{}',
          page_url TEXT,
          user_agent TEXT,
          ip_address INET,
          session_id VARCHAR(100),
          visitor_id VARCHAR(100),
          product_id INTEGER,
          order_id INTEGER,
          revenue DECIMAL(12,2),
          currency VARCHAR(10) DEFAULT 'DZD',
          created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Created pixel_events table');

    // Create pixel_stats_daily table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pixel_stats_daily (
          id SERIAL PRIMARY KEY,
          client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          pixel_type VARCHAR(20) NOT NULL,
          stat_date DATE NOT NULL,
          page_views INTEGER DEFAULT 0,
          view_content INTEGER DEFAULT 0,
          add_to_cart INTEGER DEFAULT 0,
          initiate_checkout INTEGER DEFAULT 0,
          purchases INTEGER DEFAULT 0,
          total_revenue DECIMAL(12,2) DEFAULT 0,
          unique_visitors INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(client_id, pixel_type, stat_date)
      );
    `);
    console.log('✅ Created pixel_stats_daily table');

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pixel_events_client_date ON pixel_events(client_id, created_at DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pixel_events_type ON pixel_events(pixel_type);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pixel_events_event_name ON pixel_events(event_name);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pixel_stats_daily_client ON pixel_stats_daily(client_id, stat_date DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pixel_settings_client ON client_pixel_settings(client_id);`);
    console.log('✅ Created indexes');

    console.log('\n🎉 Pixel tracking migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
