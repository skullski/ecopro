import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { reportClientError } from "./utils/telemetry";

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const raw = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${encodeURIComponent(name)}=`));
  if (!raw) return null;
  const value = raw.slice(raw.indexOf('=') + 1);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Global fetch hardening for cookie-based auth
// - Always send credentials (cookies)
// - Add X-CSRF-Token for unsafe methods
// - Remove useless Authorization: Bearer null/undefined
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const nextInit: RequestInit = { ...(init || {}) };

    const rawUrl =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;
    const resolvedUrl = new URL(rawUrl, window.location.origin);
    const isSameOrigin = resolvedUrl.origin === window.location.origin;
    const isApi = isSameOrigin && resolvedUrl.pathname.startsWith('/api/');

    // Cookie-based auth requires credentials for same-origin requests.
    // Avoid forcing credentials for third-party URLs.
    if (isSameOrigin) nextInit.credentials = 'include';

    const headers = new Headers(nextInit.headers || undefined);
    const method = (nextInit.method || 'GET').toUpperCase();

    const csrf = getCookie('ecopro_csrf');
    if (csrf && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      if (!headers.has('X-CSRF-Token')) headers.set('X-CSRF-Token', csrf);
    }

    const auth = headers.get('Authorization') || headers.get('authorization');
    if (auth) {
      // Always prefer HttpOnly cookies for our own API requests.
      if (isApi && /^Bearer\s+/i.test(auth)) {
        headers.delete('Authorization');
        headers.delete('authorization');
      } else if (/^Bearer\s+(null|undefined)?\s*$/i.test(auth.trim())) {
        headers.delete('Authorization');
        headers.delete('authorization');
      }
    }

    nextInit.headers = headers;
    return originalFetch(input, nextInit);
  };
}

const container = document.getElementById("root");
if (container) {
  // Global error telemetry (production only)
  if (import.meta.env.PROD) {
    window.addEventListener('error', (event) => {
      try {
        const err = (event as any).error as any;
        reportClientError({
          message: err?.message || (event as any).message || 'Unhandled error',
          name: err?.name,
          stack: err?.stack,
        });
      } catch {
        // ignore
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      try {
        const reason: any = (event as any).reason;
        reportClientError({
          message: reason?.message || String(reason || 'Unhandled promise rejection'),
          name: reason?.name,
          stack: reason?.stack,
        });
      } catch {
        // ignore
      }
    });
  }

  createRoot(container).render(<App />);
}
