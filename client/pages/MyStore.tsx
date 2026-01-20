import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeNameToSlug } from '@/utils/storeUrl';
import { useState } from 'react';

export default function MyStore() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch('/api/client/store/settings');
        if (cancelled) return;
        if (res.status === 401 || res.status === 403) {
          navigate('/login');
          return;
        }
        if (!res.ok) {
          setError('Failed to load store settings.');
          setLoading(false);
          return;
        }
        const data = await res.json().catch(() => ({} as any));
        const preferred = data?.store_name ? storeNameToSlug(String(data.store_name)) : null;
        const fallback = data?.store_slug ? String(data.store_slug) : null;
        const slug = preferred || fallback;
        setStoreSlug(slug);
        setLoading(false);
      } catch (error) {
        setError('Failed to load store settings.');
        setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Store</h1>
      {/* Main UI always visible */}
      <div className="w-full max-w-xl bg-background rounded-xl shadow p-6 mb-6">
        {loading && (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading store data...<br />If this takes too long, your database may be slow or offline.</p>
          </div>
        )}
        {error && (
          <div className="text-red-500 font-semibold text-center">{error}</div>
        )}
        {!loading && !error && storeSlug && (
          <div className="text-center">
            <p className="text-lg">Store loaded: <span className="font-bold">{storeSlug}</span></p>
            <button
              className="mt-4 px-4 py-2 rounded bg-primary text-white font-bold"
              onClick={() => navigate(`/store/${storeSlug}`)}
            >
              Go to Storefront
            </button>
          </div>
        )}
        {!loading && !error && !storeSlug && (
          <div className="text-center text-muted-foreground">No store found for your account.</div>
        )}
      </div>
      {/* You can add more static UI here if needed */}
    </div>
  );
}
