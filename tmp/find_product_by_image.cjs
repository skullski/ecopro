const { Pool } = require('pg');
(async ()=>{
  const pool = new Pool({connectionString:'postgresql://eco_db_drrv_user:teCMT25hytwYFgWqpmg2Q0x97TJymRhs@dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com/eco_db_drrv', ssl:{rejectUnauthorized:false}});
  try{
    const client = await pool.connect();
    const res = await client.query("SELECT id, title, images, is_featured, slug FROM client_store_products WHERE images::text ILIKE $1", ['%1764760824306%']);
    console.log(JSON.stringify(res.rows,null,2));
    client.release();
  }catch(e){console.error('ERR',e.message);}finally{await pool.end();}
})();
