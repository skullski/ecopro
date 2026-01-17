// Production smoke checks for the deployed SPA.
//
// Detects common deploy regressions that can cause invalid hook calls:
// - mixed asset build ids (?v=...) on the same HTML response
// - multiple module script tags referencing app bundles
// - duplicate/missing root container
//
// Usage:
//   PROD_BASE_URL=https://www.sahla4eco.com node scripts/prod-smoke.mjs

const BASE_URL = (process.env.PROD_BASE_URL || 'https://www.sahla4eco.com').replace(/\/$/, '');

const PATHS = [
  '/',
  '/login',
  '/platform-admin',
  '/dashboard',
];

function fail(message) {
  console.error(`PROD-SMOKE FAIL: ${message}`);
  process.exit(1);
}

function unique(arr) {
  return Array.from(new Set(arr));
}

function countOccurrences(haystack, needle) {
  let idx = 0;
  let count = 0;
  while (true) {
    idx = haystack.indexOf(needle, idx);
    if (idx === -1) return count;
    count += 1;
    idx += needle.length;
  }
}

function extractModuleScriptSrcs(html) {
  const out = [];
  // loose but effective regex for script tags
  const re = /<script\s+[^>]*type=["']module["'][^>]*src=["']([^"']+)["'][^>]*>\s*<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    out.push(m[1]);
  }
  return out;
}

function extractBuildIdsFromUrls(urls) {
  const ids = [];
  for (const raw of urls) {
    try {
      const u = new URL(raw, BASE_URL);
      const v = u.searchParams.get('v');
      if (v) ids.push(String(v).slice(0, 80));
    } catch {
      // ignore
    }
  }
  return ids;
}

async function fetchHtml(pathname) {
  const url = `${BASE_URL}${pathname}`;
  const resp = await fetch(url, {
    redirect: 'follow',
    headers: {
      // ask for HTML explicitly
      'Accept': 'text/html,application/xhtml+xml',
    },
  });
  const ct = resp.headers.get('content-type') || '';
  const text = await resp.text();
  return { url: resp.url, status: resp.status, contentType: ct, text };
}

async function main() {
  const summaries = [];

  for (const p of PATHS) {
    const res = await fetchHtml(p);

    // If the server returns JSON here something is very wrong.
    if (!res.contentType.toLowerCase().includes('text/html')) {
      fail(`${p} returned non-HTML content-type: ${res.contentType} (status ${res.status})`);
    }

    // Basic sanity: root container exists exactly once.
    const rootCount = countOccurrences(res.text, 'id="root"');
    if (rootCount !== 1) {
      fail(`${p} root container count expected 1, got ${rootCount}`);
    }

    const moduleSrcs = extractModuleScriptSrcs(res.text);
    if (moduleSrcs.length === 0) {
      fail(`${p} had no <script type="module" src="..."> tags`);
    }

    // Only count app bundle candidates (assets/index-*.js) for version consistency.
    const assetSrcs = moduleSrcs
      .map((s) => {
        try {
          return new URL(s, BASE_URL).toString();
        } catch {
          return s;
        }
      })
      .filter((s) => s.includes('/assets/'));

    const indexAssetSrcs = assetSrcs.filter((s) => /\/assets\/(index|main)-[^/]+\.js/i.test(s));

    // If we have more than one app entrypoint script on the same page, that's a strong indicator of duplication.
    if (indexAssetSrcs.length > 1) {
      fail(`${p} had multiple app bundle module scripts: ${indexAssetSrcs.join(' | ')}`);
    }

    const buildIds = extractBuildIdsFromUrls(assetSrcs);
    const uniqBuildIds = unique(buildIds);
    if (uniqBuildIds.length > 1) {
      fail(`${p} had mixed asset build ids (?v=...): ${uniqBuildIds.join(', ')}`);
    }

    summaries.push({
      path: p,
      finalUrl: res.url,
      status: res.status,
      moduleScripts: moduleSrcs.length,
      assetScripts: assetSrcs.length,
      buildId: uniqBuildIds[0] || null,
    });
  }

  // Cross-page consistency: build id should not vary across pages in the same run.
  const allBuildIds = summaries.map((s) => s.buildId).filter(Boolean);
  const uniq = unique(allBuildIds);
  if (uniq.length > 1) {
    fail(`Build id differed across pages: ${uniq.join(', ')}`);
  }

  console.log('PROD-SMOKE OK');
  for (const s of summaries) {
    console.log(`${s.path} -> ${s.status} scripts=${s.moduleScripts} assets=${s.assetScripts} build=${s.buildId || 'none'}`);
  }
}

main().catch((e) => {
  fail(e?.stack || e?.message || String(e));
});
