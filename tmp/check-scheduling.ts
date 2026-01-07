import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';

async function check() {
  const db = await ensureConnection();
  
  // 1. Check bot settings delay
  const bot = await db.query(`
    SELECT telegram_delay_minutes, enabled, provider 
    FROM bot_settings WHERE client_id = 10
  `);
  console.log('Bot settings:', bot.rows[0]);
  
  // 2. Check DB timezone vs JS timezone
  const times = await db.query(`
    SELECT 
      NOW() as db_now,
      NOW() AT TIME ZONE 'UTC' as db_utc,
      CURRENT_SETTING('timezone') as db_timezone
  `);
  console.log('DB time info:', times.rows[0]);
  console.log('JS Date.now():', new Date().toISOString());
  
  // 3. Check recent scheduled messages and their timing
  const msgs = await db.query(`
    SELECT 
      id, order_id, status, 
      created_at,
      scheduled_at,
      scheduled_at - created_at as delay_used,
      scheduled_at <= NOW() as is_ready
    FROM scheduled_messages
    ORDER BY created_at DESC
    LIMIT 5
  `);
  console.log('\nRecent scheduled messages:');
  console.table(msgs.rows);
  
  process.exit(0);
}
check();
