import 'dotenv/config';
import { processPendingMessages } from '../server/utils/bot-messaging';

async function main() {
  await processPendingMessages();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
