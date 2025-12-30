import { RequestHandler } from "express";
import { ensureConnection } from "../utils/database";

export const handleHealth: RequestHandler = async (_req, res) => {
  try {
    const pool = await ensureConnection(2);
    const start = Date.now();
    await pool.query('SELECT 1');
    const latency = Date.now() - start;
    res.json({ status: 'ok', db: { connected: true, latency } });
  } catch (err: any) {
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction ? 'unknown' : (err?.message || 'unknown');
    res.status(500).json({ status: 'error', db: { connected: false, error: message } });
  }
};