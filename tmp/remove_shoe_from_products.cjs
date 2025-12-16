const { Pool } = require('pg');
(async ()=>{
  const pool = new Pool({connectionString:'postgresql://eco_db_drrv_user:teCMT25hytwYFgWqpmg2Q0x97TJymRhs@dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com/eco_db_drrv', ssl:{rejectUnauthorized:false}});
  const fragment = '1764760824306';
  try{
    const client = await pool.connect();
    const find = await client.query("SELECT id, title, images FROM client_store_products WHERE EXISTS (SELECT 1 FROM unnest(images) img WHERE img ILIKE $1)", ['%'+fragment+'%']);
    if (!find.rows.length) {
      console.log('No products found referencing fragment:', fragment);
      client.release();
      await pool.end();
      return;
    }
    console.log('Found products:', JSON.stringify(find.rows, null, 2));
    for (const row of find.rows) {
      const id = row.id;
      const images = row.images || [];
      const next = images.filter((img)=> !(img||'').includes(fragment));
      console.log('Updating product', id, 'images ->', next);
      await client.query('UPDATE client_store_products SET images = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [next.length?next:null, id]);
      console.log('Updated product', id);
    }
    client.release();
  }catch(e){console.error('ERR',e.message);}finally{await pool.end();}
})();
