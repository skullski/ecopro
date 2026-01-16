import { RequestHandler } from "express";
import { ensureConnection } from "../utils/database";

async function getSpaAssets(): Promise<null | { styles: string[]; scripts: string[] }> {
  if (process.env.NODE_ENV !== 'production') return null;
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const spaBuildPath = path.join(__dirname, '../../spa');
    const indexPath = path.join(spaBuildPath, 'index.html');
    const html = await fs.readFile(indexPath, 'utf8');

    const styles = Array.from(
      html.matchAll(/<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)
    ).map((m) => m[1]);
    const scripts = Array.from(
      html.matchAll(/<script[^>]*type=["']module["'][^>]*src=["']([^"']+)["'][^>]*>/gi)
    ).map((m) => m[1]);

    return { styles, scripts };
  } catch {
    return null;
  }
}

export const handleHealth: RequestHandler = async (_req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const devDbInit = String(process.env.DEV_DB_INIT || '').toLowerCase();
    const devDbInitEnabled = devDbInit === '1' || devDbInit === 'true' || devDbInit === 'yes';

    const commit = process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || null;
    const spa_assets = await getSpaAssets();

    // In local dev, Render Postgres can be slow/unreachable.
    // Keep health fast unless the developer explicitly opts in.
    if (!isProduction && !devDbInitEnabled) {
      return res.json({ status: 'ok', commit, spa_assets, db: { connected: false, skipped: true } });
    }

    const start = Date.now();
    await ensureConnection(2);
    const latency = Date.now() - start;
    res.json({ status: 'ok', commit, spa_assets, db: { connected: true, latency } });
  } catch (err: any) {
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction ? 'unknown' : (err?.message || 'unknown');
    const commit = process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || null;
    const spa_assets = await getSpaAssets();
    res.status(500).json({ status: 'error', commit, spa_assets, db: { connected: false, error: message } });
  }
};