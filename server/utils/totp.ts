import crypto from 'crypto';

// Minimal RFC 6238 TOTP implementation (SHA1, 30s step, 6 digits)
// Avoids extra deps; suitable for server-side admin 2FA.

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/g, '').replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];

  for (const c of clean) {
    const idx = BASE32_ALPHABET.indexOf(c);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(out);
}

export function generateTotpSecretBase32(bytes = 20): string {
  return base32Encode(crypto.randomBytes(bytes));
}

export function buildOtpAuthUrl(params: {
  issuer: string;
  accountName: string;
  secretBase32: string;
}): string {
  const label = encodeURIComponent(`${params.issuer}:${params.accountName}`);
  const issuer = encodeURIComponent(params.issuer);
  return `otpauth://totp/${label}?secret=${params.secretBase32}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

export function totpAt(secretBase32: string, counter: number, digits = 6): string {
  const key = base32Decode(secretBase32);
  const msg = Buffer.alloc(8);
  // Counter as big-endian 8-byte
  msg.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  msg.writeUInt32BE(counter & 0xffffffff, 4);

  const hmac = crypto.createHmac('sha1', key).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits).toString();
  return code.padStart(digits, '0');
}

export function verifyTotp(secretBase32: string, token: string, window = 1): boolean {
  const clean = String(token || '').trim();
  if (!/^[0-9]{6}$/.test(clean)) return false;
  const step = 30;
  const counter = Math.floor(Date.now() / 1000 / step);
  for (let w = -window; w <= window; w++) {
    if (totpAt(secretBase32, counter + w) === clean) return true;
  }
  return false;
}
