// Encryption utilities for sensitive delivery data
import crypto from 'crypto';

function getEncryptionKey(): string {
  // Prefer an explicit, stable key.
  const explicit = process.env.ENCRYPTION_KEY;
  if (explicit && explicit.trim()) return explicit;

  // Fallback: derive a deterministic key from DATABASE_URL so encrypted fields remain
  // decryptable across restarts even if ENCRYPTION_KEY is not set.
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.trim()) {
    return crypto.createHash('sha256').update(dbUrl).digest('hex');
  }

  // Last resort for local/dev.
  return 'dev-encryption-key-change-me';
}
const ALGORITHM = 'aes-256-gcm';

export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(getEncryptionKey(), 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decryptData(encryptedData: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const key = crypto.scryptSync(getEncryptionKey(), 'salt', 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Hash sensitive data for comparison
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
