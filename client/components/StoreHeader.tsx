import React from "react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function StoreHeader({ settings, searchQuery, setSearchQuery, onCart }) {
  const { theme, toggle } = useTheme();
  return (
    <div
      className="border-b futuristic-neon w-full"
      style={{
        borderColor: 'hsl(var(--border))',
        background: 'linear-gradient(90deg, #2e1065 0%, #7c3aed 50%, #06b6d4 100%)',
        boxShadow: '0 0 24px 0 #4fd1c5, 0 2px 0 0 hsl(var(--border))',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 grid grid-cols-3 items-center">
        <div className="col-span-1 flex items-center gap-3">
          {settings?.store_logo && (
            <img
              src={settings.store_logo}
              alt={settings?.store_name || 'Store logo'}
              className="w-10 h-10 rounded-full object-cover"
              style={{ boxShadow: '0 0 0 1px hsl(var(--border))' }}
            />
          )}
          <div className="text-3xl md:text-4xl font-calligraphic tracking-normal">
            <span className="header-gradient-text" style={{
              background: 'linear-gradient(90deg, #06b6d4 0%, #a78bfa 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Brush Script MT, cursive',
              fontWeight: 700,
              letterSpacing: '0.05em',
              paddingLeft: '2px',
            }}>
              {(settings?.store_name || 'MERCURY').toUpperCase()}
            </span>
          </div>
        </div>
        <div className="col-span-1">
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the future"
              className="pl-10 h-9 text-sm rounded-full dark:bg-[#23272f] dark:text-white dark:border-gray-700"
              style={{
                backgroundColor: 'hsl(var(--input))',
                borderColor: 'hsl(var(--border))',
              }}
            />
          </div>
        </div>
        <div className="col-span-1 flex justify-end items-center gap-2">
          <Button variant="outline" className="h-9 px-3 text-sm dark:bg-[#23272f] dark:text-white dark:border-gray-700" onClick={onCart}
            style={{ borderColor: 'hsl(var(--border))' }}
          >My Cart</Button>
          <Button variant="outline" className="h-9 px-3 text-sm" onClick={toggle} style={{ borderColor: 'hsl(var(--border))' }}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
      </div>
    </div>
  );
}
