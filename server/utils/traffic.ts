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
  country_code?: string | null;
};

const MAX_ROWS = 1000;
let rows: TrafficRow[] = [];

// ============ REAL-TIME ACTIVE USERS TRACKING ============
// Track unique visitors by fingerprint/IP with timestamps
interface ActiveVisitor {
  fingerprint: string;
  ip: string | null;
  userId: string | null;
  userType: string | null;
  lastSeen: number;
  firstSeen: number;
  requestCount: number;
  lastPath: string;
  countryCode: string | null;
}

const activeVisitors = new Map<string, ActiveVisitor>();
const ACTIVE_WINDOW_MS = 60 * 1000; // Consider active if seen in last 60 seconds
const CLEANUP_INTERVAL_MS = 10 * 1000; // Clean up every 10 seconds

// Cleanup old visitors periodically
setInterval(() => {
  const cutoff = Date.now() - ACTIVE_WINDOW_MS * 2; // Keep for 2x window for history
  for (const [key, visitor] of activeVisitors) {
    if (visitor.lastSeen < cutoff) {
      activeVisitors.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

// Record a visitor activity
export function recordVisitorActivity(
  fingerprint: string | null,
  ip: string | null,
  userId: string | null,
  userType: string | null,
  path: string,
  countryCode: string | null = null
) {
  // Use fingerprint as primary key, fallback to IP
  const key = fingerprint || ip || 'unknown';
  if (key === 'unknown') return;
  
  const now = Date.now();
  const existing = activeVisitors.get(key);
  
  if (existing) {
    existing.lastSeen = now;
    existing.requestCount++;
    existing.lastPath = path;
    if (userId) existing.userId = userId;
    if (userType) existing.userType = userType;
    if (countryCode) existing.countryCode = countryCode;
  } else {
    activeVisitors.set(key, {
      fingerprint: fingerprint || key,
      ip,
      userId,
      userType,
      lastSeen: now,
      firstSeen: now,
      requestCount: 1,
      lastPath: path,
      countryCode,
    });
  }
}

// Get real-time active user stats
export function getActiveUsersStats(windowSeconds: number = 30) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;
  
  let total = 0;
  let authenticated = 0;
  let anonymous = 0;
  let admins = 0;
  let clients = 0;
  let visitors = 0;
  const byCountry = new Map<string, number>();
  const recentPaths = new Map<string, number>();
  
  for (const [, visitor] of activeVisitors) {
    if (visitor.lastSeen >= cutoff) {
      total++;
      
      if (visitor.userId) {
        authenticated++;
        if (visitor.userType === 'admin') admins++;
        else if (visitor.userType === 'client') clients++;
        else visitors++;
      } else {
        anonymous++;
      }
      
      if (visitor.countryCode) {
        byCountry.set(visitor.countryCode, (byCountry.get(visitor.countryCode) || 0) + 1);
      }
      
      recentPaths.set(visitor.lastPath, (recentPaths.get(visitor.lastPath) || 0) + 1);
    }
  }
  
  // Get top countries
  const topCountries = Array.from(byCountry.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Get top active pages
  const topPages = Array.from(recentPaths.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Calculate requests per second (from traffic rows)
  const recentTraffic = rows.filter(r => r.ts >= cutoff);
  const requestsPerSecond = windowSeconds > 0 ? (recentTraffic.length / windowSeconds).toFixed(1) : '0';
  
  return {
    windowSeconds,
    timestamp: now,
    active: {
      total,
      authenticated,
      anonymous,
      breakdown: {
        admins,
        clients,
        visitors,
      },
    },
    traffic: {
      requestsInWindow: recentTraffic.length,
      requestsPerSecond: parseFloat(requestsPerSecond),
    },
    topCountries,
    topPages,
  };
}

// Get detailed list of active visitors (for admin view)
export function getActiveVisitorsList(windowSeconds: number = 60, limit: number = 50) {
  const now = Date.now();
  const cutoff = now - (windowSeconds * 1000);
  
  const visitors: Array<{
    fingerprint: string;
    ip: string | null;
    userId: string | null;
    userType: string | null;
    activeFor: number; // seconds
    requestCount: number;
    lastPath: string;
    countryCode: string | null;
  }> = [];
  
  for (const [, visitor] of activeVisitors) {
    if (visitor.lastSeen >= cutoff) {
      visitors.push({
        fingerprint: visitor.fingerprint.substring(0, 12) + '...', // Truncate for privacy
        ip: visitor.ip,
        userId: visitor.userId,
        userType: visitor.userType,
        activeFor: Math.floor((now - visitor.firstSeen) / 1000),
        requestCount: visitor.requestCount,
        lastPath: visitor.lastPath,
        countryCode: visitor.countryCode,
      });
    }
  }
  
  // Sort by most recent activity
  visitors.sort((a, b) => b.requestCount - a.requestCount);
  
  return visitors.slice(0, limit);
}

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
        country_code: (req as any).geo?.country_code || null,
      };

      rows = [row, ...rows].slice(0, MAX_ROWS);
      
      // Record visitor activity for real-time tracking
      recordVisitorActivity(
        fingerprint,
        ip,
        u?.id != null ? String(u.id) : null,
        u?.user_type != null ? String(u.user_type) : null,
        path,
        (req as any).geo?.country_code || null
      );
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
