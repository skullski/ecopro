import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';
import * as fs from 'fs';

async function run() {
  const db = await ensureConnection();
  const sql = fs.readFileSync('tmp/add-auto-channel.sql', 'utf8');
  await db.query(sql);
  console.log('Migration applied: auto channel added');
  process.exit(0);
}
run();
