import crypto from 'crypto';
import { getOrGenerateSecret } from './required-env';

function getUploadSigningKey(): string {
  // Use the centralized secret manager which auto-generates in production if needed
  return getOrGenerateSecret('UPLOAD_SIGNING_KEY') || 'dev-upload-signing-key-change-me';
}

const SAFE_NAME_RE = /^[A-Za-z0-9._-]+$/;

export function isSafeUploadName(name: string): boolean {
  return SAFE_NAME_RE.test(name);
}

export function signUploadPath(params: { filename: string; expiresInSeconds?: number }): {
  exp: number;
  sig: string;
} {
  const expiresInSeconds = params.expiresInSeconds ?? 300;
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const data = `${params.filename}:${exp}`;
  const sig = crypto.createHmac('sha256', getUploadSigningKey()).update(data).digest('hex');
  return { exp, sig };
}

export function verifyUploadSignature(params: { filename: string; exp: number; sig: string }): boolean {
  if (!isSafeUploadName(params.filename)) return false;
  if (!Number.isFinite(params.exp)) return false;
  if (params.exp < Math.floor(Date.now() / 1000)) return false;

  const data = `${params.filename}:${params.exp}`;
  const expected = crypto.createHmac('sha256', getUploadSigningKey()).update(data).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(params.sig, 'hex'));
  } catch {
    return false;
  }
}
