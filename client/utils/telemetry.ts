type ClientErrorPayload = {
  message: string;
  name?: string;
  stack?: string;
  componentStack?: string;
  url?: string;
  route?: string;
  build?: string;
};

function safeStr(value: any, maxLen: number): string {
  const s = String(value ?? '');
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function shouldIgnore(message: string): boolean {
  const m = message.toLowerCase();
  // common noisy/non-actionable browser errors
  if (m.includes('resizeobserver loop limit exceeded')) return true;
  if (m.includes('non-error promise rejection captured')) return true;
  return false;
}

export function reportClientError(raw: ClientErrorPayload): void {
  try {
    const message = safeStr(raw.message, 2000);
    if (!message || shouldIgnore(message)) return;

    const payload: ClientErrorPayload = {
      message,
      name: raw.name ? safeStr(raw.name, 200) : undefined,
      stack: raw.stack ? safeStr(raw.stack, 12000) : undefined,
      componentStack: raw.componentStack ? safeStr(raw.componentStack, 8000) : undefined,
      url: safeStr(raw.url || window.location.href, 2000),
      route: safeStr(raw.route || window.location.pathname, 500),
      build: raw.build ? safeStr(raw.build, 80) : undefined,
    };

    const body = JSON.stringify(payload);

    // Prefer sendBeacon so it works during unload/crash.
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/telemetry/client-error', blob);
      return;
    }

    void fetch('/api/telemetry/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      credentials: 'include',
      keepalive: true,
    }).catch(() => null);
  } catch {
    // ignore
  }
}
