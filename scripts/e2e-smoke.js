// E2E smoke runner (cookie auth + CSRF)
//
// Goals:
// - Exercise the most critical flows end-to-end against a real running backend.
// - Never uses a local database; it only calls HTTP endpoints.
//
// Usage:
//   BASE_URL=http://localhost:8080 node scripts/e2e-smoke.js
//
// Optional:
//   E2E_EMAIL=... E2E_PASSWORD=... (otherwise random account will be created)

const BASE_URL = (process.env.BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

function randSuffix() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function strongPassword() {
  // Must pass server password policy: >= 12, upper/lower/digit/symbol
  return `S0lid!Pass-${randSuffix()}Aa`;
}

class CookieJar {
  constructor() {
    this.map = new Map();
  }

  absorb(setCookieHeaders) {
    if (!setCookieHeaders) return;
    const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    for (const raw of headers) {
      if (!raw || typeof raw !== 'string') continue;
      const first = raw.split(';')[0];
      const eq = first.indexOf('=');
      if (eq <= 0) continue;
      const name = first.slice(0, eq).trim();
      const value = first.slice(eq + 1).trim();
      if (!name) continue;
      this.map.set(name, value);
    }
  }

  header() {
    const parts = [];
    for (const [k, v] of this.map.entries()) parts.push(`${k}=${v}`);
    return parts.join('; ');
  }

  get(name) {
    return this.map.get(name);
  }
}

async function http(jar, method, path, { json, headers } = {}) {
  const url = `${BASE_URL}${path}`;

  const h = {
    ...(headers || {}),
  };

  const cookieHeader = jar?.header();
  if (cookieHeader) h['Cookie'] = cookieHeader;

  // CSRF: only required when auth cookies exist, but sending when available is fine.
  const csrf = jar?.get('ecopro_csrf');
  if (csrf && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    h['X-CSRF-Token'] = csrf;
  }

  let body;
  if (json !== undefined) {
    h['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }

  const resp = await fetch(url, {
    method,
    headers: h,
    body,
    redirect: 'manual',
  });

  const setCookie = resp.headers.getSetCookie?.() || resp.headers.get('set-cookie');
  jar?.absorb(setCookie);

  const text = await resp.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!resp.ok) {
    const err = new Error(`HTTP ${resp.status} ${method} ${path}`);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return { status: resp.status, data };
}

async function httpExpectFailure(jar, method, path, { json, headers, expectedStatus } = {}) {
  try {
    await http(jar, method, path, { json, headers });
  } catch (e) {
    if (expectedStatus && e?.status !== expectedStatus) {
      throw new Error(`Expected HTTP ${expectedStatus} for ${method} ${path}, got ${e?.status}`);
    }
    return { status: e?.status, data: e?.data };
  }
  throw new Error(`Expected failure for ${method} ${path}, but it succeeded`);
}

async function main() {
  const jar = new CookieJar();

  // Prime CSRF cookie
  await http(jar, 'GET', '/api/auth/me').catch(() => null);

  const email = process.env.E2E_EMAIL || `e2e-${randSuffix()}@example.com`;
  const password = process.env.E2E_PASSWORD || strongPassword();

  // 1) Register
  await http(jar, 'POST', '/api/auth/register', {
    json: {
      email,
      password,
      name: 'E2E Test Owner',
      role: 'client',
    },
  });

  // 2) Login
  await http(jar, 'POST', '/api/auth/login', {
    json: { email, password },
  });

  // 3) Fetch store settings to get store_slug
  const me = await http(jar, 'GET', '/api/auth/me');
  const ownerId = me?.data?.id;
  if (!ownerId) throw new Error('Missing /api/auth/me id');

  const settingsRes = await http(jar, 'GET', '/api/client/store/settings');
  const storeSlug = settingsRes?.data?.store_slug || settingsRes?.data?.storeSlug || settingsRes?.data?.slug;
  if (!storeSlug) {
    throw new Error('Could not determine store_slug from /api/client/store/settings');
  }

  // 4) Create product (owner API)
  const productRes = await http(jar, 'POST', `/api/client/store/products`, {
    json: {
      title: `E2E Product ${randSuffix()}`,
      description: 'E2E description',
      price: 123,
      category: 'E2E',
      stock_quantity: 10,
    },
  });
  const productId = productRes?.data?.id;
  if (!productId) throw new Error('Product creation did not return id');

  // 5) Create public order via storefront endpoint (price spoof attempt must be ignored)
  const quantity = 2;
  const spoofedTotal = 1;
  const expectedTotal = 123 * quantity;

  const publicOrderRes = await http(new CookieJar(), 'POST', `/api/storefront/${encodeURIComponent(storeSlug)}/orders`, {
    json: {
      product_id: productId,
      quantity,
      total_price: spoofedTotal,
      customer_name: 'E2E Buyer',
      customer_phone: '+213555000111',
      customer_email: 'buyer@example.com',
      customer_address: 'E2E Address',
    },
  });

  const createdOrder = publicOrderRes?.data?.order;
  if (!createdOrder?.id) throw new Error('Public order creation did not return order.id');
  const returnedTotal = Number(createdOrder.total_price);
  if (!Number.isFinite(returnedTotal)) throw new Error('Public order response missing total_price');
  if (returnedTotal !== expectedTotal) {
    throw new Error(`Expected server-computed total_price=${expectedTotal}, got ${returnedTotal}`);
  }
  if (returnedTotal === spoofedTotal) {
    throw new Error('Price spoof succeeded (total_price was trusted)');
  }

  // 5b) Confirmation link must be token-bound
  const confirmationUrl = publicOrderRes?.data?.confirmationUrl;
  if (!confirmationUrl || typeof confirmationUrl !== 'string') {
    throw new Error('Missing confirmationUrl in public order response');
  }
  const token = new URL(confirmationUrl, BASE_URL).searchParams.get('t');
  if (!token) throw new Error('confirmationUrl missing ?t= token');

  // Without token should fail
  await httpExpectFailure(new CookieJar(), 'GET', `/api/storefront/${encodeURIComponent(storeSlug)}/order/${encodeURIComponent(String(createdOrder.id))}`, {
    expectedStatus: 400,
  });

  // With token should succeed
  await http(new CookieJar(), 'GET', `/api/storefront/${encodeURIComponent(storeSlug)}/order/${encodeURIComponent(String(createdOrder.id))}?t=${encodeURIComponent(token)}`);

  // 6) Create staff (owner-only)
  const staffEmail = `staff-${randSuffix()}@example.com`;
  const staffPassword = strongPassword();
  await http(jar, 'POST', '/api/client/staff/create', {
    json: {
      username: staffEmail,
      password: staffPassword,
      role: 'staff',
      permissions: { view_orders: true, edit_orders: false },
    },
  });

  // 7) Staff login + fetch staff orders
  const staffJar = new CookieJar();
  await http(staffJar, 'GET', '/api/staff/me').catch(() => null);
  await http(staffJar, 'POST', '/api/staff/login', {
    json: { username: staffEmail, password: staffPassword },
  });
  await http(staffJar, 'GET', '/api/staff/orders');

  // 8) Optional: verify lock/block semantics via admin endpoints
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const adminJar = new CookieJar();
    await http(adminJar, 'GET', '/api/auth/me').catch(() => null);
    await http(adminJar, 'POST', '/api/auth/login', { json: { email: adminEmail, password: adminPassword } });

    // 8a) Lock account (payment) -> login still OK, but /api/client/* blocked
    await http(adminJar, 'POST', '/api/admin/lock-account', {
      json: { client_id: ownerId, reason: 'Subscription expired (E2E)', lock_type: 'payment' },
    });

    // Owner session should still be valid, but API should be blocked
    await http(jar, 'GET', '/api/auth/me');
    await httpExpectFailure(jar, 'GET', '/api/client/store/settings', { expectedStatus: 403 });
    await httpExpectFailure(staffJar, 'GET', '/api/staff/orders', { expectedStatus: 403 });

    // 8b) Block account -> cannot login again
    await http(adminJar, 'POST', `/api/admin/users/${encodeURIComponent(String(ownerId))}/lock`, {
      json: { reason: 'Blocked by admin (E2E)' },
    });

    // Existing session should get denied on authenticated endpoints
    await httpExpectFailure(jar, 'GET', '/api/auth/me', { expectedStatus: 403 });

    // Fresh login should be denied
    const freshJar = new CookieJar();
    await http(freshJar, 'GET', '/api/auth/me').catch(() => null);
    await httpExpectFailure(freshJar, 'POST', '/api/auth/login', {
      json: { email, password },
      expectedStatus: 403,
    });
  }

  console.log('✅ E2E smoke OK');
  console.log(JSON.stringify({ baseUrl: BASE_URL, email, storeSlug, productId, publicOrder: createdOrder?.id || null }, null, 2));
}

main().catch((e) => {
  console.error('❌ E2E smoke failed');
  console.error(e?.message || e);
  if (e?.data) console.error('Response:', JSON.stringify(e.data, null, 2));
  process.exit(1);
});
