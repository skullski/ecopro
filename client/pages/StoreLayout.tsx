import React, { useEffect, useState } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store as StoreIcon, Plus, Settings, ExternalLink, Copy, Check } from 'lucide-react';
import { StoreHeader } from '@/components/StoreHeader';

export default function StoreLayout() {
  const { storeSlug } = useParams();
  const nav = useNavigate();
  const [storeSettings, setStoreSettings] = useState<any>({});
  const [storeLinkCopied, setStoreLinkCopied] = useState(false);

  useEffect(() => {
    if (storeSlug) {
      fetch(`/api/storefront/${storeSlug}/settings`).then(async (res) => {
        if (res.ok) setStoreSettings(await res.json());
      });
    }
  }, [storeSlug]);

  const copyStoreLink = () => {
    const storeUrl = `${window.location.origin}/store/${storeSlug}`;
    navigator.clipboard.writeText(storeUrl);
    setStoreLinkCopied(true);
    setTimeout(() => setStoreLinkCopied(false), 2000);
  };

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#0a0c15]">
      <StoreHeader
        settings={storeSettings}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCart={() => nav('/cart')}
      />
      <Outlet />
    </div>
  );
}
