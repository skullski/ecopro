import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export type TrafficRow = {
  ts: number;
  method: string;
  path: string;
  status: number;
  ip: string | null;
  user_agent: string | null;
  fingerprint: string | null;
  user_id: string | null;
  user_type: string | null;
  role: string | null;
  ms: number;
};

const MAX_ROWS = 1000;
let rows: TrafficRow[] = [];

function normalizeIp(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const ip = raw.trim();
  if (!ip) return null;
  if (ip.startsWith('::ffff:')) return ip.substring('::ffff:'.length);
  return ip;
}

function firstForwardedFor(xff: string): string {
  const first = xff.split(',')[0]?.trim();
  return first || xff.trim();
}

function getClientIp(req: Request): string | null {
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

export function trafficMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    try {
      const dur = Date.now() - start;
      const u = (req as any).user;
      const ip = getClientIp(req);
      const userAgent = (req.headers['user-agent'] as string | undefined) || null;
      const fpCookie = (() => {
        const raw = req.headers.cookie;
        if (!raw) return null;
        const parts = raw.split(';');
        for (const p of parts) {
          const [k, ...rest] = p.split('=');
          if (!k) continue;
          if (k.trim() !== 'ecopro_fp') continue;
          return decodeURIComponent(rest.join('=').trim());
        }
        return null;
      })();
      const fingerprint = (() => {
        try {
          if (!ip && !userAgent && !fpCookie) return null;
          const raw = `${ip || '-'}|${userAgent || '-'}|${fpCookie || '-'}`;
          return crypto.createHash('sha256').update(raw).digest('hex');
        } catch {
          return null;
        }
      })();
      const path = (req.originalUrl || req.url || '').split('?')[0] || '';

      // Keep it cheap: record only API + storefront paths.
      if (!path.startsWith('/api/') && !path.startsWith('/store/')) return;

      const row: TrafficRow = {
        ts: Date.now(),
        method: req.method,
        path,
        status: res.statusCode,
        ip,
        user_agent: userAgent,
        fingerprint,
        user_id: u?.id != null ? String(u.id) : null,
        user_type: u?.user_type != null ? String(u.user_type) : null,
        role: u?.role != null ? String(u.role) : null,
        ms: dur,
      };

      rows = [row, ...rows].slice(0, MAX_ROWS);
    } catch {
      // ignore
    }
  });

  return next();
}

export function getTrafficRecent(limit: number): TrafficRow[] {
  const n = Math.max(1, Math.min(1000, limit || 200));
  return rows.slice(0, n);
}

export function getTrafficSummary(minutes: number): {
  minutes: number;
  total: number;
  byStatus: Array<{ status: number; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
  topIps: Array<{ ip: string; count: number }>;
} {
  const m = Math.max(1, Math.min(180, minutes || 15));
  const since = Date.now() - m * 60 * 1000;
  const subset = rows.filter((r) => r.ts >= since);

  const byStatusMap = new Map<number, number>();
  const topPathsMap = new Map<string, number>();
  const topIpsMap = new Map<string, number>();

  for (const r of subset) {
    byStatusMap.set(r.status, (byStatusMap.get(r.status) || 0) + 1);
    topPathsMap.set(r.path, (topPathsMap.get(r.path) || 0) + 1);
    if (r.ip) topIpsMap.set(r.ip, (topIpsMap.get(r.ip) || 0) + 1);
  }

  const byStatus = Array.from(byStatusMap.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const topPaths = Array.from(topPathsMap.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const topIps = Array.from(topIpsMap.entries())
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return {
    minutes: m,
    total: subset.length,
    byStatus,
    topPaths,
    topIps,
  };
}
