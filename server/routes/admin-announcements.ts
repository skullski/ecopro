import { Router, type RequestHandler } from 'express';
import { jsonError } from '../utils/httpHelpers';
import { ensureConnection } from '../utils/database';

export const adminAnnouncementsRouter = Router();

function normalizeVariant(raw: unknown): 'blue' | 'red' {
  return raw === 'red' ? 'red' : 'blue';
}

const listAnnouncements: RequestHandler = async (_req, res) => {
  try {
    const pool = await ensureConnection();
    const r = await pool.query(
      `SELECT id, title, body, variant, is_enabled, starts_at, ends_at, min_view_ms, allow_dismiss, allow_never_show_again, created_at, updated_at
       FROM platform_announcements
       ORDER BY created_at DESC
       LIMIT 50`,
      []
    );
    res.json({ announcements: r.rows });
  } catch (e) {
    console.error('[AdminAnnouncements] list error:', e);
    return jsonError(res, 500, 'Failed');
  }
};

const createAnnouncement: RequestHandler = async (req, res) => {
  try {
    const adminId = Number((req as any).user?.id);
    const { title, body, variant, is_enabled, starts_at, ends_at, min_view_ms, allow_dismiss, allow_never_show_again } = req.body || {};

    if (!title || typeof title !== 'string') return jsonError(res, 400, 'title is required');
    if (!body || typeof body !== 'string') return jsonError(res, 400, 'body is required');

    const v = normalizeVariant(variant);

    // Template defaults
    const defaults = v === 'red'
      ? { allowDismiss: true, allowNever: false, minViewMs: 3000 }
      : { allowDismiss: true, allowNever: true, minViewMs: 0 };

    const pool = await ensureConnection();
    const r = await pool.query(
      `INSERT INTO platform_announcements (
         title, body, variant, is_enabled, starts_at, ends_at,
         min_view_ms, allow_dismiss, allow_never_show_again,
         created_by_admin_id, created_at, updated_at
       ) VALUES (
         $1, $2, $3, COALESCE($4, true), $5, $6,
         $7, $8, $9,
         $10, NOW(), NOW()
       )
       RETURNING id`,
      [
        title.trim(),
        body.trim(),
        v,
        typeof is_enabled === 'boolean' ? is_enabled : true,
        starts_at ? new Date(starts_at) : null,
        ends_at ? new Date(ends_at) : null,
        Number.isFinite(Number(min_view_ms)) ? Math.max(0, Math.floor(Number(min_view_ms))) : defaults.minViewMs,
        typeof allow_dismiss === 'boolean' ? allow_dismiss : defaults.allowDismiss,
        typeof allow_never_show_again === 'boolean' ? allow_never_show_again : defaults.allowNever,
        Number.isFinite(adminId) ? adminId : null,
      ]
    );

    res.json({ ok: true, id: r.rows[0].id });
  } catch (e) {
    console.error('[AdminAnnouncements] create error:', e);
    return jsonError(res, 500, 'Failed');
  }
};

const updateAnnouncement: RequestHandler = async (req, res) => {
  try {
    const id = Number((req.params as any).id);
    if (!Number.isFinite(id)) return jsonError(res, 400, 'Invalid id');

    const patch = req.body || {};
    const pool = await ensureConnection();

    // Fetch existing so we can apply template rules when variant changes.
    const existing = await pool.query('SELECT * FROM platform_announcements WHERE id = $1', [id]);
    if (!existing.rows.length) return jsonError(res, 404, 'Not found');

    const nextVariant = patch.variant ? normalizeVariant(patch.variant) : normalizeVariant(existing.rows[0].variant);

    const defaults = nextVariant === 'red'
      ? { allowNever: false }
      : { allowNever: true };

    const r = await pool.query(
      `UPDATE platform_announcements
       SET
         title = COALESCE($1, title),
         body = COALESCE($2, body),
         variant = COALESCE($3, variant),
         is_enabled = COALESCE($4, is_enabled),
         starts_at = COALESCE($5, starts_at),
         ends_at = COALESCE($6, ends_at),
         min_view_ms = COALESCE($7, min_view_ms),
         allow_dismiss = COALESCE($8, allow_dismiss),
         allow_never_show_again = COALESCE($9, allow_never_show_again),
         updated_at = NOW()
       WHERE id = $10
       RETURNING id`,
      [
        typeof patch.title === 'string' ? patch.title.trim() : null,
        typeof patch.body === 'string' ? patch.body.trim() : null,
        patch.variant ? nextVariant : null,
        typeof patch.is_enabled === 'boolean' ? patch.is_enabled : null,
        patch.starts_at ? new Date(patch.starts_at) : null,
        patch.ends_at ? new Date(patch.ends_at) : null,
        Number.isFinite(Number(patch.min_view_ms)) ? Math.max(0, Math.floor(Number(patch.min_view_ms))) : null,
        typeof patch.allow_dismiss === 'boolean' ? patch.allow_dismiss : null,
        typeof patch.allow_never_show_again === 'boolean'
          ? patch.allow_never_show_again
          : (patch.variant ? defaults.allowNever : null),
        id,
      ]
    );

    res.json({ ok: true, id: r.rows[0].id });
  } catch (e) {
    console.error('[AdminAnnouncements] update error:', e);
    return jsonError(res, 500, 'Failed');
  }
};

adminAnnouncementsRouter.get('/', listAnnouncements);
adminAnnouncementsRouter.post('/', createAnnouncement);
adminAnnouncementsRouter.patch('/:id', updateAnnouncement);
