import { RequestHandler } from "express";
import { ensureConnection } from "../utils/database";

export const handleHealth: RequestHandler = async (_req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const devDbInit = String(process.env.DEV_DB_INIT || '').toLowerCase();
    const devDbInitEnabled = devDbInit === '1' || devDbInit === 'true' || devDbInit === 'yes';

    // In local dev, Render Postgres can be slow/unreachable.
    // Keep health fast unless the developer explicitly opts in.
    if (!isProduction && !devDbInitEnabled) {
      return res.json({ status: 'ok', db: { connected: false, skipped: true } });
    }

    const start = Date.now();
    await ensureConnection(2);
    const latency = Date.now() - start;
    res.json({ status: 'ok', db: { connected: true, latency } });
  } catch (err: any) {
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction ? 'unknown' : (err?.message || 'unknown');
    res.status(500).json({ status: 'error', db: { connected: false, error: message } });
  }
};