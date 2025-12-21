#!/usr/bin/env node
/**
 * Migration Script: Rehash all passwords from bcrypt to argon2id
 * 
 * Usage: npm run migrate:rehash-passwords
 * Or manually: npx ts-node server/scripts/rehash-passwords.ts
 * 
 * This script:
 * 1. Connects to the database
 * 2. Finds all users with passwords (old bcrypt hashes)
 * 3. Rehashes each password using argon2id
 * 4. Updates the database with new hashes
 * 5. Logs progress and summary
 */

import * as argon2 from "argon2";
import * as bcrypt from "bcrypt";
import { Pool } from "pg";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("render.com") ? { rejectUnauthorized: false } : false,
});

async function rehashPasswords() {
  console.log("🔐 Starting password migration from bcrypt to argon2id...\n");

  try {
    // Get all users with passwords
    const result = await pool.query("SELECT id, email, password_hash FROM users WHERE password_hash IS NOT NULL");
    const users = result.rows;

    if (users.length === 0) {
      console.log("✅ No users found. Migration complete.");
      await pool.end();
      return;
    }

    console.log(`Found ${users.length} users to rehash.\n`);

    let rehashed = 0;
    let failed = 0;
    let alreadyArgon2 = 0;

    for (const user of users) {
      try {
        // Check if already argon2 (starts with $argon2)
        if (user.password_hash.startsWith("$argon2")) {
          console.log(`⏭️  ${user.email} - Already using argon2id, skipping`);
          alreadyArgon2++;
          continue;
        }

        // This is a bcrypt hash - verify format then rehash
        if (!user.password_hash.startsWith("$2")) {
          console.log(`❌ ${user.email} - Invalid hash format, skipping`);
          failed++;
          continue;
        }

        // Rehash using argon2id
        const newHash = await argon2.hash(user.password_hash, {
          type: argon2.argon2id,
          timeCost: 2,
          memoryCost: 65536,
          parallelism: 1,
        });

        // Update database
        await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [
          newHash,
          user.id,
        ]);

        console.log(`✅ ${user.email} - Successfully rehashed`);
        rehashed++;
      } catch (error) {
        console.log(`❌ ${user.email} - Error: ${error instanceof Error ? error.message : String(error)}`);
        failed++;
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Rehashed: ${rehashed}`);
    console.log(`   ⏭️  Already argon2: ${alreadyArgon2}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📝 Total: ${users.length}`);

    if (failed === 0) {
      console.log("\n✨ Password migration complete! All users now use argon2id.\n");
    } else {
      console.log(`\n⚠️  Migration completed with ${failed} error(s). Review logs above.\n`);
    }

    await pool.end();
    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    await pool.end();
    process.exit(1);
  }
}

rehashPasswords();
