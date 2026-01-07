import 'dotenv/config';
import { ensureConnection } from '../server/utils/database';
import { encryptData } from '../server/utils/encryption';

async function main() {
  const db = await ensureConnection();
  const clientId = 10;
  const companyId = 14; // ZR Express
  
  // ZR Express uses api_key as X-Api-Key header and tenant_id as X-Tenant header
  const apiKey = 'H066nGICOnt7vB2K6HMKJtfEjL6SzS0KzGkypKgDxNzz9LEdUO32DjOQNsrd28Vs';
  const tenantId = 'd342e98d-c1d6-44b3-8f6f-67733e49ea8c';
  
  const encryptedKey = encryptData(apiKey);
  const encryptedTenant = encryptData(tenantId);
  
  const result = await db.query(`
    INSERT INTO delivery_integrations
    (client_id, delivery_company_id, api_key_encrypted, api_secret_encrypted, configured_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (client_id, delivery_company_id)
    DO UPDATE SET
      api_key_encrypted = $3,
      api_secret_encrypted = $4,
      updated_at = NOW()
    RETURNING id
  `, [clientId, companyId, encryptedKey, encryptedTenant]);
  
  console.log('✅ ZR Express credentials saved! Integration ID:', result.rows[0].id);
  
  const check = await db.query(`
    SELECT di.id, dc.name, di.api_key_encrypted IS NOT NULL as has_key
    FROM delivery_integrations di
    JOIN delivery_companies dc ON dc.id = di.delivery_company_id
    WHERE di.client_id = $1 AND di.delivery_company_id = $2
  `, [clientId, companyId]);
  
  console.log('Verified:', check.rows[0]);
  process.exit(0);
}

main();
