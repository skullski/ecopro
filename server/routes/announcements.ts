import { Router, type RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { jsonError } from '../utils/httpHelpers';
import { ensureConnection, findUserById } from '../utils/database';
import { extractToken, verifyToken } from '../utils/auth';
import { getJwtSecret } from '../utils/auth';

export const announcementsRouter = Router();

type Identity = { userType: 'client' | 'admin' | 'staff'; userId: number };

async function resolveIdentity(req: any): Promise<Identity | null> {
  // Staff cookie/token path
  const cookies = req.cookies as Record<string, string | undefined> | undefined;
  const token = cookies?.ecopro_staff_at || cookies?.ecopro_at || extractToken(req.headers.authorization);
  if (!token) return null;

  // Try staff token first
  try {
    const decoded: any = jwt.verify(token, getJwtSecret());
    if (decoded?.isStaff === true) {
      const staffId = Number(decoded.staffId || decoded.staff_id || decoded.id);
      const clientId = Number(decoded.clientId || decoded.client_id);
      if (!Number.isFinite(staffId) || !Number.isFinite(clientId)) return null;

      const pool = await ensureConnection();
      const r = await pool.query('SELECT id, status FROM staff WHERE id = $1 AND client_id = $2', [staffId, clientId]);
      if (!r.rows.length) return null;
      if (String(r.rows[0].status) !== 'active') return null;

      return { userType: 'staff', userId: staffId };
    }
  } catch {
    // ignore, try client/admin below
  }

  // Client/Admin cookie token path
  try {
    const decoded: any = verifyToken(token);
    const id = Number(decoded?.id);
    if (!Number.isFinite(id)) return null;
    const user = await findUserById(String(id));
    if (!user) return null;
    const userType = (user as any).user_type === 'admin' || user.role === 'admin' ? 'admin' : 'client';
    return { userType, userId: id };
  } catch {
    return null;
  }
}

const getActiveAnnouncement: RequestHandler = async (req, res) => {
  try {
    const identity = await resolveIdentity(req as any);
    if (!identity) return jsonError(res, 401, 'Not authenticated');

    const pool = await ensureConnection();
    // If the identity is a client, ensure they are a store owner (have store settings)
    if (identity.userType === 'client') {
      try {
        const storeRes = await pool.query(
          `SELECT 1 FROM client_store_settings WHERE client_id = $1 LIMIT 1`,
          [identity.userId]
        );
        if (!storeRes.rows.length) {
          // Not a store owner — no announcement for them
          return res.json({ announcement: null, serverTime: new Date().toISOString() });
        }
      } catch (e) {
        // If the table/migration is missing, fallback to original behavior (don't block announcements)
      }
    }

    const a = await pool.query(
      `SELECT id, title, body, variant, is_enabled, starts_at, ends_at, min_view_ms, allow_dismiss, allow_never_show_again, created_at, updated_at
       FROM platform_announcements
       WHERE is_enabled = true
         AND (starts_at IS NULL OR starts_at <= NOW())
         AND (ends_at IS NULL OR ends_at > NOW())
       ORDER BY COALESCE(starts_at, created_at) DESC
       LIMIT 1`,
      []
    );

    if (!a.rows.length) {
      return res.json({ announcement: null, serverTime: new Date().toISOString() });
    }

    const announcement = a.rows[0];

    const pref = await pool.query(
      `SELECT never_show_again
       FROM platform_announcement_preferences
       WHERE announcement_id = $1 AND user_type = $2 AND user_id = $3
       LIMIT 1`,
      [announcement.id, identity.userType, identity.userId]
    );

    if (pref.rows[0]?.never_show_again) {
      return res.json({ announcement: null, serverTime: new Date().toISOString() });
    }

    return res.json({ announcement, serverTime: new Date().toISOString(), identity: { userType: identity.userType } });
  } catch (e) {
    console.error('[Announcements] active error:', e);
    return jsonError(res, 500, 'Failed to load announcement');
  }
};

const neverShowAgain: RequestHandler = async (req, res) => {
  try {
    const identity = await resolveIdentity(req as any);
    if (!identity) return jsonError(res, 401, 'Not authenticated');

    const id = Number((req.params as any).id);
    if (!Number.isFinite(id)) return jsonError(res, 400, 'Invalid announcement id');

    const pool = await ensureConnection();

    const a = await pool.query(
      `SELECT id, allow_never_show_again
       FROM platform_announcements
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    if (!a.rows.length) return jsonError(res, 404, 'Announcement not found');
    if (!a.rows[0].allow_never_show_again) {
      return jsonError(res, 403, 'Never-show-again is disabled for this announcement');
    }

    await pool.query(
      `INSERT INTO platform_announcement_preferences (announcement_id, user_type, user_id, never_show_again)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (announcement_id, user_type, user_id)
       DO UPDATE SET never_show_again = true, updated_at = NOW()`,
      [id, identity.userType, identity.userId]
    );

    return res.json({ ok: true });
  } catch (e) {
    console.error('[Announcements] never-show-again error:', e);
    return jsonError(res, 500, 'Failed');
  }
};

announcementsRouter.get('/active', getActiveAnnouncement);
announcementsRouter.post('/:id/never-show-again', neverShowAgain);
