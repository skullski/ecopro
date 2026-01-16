import './dotenv';

import { hashPassword } from '../server/utils/auth';
import { createDefaultAdmin } from '../server/utils/database';

async function main() {
  const email = String(process.env.DEFAULT_ADMIN_EMAIL || '').trim();
  const password = String(process.env.DEFAULT_ADMIN_PASSWORD || '').trim();

  if (!email || !password) {
    throw new Error('Missing DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD');
  }

  const hashed = await hashPassword(password);
  await createDefaultAdmin(email, hashed);

  // Do not print the password.
  console.log('✅ Admin ensured for:', email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
