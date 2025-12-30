import fs from 'fs';
import path from 'path';

const logsDir = path.resolve(process.cwd(), 'server', 'logs');
const storeSettingsLog = path.join(logsDir, 'store-settings.log');

const SENSITIVE_KEY_RE = /(authorization|cookie|token|secret|password|api[_-]?key|private[_-]?key)/i;

function redact(value: any, depth = 0): any {
  if (depth > 6) return '[truncated]';
  if (value == null) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (SENSITIVE_KEY_RE.test(k)) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redact(v, depth + 1);
      }
    }
    return out;
  }
  if (typeof value === 'string' && value.length > 500) {
    return value.slice(0, 500) + '…';
  }
  return value;
}

function ensureDirAndFile(filePath: string) {
  try {
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '', 'utf-8');
  } catch (e) {
    // Non-fatal; file creation failures should not crash app
    console.error('[logger] ensureDirAndFile error:', (e as any)?.message || e);
  }
}

export function logStoreSettings(event: string, payload: Record<string, any>) {
  try {
    if (process.env.NODE_ENV === 'production') return;
    ensureDirAndFile(storeSettingsLog);
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      event,
      payload: redact(payload),
    });
    fs.appendFileSync(storeSettingsLog, line + '\n', 'utf-8');
  } catch (e) {
    console.error('[logger] logStoreSettings error:', (e as any)?.message || e);
  }
}

export const STORE_SETTINGS_LOG_PATH = storeSettingsLog;
