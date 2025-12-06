import React, { useEffect, useState } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store as StoreIcon, Plus, Settings, ExternalLink, Copy, Check } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#0a0c15]">
      {/* Store Header (original, persistent) */}
      <div className="w-full bg-[#101223] border-b border-[#23264a] px-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            {storeSettings?.store_logo && (
              <img
                src={storeSettings.store_logo}
                alt={storeSettings?.store_name || 'Store logo'}
                className="w-10 h-10 rounded-full object-cover"
                style={{ boxShadow: '0 0 0 1px hsl(var(--border))' }}
              />
            )}
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {storeSettings?.store_name || 'Private Store'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => nav(`/store/${storeSlug}`)}
              disabled={!storeSlug}
            >
              <StoreIcon className="w-4 h-4 mr-2" />
              View Storefront
            </Button>
            <Button
              variant="outline"
              onClick={copyStoreLink}
            >
              {storeLinkCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2">Copy Store Link</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => nav(`/dashboard`)}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
