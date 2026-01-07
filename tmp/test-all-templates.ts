/**
 * Test all storefront templates by switching to each one and verifying
 * the public storefront API returns the correct template.
 * 
 * Usage: pnpm exec tsx tmp/test-all-templates.ts
 */

export {};

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

const ALL_TEMPLATES = [
  'shiro-hana',
  'babyos',
  'bags',
  'jewelry',
  'fashion',
  'electronics',
  'beauty',
  'food',
  'cafe',
  'furniture',
  'perfume',
];

class CookieJar {
  map = new Map<string, string>();

  absorb(setCookieHeaders: string | string[] | null) {
    if (!setCookieHeaders) return;
    const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    for (const raw of headers) {
      if (!raw || typeof raw !== 'string') continue;
      const first = raw.split(';')[0];
      const eq = first.indexOf('=');
      if (eq <= 0) continue;
      const name = first.slice(0, eq).trim();
      const value = first.slice(eq + 1).trim();
      if (name) this.map.set(name, value);
    }
  }

  header(): string {
    return Array.from(this.map.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
  }

  get(name: string): string | undefined {
    return this.map.get(name);
  }
}

async function http(jar: CookieJar | null, method: string, path: string, options: { json?: any } = {}) {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {};

  if (jar) {
    const cookie = jar.header();
    if (cookie) headers['Cookie'] = cookie;
    const csrf = jar.get('ecopro_csrf');
    if (csrf && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      headers['X-CSRF-Token'] = csrf;
    }
  }

  let body: string | undefined;
  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  const resp = await fetch(url, { method, headers, body, redirect: 'manual' });

  const setCookie = (resp.headers as any).getSetCookie?.() || resp.headers.get('set-cookie');
  jar?.absorb(setCookie);

  const text = await resp.text();
  let data: any = null;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!resp.ok) {
    const err: any = new Error(`HTTP ${resp.status} ${method} ${path}`);
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return { status: resp.status, data };
}

function randSuffix() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function strongPassword() {
  return `S0lid!Pass-${randSuffix()}Aa`;
}

async function main() {
  console.log('🧪 Testing ALL templates save & public visibility...\n');

  const jar = new CookieJar();

  // Prime CSRF
  await http(jar, 'GET', '/api/auth/me').catch(() => null);

  const email = `template-test-${randSuffix()}@example.com`;
  const password = strongPassword();

  // Register + login
  console.log(`📝 Registering test account: ${email}`);
  await http(jar, 'POST', '/api/auth/register', {
    json: { email, password, name: 'Template Tester', role: 'client' },
  });

  await http(jar, 'POST', '/api/auth/login', {
    json: { email, password },
  });

  // Get store slug
  const settingsRes = await http(jar, 'GET', '/api/client/store/settings');
  const storeSlug = settingsRes.data?.store_slug;
  if (!storeSlug) throw new Error('Could not get store_slug');
  console.log(`🏪 Store slug: ${storeSlug}\n`);

  const results: { template: string; saved: string; public: string; pass: boolean }[] = [];

  for (const template of ALL_TEMPLATES) {
    process.stdout.write(`Testing "${template}"... `);

    try {
      // 1. Switch template
      await http(jar, 'PUT', '/api/client/store/settings', {
        json: {
          __templateSwitch: {
            toTemplate: template,
            mode: 'defaults',
            importKeys: [],
          },
        },
      });

      // 2. Verify it was saved (authenticated endpoint)
      const afterSwitch = await http(jar, 'GET', '/api/client/store/settings');
      const savedTemplate = afterSwitch.data?.template;

      // 3. Verify public storefront returns the same template
      const publicRes = await http(null, 'GET', `/api/storefront/${encodeURIComponent(storeSlug)}/settings`);
      const publicTemplate = publicRes.data?.template;

      const pass = savedTemplate === template && publicTemplate === template;
      results.push({ template, saved: savedTemplate, public: publicTemplate, pass });

      if (pass) {
        console.log('✅ PASS');
      } else {
        console.log(`❌ FAIL (saved=${savedTemplate}, public=${publicTemplate})`);
      }
    } catch (e: any) {
      console.log(`❌ ERROR: ${e.message}`);
      results.push({ template, saved: 'ERROR', public: 'ERROR', pass: false });
    }
  }

  console.log('\n========== RESULTS ==========\n');
  console.log('Template        | Saved           | Public          | Status');
  console.log('----------------|-----------------|-----------------|-------');
  for (const r of results) {
    const tpl = r.template.padEnd(15);
    const saved = r.saved.padEnd(15);
    const pub = r.public.padEnd(15);
    const status = r.pass ? '✅' : '❌';
    console.log(`${tpl} | ${saved} | ${pub} | ${status}`);
  }

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;

  console.log(`\n${passed}/${results.length} templates passed`);

  if (failed > 0) {
    console.log('\n❌ Some templates failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All templates working correctly!');
  }
}

main().catch(e => {
  console.error('Fatal error:', e.message || e);
  process.exit(1);
});
