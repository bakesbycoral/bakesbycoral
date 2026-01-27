// Script to create an admin user
// Run with: npx tsx scripts/seed-admin.ts

// This generates a password hash that you can insert into the database
// For security, change the password after first login

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${saltHex}:${hashHex}`;
}

async function main() {
  const email = process.argv[2] || 'coral@bakesbycoral.com';
  const password = process.argv[3] || 'changeme123';

  console.log('\n=== Admin User Seed Script ===\n');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  const passwordHash = await hashPassword(password);

  console.log('\n=== SQL to insert admin user ===\n');
  console.log(`INSERT INTO users (id, email, password_hash, role, created_at)
VALUES (
  '${crypto.randomUUID()}',
  '${email}',
  '${passwordHash}',
  'admin',
  datetime('now')
);`);

  console.log('\n=== Run this with wrangler ===\n');
  console.log('For local: npx wrangler d1 execute bakes-by-coral-db --local --command="<SQL above>"');
  console.log('For remote: npx wrangler d1 execute bakes-by-coral-db --remote --command="<SQL above>"');
  console.log('\n');
}

main().catch(console.error);
