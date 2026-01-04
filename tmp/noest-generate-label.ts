import 'dotenv/config';
import { DeliveryService } from '../server/services/delivery';
import { ensureConnection } from '../server/utils/database';

async function main() {
  const db = await ensureConnection();

  const orderId = 93;
  const clientId = 10;
  const companyId = 58;

  const result = await DeliveryService.generateLabel(orderId, clientId, companyId);
  console.log(JSON.stringify(result, null, 2));

  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
