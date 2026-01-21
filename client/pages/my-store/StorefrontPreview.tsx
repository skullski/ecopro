import React, { useEffect, useState } from 'react';

export default function StorefrontPreview() {
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch('/api/client/store/settings');
        if (cancelled) return;
        if (!res.ok) return setLoading(false);
        const data = await res.json().catch(() => ({} as any));
        const s = data?.store_slug || null;
        setSlug(s);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="p-6 text-center">Loading storefront preview...</div>;
  if (!slug) return <div className="p-6 text-center text-muted-foreground">No storefront configured for this account.</div>;

  const src = `/store/${encodeURIComponent(slug)}`;
  return (
    <div className="w-full">
      <div className="mb-2 text-sm text-muted-foreground">Previewing storefront: <strong>{slug}</strong></div>
      <div className="w-full" style={{ minHeight: 600 }}>
        <iframe src={src} title="storefront-preview" className="w-full h-[70vh] border rounded" />
      </div>
    </div>
  );
}
