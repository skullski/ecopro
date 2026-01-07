import 'dotenv/config';
import { processScheduledMessages } from '../server/utils/scheduled-messages';

async function run() {
  console.log('Triggering scheduled message worker...');
  await processScheduledMessages();
  console.log('Done');
  process.exit(0);
}
run();
