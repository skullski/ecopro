import type { RequestHandler } from 'express';
import { ensureConnection } from '../utils/database';

type PublicPlatformMetrics = {
  total_orders: number;
  orders_today: number;
  orders_last_hour: number;
  sales_today: number;
  recent_orders: Array<{ id: number; created_at: string; total_price: number }>;
  generated_at: string;
};

let cached: { atMs: number; value: PublicPlatformMetrics } | null = null;
const CACHE_MS = 30_000;

export const getPublicPlatformMetrics: RequestHandler = async (_req, res) => {
  try {
    const now = Date.now();
    if (cached && now - cached.atMs < CACHE_MS) {
      return res.json({ ...cached.value, cached: true });
    }

    const pool = await ensureConnection();

    const metricsRes = await pool.query(
      `WITH today AS (SELECT DATE_TRUNC('day', NOW()) AS start_day)
       SELECT
         (SELECT COUNT(*)::int FROM store_orders) AS total_orders,
         (SELECT COUNT(*)::int FROM store_orders WHERE created_at >= (SELECT start_day FROM today)) AS orders_today,
         (SELECT COUNT(*)::int FROM store_orders WHERE created_at >= NOW() - INTERVAL '1 hour') AS orders_last_hour,
         (
           SELECT COALESCE(SUM(total_price), 0)::numeric
           FROM store_orders
           WHERE created_at >= (SELECT start_day FROM today)
             AND COALESCE(status, '') NOT IN ('cancelled','refunded','failed')
         ) AS sales_today
      `
    );

    const recentRes = await pool.query(
      `SELECT id, created_at, total_price
       FROM store_orders
       WHERE COALESCE(status, '') NOT IN ('cancelled','refunded','failed')
       ORDER BY created_at DESC
       LIMIT 3`
    );

    const row = metricsRes.rows[0] || {};

    const value: PublicPlatformMetrics = {
      total_orders: Number(row.total_orders ?? 0),
      orders_today: Number(row.orders_today ?? 0),
      orders_last_hour: Number(row.orders_last_hour ?? 0),
      sales_today: Number(row.sales_today ?? 0),
      recent_orders: (recentRes.rows || []).map((r: any) => ({
        id: Number(r.id),
        created_at: new Date(r.created_at).toISOString(),
        total_price: Number(r.total_price ?? 0),
      })),
      generated_at: new Date().toISOString(),
    };

    cached = { atMs: now, value };
    return res.json(value);
  } catch (error) {
    console.error('[getPublicPlatformMetrics] error:', error);
    return res.status(500).json({ error: 'Failed to fetch platform metrics' });
  }
};
