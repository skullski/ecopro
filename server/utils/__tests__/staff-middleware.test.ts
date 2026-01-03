import { describe, expect, it, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

let poolQuery: any;

vi.mock('../database', () => {
  return {
    ensureConnection: vi.fn(async () => ({
      query: (...args: any[]) => poolQuery(...args),
    })),
  };
});

vi.mock('../auth', () => {
  return {
    getJwtSecret: () => 'test-secret',
  };
});

import { authenticateStaff, requireStaffPermission } from '../staff-middleware';

function makeRes() {
  const res: any = {};
  res.statusCode = 200;
  res.body = undefined;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body: any) => {
    res.body = body;
    return res;
  };
  return res;
}

describe('staff-middleware', () => {
  beforeEach(() => {
    poolQuery = vi.fn(async () => ({ rows: [] }));
  });

  it('authenticateStaff: 401 when no token', async () => {
    const req: any = { headers: {}, cookies: {} };
    const res = makeRes();
    const next = vi.fn();

    await authenticateStaff(req, res as any, next as any);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('authenticateStaff: sets req.user and calls next on valid staff token', async () => {
    const token = jwt.sign(
      { staffId: 1, clientId: 10, isStaff: true, email: 's@example.com', role: 'staff' },
      'test-secret',
      { expiresIn: '1h' }
    );

    poolQuery = vi.fn(async (sql: string) => {
      if (sql.includes('FROM staff') && sql.includes('status')) {
        return { rows: [{ id: 1, client_id: 10, status: 'active' }] };
      }
      if (sql.includes('FROM clients')) {
        return { rows: [{ is_locked: false, locked_reason: null, lock_type: 'payment' }] };
      }
      return { rows: [] };
    });

    const req: any = { headers: {}, cookies: { ecopro_staff_at: token } };
    const res = makeRes();
    const next = vi.fn();

    await authenticateStaff(req, res as any, next as any);

    expect(res.statusCode).toBe(200);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ staffId: 1, clientId: 10, isStaff: true });
  });

  it('authenticateStaff: 503 when lock status cannot be validated', async () => {
    const token = jwt.sign(
      { staffId: 1, clientId: 10, isStaff: true, email: 's@example.com', role: 'staff' },
      'test-secret',
      { expiresIn: '1h' }
    );

    poolQuery = vi.fn(async (sql: string) => {
      if (sql.includes('FROM staff') && sql.includes('status')) {
        return { rows: [{ id: 1, client_id: 10, status: 'active' }] };
      }
      if (sql.includes('FROM clients')) {
        throw new Error('missing column');
      }
      return { rows: [] };
    });

    const req: any = { headers: {}, cookies: { ecopro_staff_at: token } };
    const res = makeRes();
    const next = vi.fn();

    await authenticateStaff(req, res as any, next as any);

    expect(res.statusCode).toBe(503);
    expect(next).not.toHaveBeenCalled();
  });

  it('requireStaffPermission: 403 when permission missing', async () => {
    poolQuery = vi.fn(async (sql: string) => {
      if (sql.includes('SELECT permissions FROM staff')) {
        return { rows: [{ permissions: { view_orders: false } }] };
      }
      return { rows: [] };
    });

    const req: any = { user: { staffId: 1, clientId: 10 } };
    const res = makeRes();
    const next = vi.fn();

    await requireStaffPermission('view_orders')(req, res as any, next as any);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('requireStaffPermission: accepts aliases for legacy keys', async () => {
    poolQuery = vi.fn(async (sql: string) => {
      if (sql.includes('SELECT permissions FROM staff')) {
        return { rows: [{ permissions: { view_orders_list: true } }] };
      }
      return { rows: [] };
    });

    const req: any = { user: { staffId: 1, clientId: 10 } };
    const res = makeRes();
    const next = vi.fn();

    await requireStaffPermission('view_orders')(req, res as any, next as any);

    expect(res.statusCode).toBe(200);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
