import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import geoip from 'geoip-lite';
import os from 'os';
import { ensureConnection } from './database';

export type SecurityEventType =
  | 'geo_block'
  | 'ip_block'
  | 'trap_hit'
  | 'admin_forbidden'
  | 'admin_unauthorized'
  | 'auth_failed'
  | 'auth_login_failed'
  | 'brute_force_attack'
  | 'suspicious_path'
  | 'rate_limited'
  | 'error';

type SecurityEvent = {
  event_type: SecurityEventType | string;
  severity?: 'info' | 'warn' | 'error';
  request_id?: string | null;
  method?: string | null;
  path?: string | null;
  status_code?: number | null;
  ip?: string | null;
  user_agent?: string | null;
  fingerprint?: string | null;
  country_code?: string | null;
  region?: string | null;
  city?: string | null;
  user_id?: string | null;
  user_type?: string | null;
  role?: string | null;
  metadata?: any;
};

function normalizeIp(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const ip = raw.trim();
  if (!ip) return null;
  if (ip.startsWith('::ffff:')) return ip.substring('::ffff:'.length);
  return ip;
}

function firstForwardedFor(xff: string): string {
  // X-Forwarded-For: client, proxy1, proxy2
  const first = xff.split(',')[0]?.trim();
  return first || xff.trim();
}

export function getClientIp(req: Request): string | null {
  const cf = normalizeIp(req.headers['cf-connecting-ip'] as string | undefined);
  if (cf) return cf;

  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) {
    return normalizeIp(firstForwardedFor(xff));
  }
  if (Array.isArray(xff) && xff.length > 0) {
    return normalizeIp(firstForwardedFor(xff[0]));
  }

  const xri = normalizeIp(req.headers['x-real-ip'] as string | undefined);
  if (xri) return xri;

  return normalizeIp((req as any).ip);
}

type BlockCache = {
  loadedAt: number;
  ttlMs: number;
  ips: Set<string>;
};

let blockCache: BlockCache | null = null;

export function clearSecurityBlockCache(): void {
  blockCache = null;
}

async function getBlockedIpSet(): Promise<Set<string>> {
  const now = Date.now();
  const ttlMs = 60 * 1000;
  if (blockCache && now - blockCache.loadedAt < blockCache.ttlMs) {
    return blockCache.ips;
  }
  try {
    const pool = await ensureConnection();
    const r = await pool.query(
      `SELECT ip FROM security_ip_blocks WHERE is_active = true`
    );
    const ips = new Set<string>();
    for (const row of r.rows || []) {
      const ip = String(row.ip || '').trim();
      if (ip) ips.add(ip);
    }
    blockCache = { loadedAt: now, ttlMs, ips };
    return ips;
  } catch {
    // Fail open: never break production traffic if kernel tables missing.
    return new Set<string>();
  }
}

export function parseCookie(req: Request, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const parts = raw.split(';');
  for (const p of parts) {
    const [k, ...rest] = p.split('=');
    if (!k) continue;
    if (k.trim() !== name) continue;
    return decodeURIComponent(rest.join('=').trim());
  }
  return null;
}

export function isPrivateIp(ip: string): boolean {
  // Very small allowlist for dev/local and RFC1918
  if (ip === '127.0.0.1' || ip === '::1') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('172.16.') || ip.startsWith('172.17.') || ip.startsWith('172.18.') || ip.startsWith('172.19.') || ip.startsWith('172.2') || ip.startsWith('172.3')) {
    // covers 172.16.0.0/12 approximately
    return true;
  }
  return false;
}

export function getCountryCode(req: Request, ip: string | null): string | null {
  const cfCountry = (req.headers['cf-ipcountry'] as string | undefined)?.trim();
  if (cfCountry && cfCountry.length === 2) return cfCountry.toUpperCase();

  if (!ip) return null;
  if (isPrivateIp(ip)) return 'DZ'; // Treat local as allowed for dev

  const lookup = geoip.lookup(ip);
  const cc = lookup?.country;
  return cc ? cc.toUpperCase() : null;
}

export function getGeo(req: Request, ip: string | null): { country_code: string | null; region: string | null; city: string | null } {
  const country_code = getCountryCode(req, ip);
  if (!ip || !country_code || isPrivateIp(ip)) {
    return { country_code, region: null, city: null };
  }
  const lookup = geoip.lookup(ip);
  return {
    country_code,
    region: (lookup as any)?.region || null,
    city: (lookup as any)?.city || null,
  };
}

export function computeFingerprint(opts: { ip: string | null; userAgent: string | null; cookie: string | null }): string | null {
  if (!opts.ip && !opts.userAgent && !opts.cookie) return null;
  const raw = `${opts.ip || '-'}|${opts.userAgent || '-'}|${opts.cookie || '-'}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function ensureFingerprintCookie(req: Request, res: Response): string {
  const existing = parseCookie(req, 'ecopro_fp');
  if (existing && existing.length >= 8) return existing;

  const value = crypto.randomBytes(16).toString('hex');
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction ? '; Secure' : '';
  const newCookie = `ecopro_fp=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  const current = res.getHeader('Set-Cookie');
  if (!current) {
    res.setHeader('Set-Cookie', newCookie);
  } else if (Array.isArray(current)) {
    res.setHeader('Set-Cookie', [...current, newCookie]);
  } else {
    res.setHeader('Set-Cookie', [String(current), newCookie]);
  }
  return value;
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    const isRender = Boolean(
      process.env.RENDER ||
        process.env.RENDER_SERVICE_ID ||
        process.env.RENDER_EXTERNAL_URL ||
        process.env.RENDER_INTERNAL_HOSTNAME
    );
    const baseMeta = event.metadata && typeof event.metadata === 'object' ? event.metadata : (event.metadata ? { value: event.metadata } : {});
    const metadata = {
      ...baseMeta,
      _server: {
        hostname: os.hostname(),
        isRender,
        nodeEnv: process.env.NODE_ENV || 'development',
      },
    };

    const pool = await ensureConnection();
    await pool.query(
      `INSERT INTO security_events (
        event_type, severity, request_id, method, path, status_code,
        ip, user_agent, fingerprint,
        country_code, region, city,
        user_id, user_type, role,
        metadata
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,
        $10,$11,$12,
        $13,$14,$15,
        $16
      )`,
      [
        event.event_type,
        event.severity || 'info',
        event.request_id || null,
        event.method || null,
        event.path || null,
        event.status_code ?? null,
        event.ip || null,
        event.user_agent || null,
        event.fingerprint || null,
        event.country_code || null,
        event.region || null,
        event.city || null,
        event.user_id || null,
        event.user_type || null,
        event.role || null,
        Object.keys(metadata).length ? JSON.stringify(metadata) : null,
      ]
    );
  } catch (e) {
    // Never block the request flow on logging failures
    console.warn('[security] Failed to log event:', (e as any)?.message || e);
  }
}

export async function purgeOldSecurityEvents(days: number): Promise<number> {
  const pool = await ensureConnection();
  const result = await pool.query(
    `DELETE FROM security_events WHERE created_at < NOW() - ($1::text || ' days')::interval`,
    [String(days)]
  );
  return result.rowCount || 0;
}

export function securityMiddleware(options: {
  dzOnlyUnauth?: boolean;
  allowUnknownCountry?: boolean;
  retentionDays?: number;
}) {
  const dzOnlyUnauth = options.dzOnlyUnauth ?? true;
  const allowUnknownCountry = options.allowUnknownCountry ?? false;
  const isProduction = process.env.NODE_ENV === 'production';

  return async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    const requestId = (req.headers['x-request-id'] as string | undefined) || crypto.randomBytes(8).toString('hex');
    (req as any).requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    const ip = getClientIp(req);
    (req as any).clientIp = ip;
    const userAgent = (req.headers['user-agent'] as string | undefined) || null;
    const linuxUa = !!userAgent && /Linux/i.test(userAgent) && !/Android/i.test(userAgent);

    // Local dev fast path: for localhost/private IP traffic, skip DB-backed security
    // checks/logging entirely to keep the dev server very responsive.
    if (!isProduction && ip && isPrivateIp(ip)) {
      return next();
    }

    const fpCookie = ensureFingerprintCookie(req, res);
    const fingerprint = computeFingerprint({ ip, userAgent, cookie: fpCookie });

    const geo = getGeo(req, ip);

    // Health endpoints must stay reachable for infra
    const path = req.path || req.url || '';
    const isHealth = path === '/api/health' || path === '/api/ping' || path === '/api/db-check' || path === '/api/db/ping';
    // Public provider webhooks must remain reachable from outside DZ.
    const isWebhook = path === '/api/telegram/webhook' || path === '/api/messenger/webhook';
    // Privacy policy page must be accessible for Facebook App verification
    const isPrivacyPolicy = path === '/privacy-policy' || path === '/privacy.html';

    const isUnauth = !(req as any).user;

    // Manual IP blocks (root-controlled)
    if (ip) {
      const blocked = await getBlockedIpSet();
      if (blocked.has(ip)) {
        await logSecurityEvent({
          event_type: 'ip_block',
          severity: 'warn',
          request_id: requestId,
          method: req.method,
          path,
          status_code: 403,
          ip,
          user_agent: userAgent,
          fingerprint,
          country_code: geo.country_code,
          region: geo.region,
          city: geo.city,
          metadata: { reason: 'manual_ip_block', ms: Date.now() - start },
        });
        if (path.startsWith('/api/')) {
          return res.status(403).json({ error: 'Access denied' });
        }
        return res.status(403).send('Access denied');
      }
    }

    // DZ-only hard block for unauth traffic
    if (dzOnlyUnauth && isUnauth && !isHealth && !isWebhook && !isPrivacyPolicy) {
      const cc = geo.country_code;
      const isDz = cc === 'DZ';
      const unknown = !cc;

      if ((!unknown && !isDz) || (unknown && !allowUnknownCountry)) {
        await logSecurityEvent({
          event_type: 'geo_block',
          severity: 'warn',
          request_id: requestId,
          method: req.method,
          path,
          status_code: 403,
          ip,
          user_agent: userAgent,
          fingerprint,
          country_code: cc,
          region: geo.region,
          city: geo.city,
          metadata: {
            reason: unknown ? 'geo_unknown' : 'geo_not_dz',
            ms: Date.now() - start,
          },
        });
        // Hard block
        if (path.startsWith('/api/')) {
          return res.status(403).json({ error: 'Access denied' });
        }
        return res.status(403).send('Access denied');
      }
    }

    // After response, log interesting forbidden/unauthorized admin attempts
    res.on('finish', () => {
      const status = res.statusCode;
      const dur = Date.now() - start;
      const u = (req as any).user;

      if ((status === 401 || status === 403) && path.startsWith('/api/admin')) {
        void logSecurityEvent({
          event_type: status === 401 ? 'admin_unauthorized' : 'admin_forbidden',
          severity: linuxUa ? 'error' : 'warn',
          request_id: requestId,
          method: req.method,
          path,
          status_code: status,
          ip,
          user_agent: userAgent,
          fingerprint,
          country_code: geo.country_code,
          region: geo.region,
          city: geo.city,
          user_id: u?.id || null,
          user_type: u?.user_type || null,
          role: u?.role || null,
          metadata: { ms: dur },
        });
      }

      // Log obvious suspicious probes (noisy but valuable)
      const suspicious = /\.env|wp-admin|wp-login|phpmyadmin|\.git|config\.php|sqlmap|\.bak|\.old|\.zip/i.test(path);
      if (suspicious && status >= 400) {
        void logSecurityEvent({
          event_type: 'suspicious_path',
          severity: linuxUa ? 'error' : 'warn',
          request_id: requestId,
          method: req.method,
          path,
          status_code: status,
          ip,
          user_agent: userAgent,
          fingerprint,
          country_code: geo.country_code,
          region: geo.region,
          city: geo.city,
          metadata: { ms: dur },
        });
      }
    });

    return next();
  };
}

// Kernel password hashing (pure Node crypto; no native build)
export function hashKernelPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export function verifyKernelPassword(password: string, stored: string): boolean {
  try {
    if (!stored.startsWith('scrypt$')) return false;
    const parts = stored.split('$');
    // parts: ['scrypt', '', salt, '', hash] because of $$ in format? keep robust.
    const filtered = parts.filter(Boolean);
    // filtered: ['scrypt', saltHex, hashHex]
    if (filtered.length !== 3) return false;
    const saltHex = filtered[1];
    const hashHex = filtered[2];
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const key = crypto.scryptSync(password, salt, expected.length);
    return crypto.timingSafeEqual(expected, key);
  } catch {
    return false;
  }
}
