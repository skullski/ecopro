import { Router, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/auth';
import { pool } from '../utils/database';
import { logPlatformErrorEvent, PLATFORM_ERRORS_LOG_PATH } from '../utils/error-telemetry';
import fs from 'fs';

const router = Router();

// Tight limiter: we never want this endpoint abused.
const telemetryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many telemetry requests. Please try again later.' },
});

const safeString = (v: any, maxLen: number): string => {
  const s = String(v ?? '');
  return s.length > maxLen ? s.slice(0, maxLen) : s;
};

/**
 * Public: client-side runtime errors
 * POST /api/telemetry/client-error
 */
const clientError: RequestHandler = async (req, res) => {
  try {
    const body = (req.body || {}) as any;

    const message = safeString(body.message, 2000);
    if (!message) return res.status(400).json({ error: 'message required' });

    const stack = body.stack ? safeString(body.stack, 12000) : null;
    const url = body.url ? safeString(body.url, 2000) : safeString(req.headers.referer, 2000);

    const ip = (req as any).clientIp || (req.headers['cf-connecting-ip'] as string | undefined) || null;
    const ua = (req.headers['user-agent'] as string | undefined) || null;

    // Optional auth context (best-effort)
    const user = (req as any).user as any;
    const userId = user?.id ? String(user.id) : null;
    const userType = user?.user_type ? String(user.user_type) : null;
    const role = user?.role ? String(user.role) : null;
    const clientId = userType === 'client' && user?.id ? Number(user.id) : null;

    const metadata = {
      name: body.name ? safeString(body.name, 200) : null,
      componentStack: body.componentStack ? safeString(body.componentStack, 8000) : null,
      route: body.route ? safeString(body.route, 500) : null,
      build: body.build ? safeString(body.build, 80) : null,
    };

    await logPlatformErrorEvent({
      source: 'client',
      message,
      stack,
      url,
      ip,
      user_agent: ua,
      user_id: userId,
      user_type: userType,
      role,
      client_id: clientId,
      metadata,
    });

    return res.json({ ok: true });
  } catch {
    return res.json({ ok: true });
  }
};

/**
 * Admin: list recent platform errors
 * GET /api/telemetry/platform-errors?days=7&limit=200&source=client|server
 */
const listPlatformErrors: RequestHandler = async (req, res) => {
  const days = Math.max(1, Math.min(30, Number(req.query.days || 7)));
  const limit = Math.max(1, Math.min(500, Number(req.query.limit || 200)));
  const source = typeof req.query.source === 'string' ? req.query.source : '';
  const sourceFilter = source === 'client' || source === 'server' ? source : '';

  const params: any[] = [];
  let where = `WHERE created_at >= NOW() - ($1::text || ' days')::interval`;
  params.push(String(days));

  if (sourceFilter) {
    params.push(sourceFilter);
    where += ` AND source = $${params.length}`;
  }

  params.push(limit);

  const result = await pool.query(
    `SELECT id, created_at, source, message, stack, url, method, path, status_code, request_id,
            ip, user_agent, user_id, user_type, role, client_id, metadata
       FROM platform_error_events
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length}`,
    params
  );

  return res.json({ days, limit, source: sourceFilter || null, events: result.rows });
};

router.post('/client-error', telemetryLimiter, clientError);
router.get('/platform-errors', authenticate, requireAdmin, listPlatformErrors);

/**
 * Admin: tail the on-disk platform error log (NDJSON)
 * GET /api/telemetry/platform-errors-file?limit=200
 */
const tailPlatformErrorsFile: RequestHandler = async (req, res) => {
  const limit = Math.max(1, Math.min(500, Number(req.query.limit || 200)));

  try {
    const stat = await fs.promises.stat(PLATFORM_ERRORS_LOG_PATH);
    const maxBytes = Math.min(stat.size, 2 * 1024 * 1024); // read up to last 2MB
    const start = Math.max(0, stat.size - maxBytes);

    const fh = await fs.promises.open(PLATFORM_ERRORS_LOG_PATH, 'r');
    try {
      const buf = Buffer.alloc(maxBytes);
      const { bytesRead } = await fh.read(buf, 0, maxBytes, start);
      const text = buf.subarray(0, bytesRead).toString('utf-8');
      const lines = text
        .split('\n')
        .filter((l) => l.trim().length > 0);

      // If we started in the middle of a line, drop the first partial line.
      const normalized = start > 0 ? lines.slice(1) : lines;
      const tail = normalized.slice(-limit);
      return res.json({ ok: true, limit, file: 'platform-errors.ndjson', lines: tail });
    } finally {
      await fh.close();
    }
  } catch {
    return res.json({ ok: true, limit, file: 'platform-errors.ndjson', lines: [] });
  }
};

router.get('/platform-errors-file', authenticate, requireAdmin, tailPlatformErrorsFile);

export default router;
