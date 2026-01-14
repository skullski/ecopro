import { ensureConnection } from './database';

function safeText(value: any, maxLen: number): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value);
  if (!s) return null;
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function redactSecrets(input: string): string {
  let s = input;

  // Redact Bearer tokens
  s = s.replace(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/gi, 'Bearer [REDACTED]');

  // Redact JWT-like blobs
  s = s.replace(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[JWT_REDACTED]');

  // Redact long access tokens/keys (heuristic)
  s = s.replace(/([A-Za-z0-9]{20,})/g, (m) => (m.length >= 40 ? '[TOKEN_REDACTED]' : m));

  return s;
}

export async function logPlatformErrorEvent(params: {
  source: 'client' | 'server';
  message: string;
  stack?: string | null;
  url?: string | null;
  method?: string | null;
  path?: string | null;
  status_code?: number | null;
  request_id?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  user_id?: string | null;
  user_type?: string | null;
  role?: string | null;
  client_id?: number | null;
  metadata?: any;
}): Promise<void> {
  try {
    const pool = await ensureConnection();

    const message = redactSecrets(safeText(params.message, 2000) || 'Unknown error');
    const stack = params.stack ? redactSecrets(safeText(params.stack, 12000) || '') : null;

    const url = params.url ? safeText(params.url, 2000) : null;
    const method = params.method ? safeText(params.method, 20) : null;
    const path = params.path ? safeText(params.path, 500) : null;

    const requestId = params.request_id ? safeText(params.request_id, 120) : null;
    const ip = params.ip ? safeText(params.ip, 80) : null;
    const userAgent = params.user_agent ? safeText(params.user_agent, 500) : null;

    const userId = params.user_id ? safeText(params.user_id, 80) : null;
    const userType = params.user_type ? safeText(params.user_type, 32) : null;
    const role = params.role ? safeText(params.role, 32) : null;

    const clientId = Number.isFinite(params.client_id as any) ? Number(params.client_id) : null;
    const statusCode = Number.isFinite(params.status_code as any) ? Number(params.status_code) : null;

    let metadata: any = params.metadata ?? null;
    if (metadata && typeof metadata !== 'object') metadata = { value: metadata };

    await pool.query(
      `INSERT INTO platform_error_events (
        source, message, stack, url, method, path, status_code,
        request_id, ip, user_agent, user_id, user_type, role, client_id, metadata
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14,$15
      )`,
      [
        params.source,
        message,
        stack,
        url,
        method,
        path,
        statusCode,
        requestId,
        ip,
        userAgent,
        userId,
        userType,
        role,
        clientId,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );
  } catch {
    // never fail the request because telemetry failed
  }
}
