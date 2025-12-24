import { Router } from 'express';
import { logSecurityEvent, getClientIp, getGeo, computeFingerprint, parseCookie } from '../utils/security';

const router = Router();

async function trapHandler(req: any, res: any) {
  const ip = getClientIp(req);
  const ua = (req.headers['user-agent'] as string | undefined) || null;
  const linuxUa = !!ua && /Linux/i.test(ua) && !/Android/i.test(ua);
  const geo = getGeo(req, ip);
  const fpCookie = parseCookie(req, 'ecopro_fp');
  const fingerprint = computeFingerprint({ ip, userAgent: ua, cookie: fpCookie });
  const u = req.user;

  await logSecurityEvent({
    event_type: 'trap_hit',
    severity: linuxUa ? 'error' : 'warn',
    request_id: (req as any).requestId || null,
    method: req.method,
    path: req.path || req.url,
    status_code: 404,
    ip,
    user_agent: ua,
    fingerprint,
    country_code: geo.country_code,
    region: geo.region,
    city: geo.city,
    user_id: u?.id != null ? String(u.id) : null,
    user_type: u?.user_type != null ? String(u.user_type) : null,
    role: u?.role != null ? String(u.role) : null,
    metadata: {
      query: req.query || null,
      body_keys: req.body ? Object.keys(req.body).slice(0, 50) : null,
      headers: {
        referer: req.headers.referer || null,
        origin: req.headers.origin || null,
      },
    },
  });

  // Always deny and look uninteresting
  if ((req.path || '').startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  return res.status(404).send('Not found');
}

// Obvious trap URLs (UI pages)
router.all('/trap/admin', trapHandler);
router.all('/trap/debug', trapHandler);
router.all('/trap/panel', trapHandler);

// Common probe traps (won't conflict with real routes)
router.all('/wp-login.php', trapHandler);
router.all('/wp-admin', trapHandler);
router.all('/phpmyadmin', trapHandler);
router.all('/.env', trapHandler);
router.all('/.git', trapHandler);

// Obvious API traps
router.all('/api/trap/admin', trapHandler);
router.all('/api/trap/debug', trapHandler);
router.all('/api/internal/debug', trapHandler);
router.all('/api/internal/config', trapHandler);

export default router;
