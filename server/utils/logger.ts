import fs from 'fs';
import path from 'path';

const logsDir = path.resolve(process.cwd(), 'server', 'logs');
const storeSettingsLog = path.join(logsDir, 'store-settings.log');

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
    ensureDirAndFile(storeSettingsLog);
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      event,
      payload,
    });
    fs.appendFileSync(storeSettingsLog, line + '\n', 'utf-8');
  } catch (e) {
    console.error('[logger] logStoreSettings error:', (e as any)?.message || e);
  }
}

export const STORE_SETTINGS_LOG_PATH = storeSettingsLog;
