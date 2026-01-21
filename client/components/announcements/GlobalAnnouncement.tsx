import { useEffect, useMemo, useRef, useState } from 'react';
import { getCurrentUser, syncAuthState } from '@/lib/auth';
import { Button } from '@/components/ui/button';

type Announcement = {
  id: number;
  title: string;
  body: string;
  variant: 'blue' | 'red' | string;
  min_view_ms: number;
  allow_dismiss: boolean;
  allow_never_show_again: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function isAdminOrAdminPath(): boolean {
  if (typeof window === 'undefined') return false;
  const userStr = localStorage.getItem('user');
  let user: any = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    user = null;
  }

  const isAdmin = user?.role === 'admin' || localStorage.getItem('isAdmin') === 'true';
  const isStaff = localStorage.getItem('isStaff') === 'true';

  // Only show announcements for platform admins/staff or when on admin pages
  const path = window.location?.pathname || '';
  const onAdminPath = path.startsWith('/platform-admin') || path.startsWith('/kernel') || path.startsWith('/client');

  return Boolean(isAdmin || isStaff || onAdminPath);
}

export default function GlobalAnnouncement() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canDismiss, setCanDismiss] = useState(true);
  const [remainingMs, setRemainingMs] = useState(0);
  const [neverLoading, setNeverLoading] = useState(false);

  const hideKey = useMemo(() => {
    return announcement ? `hide_announcement_${announcement.id}` : null;
  }, [announcement?.id]);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (cancelled) return;
      // Only load/sync auth state when in admin/staff contexts or admin pages.
      if (!isAdminOrAdminPath()) return;

      // Ensure localStorage has a current user (populate from cookie if needed)
      if (!getCurrentUser()) {
        try {
          const ok = await syncAuthState();
          if (!ok) return;
        } catch (err) {
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/announcements/active', { credentials: 'include' });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || 'Failed to load announcement');
        if (cancelled) return;
        const a = (data?.announcement || null) as Announcement | null;
        if (!a) {
          setAnnouncement(null);
          return;
        }
        if (hideKey && sessionStorage.getItem(hideKey) === '1') {
          setAnnouncement(null);
          return;
        }
        setAnnouncement(a);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load announcement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // intentionally run on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!announcement) return;

    const isRed = announcement.variant === 'red';
    const min = Math.max(0, Number(announcement.min_view_ms || 0));

    if (!isRed || min === 0) {
      setCanDismiss(true);
      setRemainingMs(0);
      return;
    }

    setCanDismiss(false);
    setRemainingMs(min);

    const startedAt = Date.now();
    if (timerRef.current) window.clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const left = Math.max(0, min - elapsed);
      setRemainingMs(left);
      if (left <= 0) {
        setCanDismiss(true);
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 100);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [announcement]);

  async function hideForSession() {
    if (!announcement || !hideKey) return;
    sessionStorage.setItem(hideKey, '1');
    setAnnouncement(null);
  }

  async function neverShowAgain() {
    if (!announcement) return;
    setNeverLoading(true);
    try {
      const csrf = getCookie('ecopro_csrf');
      const res = await fetch(`/api/announcements/${announcement.id}/never-show-again`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
        },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setAnnouncement(null);
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally {
      setNeverLoading(false);
    }
  }

  // Only render announcement UI in admin/staff contexts or on admin pages.
  if (!isAdminOrAdminPath()) return null;
  if (loading) return null;
  if (!announcement) return null;

  const isRed = announcement.variant === 'red';
  const shell = isRed
    ? 'border-red-500/30 bg-gradient-to-br from-red-950/60 via-slate-950/70 to-red-900/40'
    : 'border-blue-500/30 bg-gradient-to-br from-blue-950/60 via-slate-950/70 to-indigo-900/40';

  const titleColor = isRed ? 'text-red-50' : 'text-blue-50';
  const bodyColor = isRed ? 'text-red-100/80' : 'text-blue-100/80';

  return (
    <div className="fixed inset-x-0 top-0 z-[60] pointer-events-none">
      <div className="mx-auto max-w-3xl px-3 pt-3">
        <div className={`pointer-events-auto rounded-2xl border shadow-2xl backdrop-blur-md ${shell}`}>
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className={`font-bold text-base sm:text-lg ${titleColor}`}>{announcement.title}</div>
                <div className={`mt-1 text-sm leading-relaxed ${bodyColor}`}>{announcement.body}</div>
                {isRed && !canDismiss && (
                  <div className="mt-2 text-xs text-red-200/80">
                    You can close this in {Math.ceil(remainingMs / 1000)}s
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {announcement.allow_never_show_again && !isRed && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={neverLoading}
                    onClick={neverShowAgain}
                    className="bg-blue-500/15 text-blue-50 hover:bg-blue-500/25"
                  >
                    {neverLoading ? 'Saving…' : 'Never show again'}
                  </Button>
                )}

                {announcement.allow_dismiss && (
                  <Button
                    size="sm"
                    disabled={!canDismiss}
                    onClick={hideForSession}
                    className={isRed ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                  >
                    {canDismiss ? 'Hide' : '…'}
                  </Button>
                )}
              </div>
            </div>

            {error && <div className="mt-3 text-xs text-amber-200/90">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
