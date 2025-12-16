import React, { useEffect, useState } from "react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function StoreHeader({ settings, searchQuery, setSearchQuery, onCart }) {
  const { theme, toggle } = useTheme();
  // Support optional external search state. If parent doesn't provide
  // `searchQuery`/`setSearchQuery`, manage a local search value so the
  // header can be used anywhere (e.g., in a layout) without breaking.
  const [localQuery, setLocalQuery] = useState(searchQuery ?? '');
  useEffect(() => {
    if (typeof searchQuery === 'string') setLocalQuery(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);
  const onChange = (value: string) => {
    if (typeof setSearchQuery === 'function') setSearchQuery(value);
    else setLocalQuery(value);
  };
  const getDisplayName = (name?: string) => {
    if (!name || typeof name !== 'string' || name.trim().length === 0) return 'Mercury';
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  // Font preview toggler (cycles through a small set of script fonts)
  const fontOptions = ['font-euphoria', 'font-greatvibes', 'font-alexbrush', 'font-allura', 'font-satisfy'];
  const [fontIdx, setFontIdx] = useState(0);
  const cycleFont = () => setFontIdx((i) => (i + 1) % fontOptions.length);
  return (
    <header
      role="banner"
      className="border-b futuristic-neon w-full"
      style={{
        borderColor: 'hsl(var(--border))',
        background: 'linear-gradient(90deg, #2e1065 0%, #7c3aed 50%, #06b6d4 100%)',
        boxShadow: '0 0 12px 0 rgba(79,209,197,0.5), 0 1px 0 0 hsl(var(--border))',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-1.5 md:py-2 grid grid-cols-3 items-center">
        <div className="col-span-1 flex items-center gap-3">
          {settings?.store_logo && (
            <img
              src={settings.store_logo}
              alt={settings?.store_name || 'Store logo'}
              className="w-10 h-10 rounded-full object-cover"
              style={{ boxShadow: '0 0 0 1px hsl(var(--border))' }}
            />
          )}
          <div className="text-3xl md:text-5xl font-calligraphic tracking-normal">
            <span className={`header-gradient-text font-calligraphic ${fontOptions[fontIdx]}`} style={{
              background: 'linear-gradient(90deg, #06b6d4 0%, #a78bfa 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              paddingLeft: '3px',
            }}>
              {getDisplayName(settings?.store_name)}
            </span>
          </div>
        </div>
        <div className="col-span-1">
          <div className="relative mx-auto max-w-auto">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
            <Input
              value={typeof searchQuery === 'string' ? searchQuery : localQuery}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Search the future"
              className="pl-7 h-6 md:h-7 text-sm rounded-full text-white"
              style={{
                backgroundColor: '#0f1724',
                borderColor: 'transparent',
                boxShadow: 'inset 0 0.5px 3px rgba(0,0,0,0.6), 0 0.5px 6px rgba(124,58,237,0.08)'
              }}
            />
          </div>
        </div>
        <div className="col-span-1 flex justify-end items-center gap-2">
            
          <Button className="h-8 px-5 text-auto rounded-full bg-[#0f1724] text-white shadow-sm" onClick={toggle} style={{ borderColor: 'transparent' }}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
      </div>
    </header>
  );
}
