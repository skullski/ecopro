import { pool } from '../server/utils/database';
import { encryptData } from '../server/utils/encryption';

async function main() {
  const clientId = 26; // zzerrouk56@gmail.com
  const companyId = 60; // Zimou Express
  const apiKey = '318479|H4MDOi7uFaK1AWkKputXralNmR2KenroDDnFnAPId3282b38';
  
  const encryptedKey = encryptData(apiKey);
  
  const result = await pool.query(`
    INSERT INTO delivery_integrations (client_id, delivery_company_id, api_key_encrypted, is_enabled, created_at, updated_at)
    VALUES ($1, $2, $3, true, NOW(), NOW())
    ON CONFLICT (client_id, delivery_company_id) 
    DO UPDATE SET api_key_encrypted = $3, is_enabled = true, updated_at = NOW()
    RETURNING id, client_id, delivery_company_id, is_enabled
  `, [clientId, companyId, encryptedKey]);
  
  console.log('Zimou Express integration saved:', result.rows[0]);
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
