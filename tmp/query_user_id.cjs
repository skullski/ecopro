const { Pool } = require('pg');
(async ()=>{
  const pool = new Pool({connectionString: 'postgresql://eco_db_drrv_user:teCMT25hytwYFgWqpmg2Q0x97TJymRhs@dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com/eco_db_drrv', ssl:{rejectUnauthorized:false}});
  try{
    const client = await pool.connect();
    const r = await client.query('SELECT id, email, name, role, user_type FROM users WHERE id = $1', [28]);
    console.log(JSON.stringify(r.rows,null,2));
    client.release();
  }catch(e){console.error('ERR',e.message);}finally{await pool.end();}
})();