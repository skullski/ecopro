import type { Request } from 'express';

export function getPublicBaseUrl(req?: Request): string {
  // Prefer explicit configuration.
  let url = String(process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || '').trim();

  // Fall back to request-derived URL (useful in some deployments).
  if (!url && req) {
    const forwardedProto = req.get('x-forwarded-proto');
    const forwardedHost = req.get('x-forwarded-host');
    const proto = (forwardedProto || req.protocol || 'https').split(',')[0].trim();
    const host = (forwardedHost || req.get('host') || '').split(',')[0].trim();
    if (host) url = `${proto}://${host}`;
  }

  // Legacy fallback.
  if (!url) url = 'https://ecopro-1lbl.onrender.com';

  return url.replace(/\/$/, '');
}
