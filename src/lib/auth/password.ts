// Password hashing using Web Crypto API (Cloudflare Workers compatible)

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export async function hashPassword(password: string): Promise<string> {
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

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) return false;

  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
  );

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
  const computedHashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computedHashHex === hashHex;
}
