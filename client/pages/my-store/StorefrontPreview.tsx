import React from 'react';
import { useStoreSettings } from '@/hooks/useStoreSettings';

export default function StorefrontPreview() {
  const { storeSlug, isFetching } = useStoreSettings({ enabled: true });

  if (isFetching && !storeSlug) return <div className="p-6 text-center">Loading storefront preview...</div>;
  if (!storeSlug) return <div className="p-6 text-center text-muted-foreground">No storefront configured for this account.</div>;

  const src = `/store/${encodeURIComponent(storeSlug)}`;
  return (
    <div className="w-full">
      <div className="mb-2 text-sm text-muted-foreground">Previewing storefront: <strong>{storeSlug}</strong></div>
      <div className="w-full" style={{ minHeight: 600 }}>
        <iframe src={src} title="storefront-preview" className="w-full h-[70vh] border rounded" />
      </div>
    </div>
  );
}
