import dotenv from 'dotenv';

// Load env files for local scripts.
// Order: .env then .env.local override.
dotenv.config({ path: '.env', quiet: true });
dotenv.config({ path: '.env.local', override: true, quiet: true });
