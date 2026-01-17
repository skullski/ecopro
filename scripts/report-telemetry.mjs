// Reports a CI/smoke failure into the EcoPro telemetry pipeline.
//
// This lets GitHub Actions failures show up in the same persistent logs
// (platform_error_events + logs/platform-errors.ndjson).
//
// Env:
// - TELEMETRY_URL (default: https://www.sahla4eco.com/api/telemetry/client-error)
// - MESSAGE (required)
// - NAME (optional)
// - STACK (optional)
// - URL (optional)
// - ROUTE (optional)
// - BUILD (optional)

const TELEMETRY_URL = process.env.TELEMETRY_URL || 'https://www.sahla4eco.com/api/telemetry/client-error';

function safeStr(v, maxLen) {
  const s = String(v ?? '');
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

async function main() {
  const message = safeStr(process.env.MESSAGE, 2000);
  if (!message) {
    console.error('report-telemetry: MESSAGE env var required');
    process.exit(2);
  }

  const payload = {
    message,
    name: process.env.NAME ? safeStr(process.env.NAME, 200) : 'GitHubActions',
    stack: process.env.STACK ? safeStr(process.env.STACK, 12000) : undefined,
    url: process.env.URL ? safeStr(process.env.URL, 2000) : undefined,
    route: process.env.ROUTE ? safeStr(process.env.ROUTE, 500) : undefined,
    build: process.env.BUILD ? safeStr(process.env.BUILD, 80) : undefined,
  };

  // Best-effort: never fail the workflow because telemetry failed.
  try {
    const resp = await fetch(TELEMETRY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Consume body to avoid undici warnings.
    await resp.text().catch(() => null);

    // Non-2xx is fine; we still exit 0.
    if (!resp.ok) {
      console.error(`report-telemetry: HTTP ${resp.status} posting to ${TELEMETRY_URL}`);
    }
  } catch (e) {
    console.error(`report-telemetry: error posting to ${TELEMETRY_URL}: ${e?.message || e}`);
  }
}

main().catch(() => process.exit(0));
