import bcrypt from "bcrypt";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: 'postgresql://eco_db_drrv_user:teCMT25hytwYFgWqpmg2Q0x97TJymRhs@dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com:5432/eco_db_drrv?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function fixPasswords() {
  try {
    const res = await pool.query('SELECT id, email, password FROM users');
    
    console.log('Checking passwords...\n');
    for (const user of res.rows) {
      const isHashed = user.password.startsWith('$2');
      console.log(`${user.email}: ${isHashed ? 'HASHED ✓' : 'PLAIN TEXT ✗'}`);
      
      if (!isHashed) {
        const hashed = await bcrypt.hash(user.password, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, user.id]);
        console.log(`  → Hashed successfully!`);
      }
    }
    
    console.log('\n✅ All passwords checked and fixed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixPasswords();
