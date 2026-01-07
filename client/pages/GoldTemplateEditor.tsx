import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Eye, Settings } from 'lucide-react';
import { RenderStorefront, normalizeTemplateId } from './storefront/templates';
import baseShiroHanaHome from './storefront/templates/gold/shiro-hana-home.json';
import baseBabyosHome from './storefront/templates/gold/babyos-home.json';
import { uploadImage } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

type StoreSettings = {
  [key: string]: any;
  store_slug?: string;
  store_name?: string;
  store_description?: string;
  store_logo?: string;
  banner_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  currency_code?: string;
  template?: string;
  template_hero_heading?: string | null;
  template_hero_subtitle?: string | null;
  template_button_text?: string | null;
  template_accent_color?: string | null;
};

type StoreProduct = {
  id: number;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  category?: string;
  stock_quantity: number;
  is_featured: boolean;
  slug: string;
  views: number;
};

export default function GoldTemplateEditor() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const previewRootRef = React.useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<StoreSettings>({});
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'settings'>('preview');

  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [selectedEditPath, setSelectedEditPath] = useState<string | null>(null);

  // Load store data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings and products in PARALLEL for faster loading
        const [settingsRes, productsRes] = await Promise.all([
          fetch('/api/client/store/settings', { credentials: 'include' }),
          fetch('/api/client/store/products', { credentials: 'include' }),
        ]);
        
        // Handle settings
        if (!settingsRes.ok) {
          if (settingsRes.status === 401) {
            navigate('/login');
            return;
          }
          const detail = await settingsRes.json().catch(() => null);
          const msg = (detail && (detail.error || detail.message)) ? String(detail.error || detail.message) : `HTTP ${settingsRes.status}`;
          throw new Error(`Failed to load settings (${msg})`);
        }
        const settingsData = await settingsRes.json();
        setSettings(settingsData || {});

        // Handle products
        if (!productsRes.ok) {
          const detail = await productsRes.json().catch(() => null);
          const msg = (detail && (detail.error || detail.message)) ? String(detail.error || detail.message) : `HTTP ${productsRes.status}`;
          throw new Error(`Failed to load products (${msg})`);
        }
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load store data';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/client/store/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error((data && (data.error || data.message)) ? String(data.error || data.message) : t('editor.saveFailed'));
      }

      // Update local settings with response from server to ensure consistency
      const savedData = await res.json();
      setSettings(savedData);
      
      setSuccess(t('editor.saved'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (key: string, file: File) => {
    try {
      const result = await uploadImage(file);
      handleSettingChange(key, result.url);
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  const handlePreviewClickCapture = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const root = previewRootRef.current;
    const el = target.closest('[data-edit-path]') as HTMLElement | null;
    if (!el) return;
    if (root && !root.contains(el)) return;

    const path = el.getAttribute('data-edit-path');
    if (!path) return;

    e.preventDefault();
    e.stopPropagation();
    setSelectedEditPath(path);
  }, []);

  useEffect(() => {
    const root = previewRootRef.current;
    if (!root) return;

    const prev = root.querySelector('[data-edit-selected="true"]') as HTMLElement | null;
    if (prev) prev.removeAttribute('data-edit-selected');

    if (!selectedEditPath) return;

    const escapeCss = (value: string) => {
      const cssAny = (globalThis as any).CSS;
      if (cssAny && typeof cssAny.escape === 'function') return cssAny.escape(value);
      return value.replace(/[^a-zA-Z0-9_\-]/g, (m) => `\\${m}`);
    };

    const selected = root.querySelector(`[data-edit-path="${escapeCss(selectedEditPath)}"]`) as HTMLElement | null;
    if (selected) {
      selected.setAttribute('data-edit-selected', 'true');
      try {
        selected.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } catch {
        // ignore
      }
    }
  }, [selectedEditPath]);

  useEffect(() => {
    const root = previewRootRef.current;
    if (!root) return;

    const handleImageError = (e: Event) => {
      const img = e.target as HTMLImageElement | null;
      if (!img) return;
      if (img.src === '/placeholder.png') return; // Already fallback, don't loop
      // Silently replace broken image with placeholder without logging
      img.src = '/placeholder.png';
    };

    const handleVideoError = (e: Event) => {
      const video = e.target as HTMLVideoElement | null;
      if (!video) return;
      // Hide broken video elements
      video.style.display = 'none';
    };

    // Add error handlers to all current images
    const images = root.querySelectorAll('img');
    images.forEach((img) => img.addEventListener('error', handleImageError));

    const videos = root.querySelectorAll('video');
    videos.forEach((video) => video.addEventListener('error', handleVideoError));

    return () => {
      images.forEach((img) => img.removeEventListener('error', handleImageError));
      videos.forEach((video) => video.removeEventListener('error', handleVideoError));
    };
  }, [selectedEditPath, settings, products]);

  const formatPrice = useCallback(
    (price: number) => {
      const currency = settings.currency_code || 'DZD';
      return `${price.toLocaleString()} ${currency}`;
    },
    [settings.currency_code]
  );

  // Template preview props
  const templateProps = useMemo(
    () => ({
      storeSlug: settings.store_slug || 'preview',
      settings: {
        ...settings,
        template: String(settings.template || 'shiro-hana'),
        // New unified editor keys
        template_page_shiro_hana_home: baseShiroHanaHome,
        template_page_babyos_home: baseBabyosHome,
        // Legacy keys (older data/templates)
        gold_page_shiro_hana_home: baseShiroHanaHome,
        gold_page_babyos_home: baseBabyosHome,
      },
      products,
      filtered: products,
      categories: [...new Set(products.map((p) => p.category).filter(Boolean))] as string[],
      searchQuery: '',
      setSearchQuery: () => {},
      categoryFilter: '',
      setCategoryFilter: () => {},
      sortOption: 'featured' as const,
      setSortOption: () => {},
      viewMode: 'grid' as const,
      setViewMode: () => {},
      formatPrice,
      primaryColor: settings.template_accent_color || settings.primary_color || '#1E90FF',
      secondaryColor: settings.secondary_color || '#6B7280',
      bannerUrl: settings.banner_url || null,
      navigate: (to: string | number) => { if (typeof to === 'string') navigate(to); },
      canManage: true,
      forcedBreakpoint: previewDevice,
    }),
    [settings, products, formatPrice, navigate, previewDevice]
  );

  const selectedTemplateId = useMemo(() => normalizeTemplateId(String(settings.template || 'shiro-hana')), [settings.template]);

  const deviceFrame = useMemo(() => {
    if (previewDevice === 'mobile') {
      // Samsung Galaxy S24 Ultra scaled to 80%: 330x732
      return { width: '330px', maxWidth: '330px', height: '732px', aspectRatio: '330/732' } as const;
    }
    if (previewDevice === 'tablet') {
      // iPad Pro 11" scaled to 65%: 542x776
      return { width: '542px', maxWidth: '542px', height: '776px', aspectRatio: '542/776' } as const;
    }
    // Desktop: full width, auto height
    return { width: '100%', maxWidth: '100%', height: '700px', aspectRatio: 'auto' } as const;
  }, [previewDevice]);

  const editPanel = useMemo(() => {
    const path = selectedEditPath;
    if (!path) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{t('editor.edit')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {t('editor.clickToEdit')}
            </div>
          </CardContent>
        </Card>
      );
    }

    const bindText = (label: string, key: keyof StoreSettings, placeholder?: string) => (
      <div className="space-y-2">
        <div className="text-sm font-medium">{label}</div>
        <Input
          value={String((settings as any)[key] || '')}
          onChange={(e) => handleSettingChange(String(key), e.target.value)}
          placeholder={placeholder}
        />
      </div>
    );

    const bindImage = (label: string, key: keyof StoreSettings) => (
      <div className="space-y-2">
        <div className="text-sm font-medium">{label}</div>
        <div className="flex items-center gap-3">
          {(settings as any)[key] ? (
            <img src={String((settings as any)[key])} alt={label} className="h-14 w-auto rounded" />
          ) : null}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImageUpload(String(key), file);
            }}
          />
        </div>
      </div>
    );

    const bindColor = (label: string, key: keyof StoreSettings, fallback: string) => (
      <div className="space-y-2">
        <div className="text-sm font-medium">{label}</div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={String((settings as any)[key] || fallback)}
            onChange={(e) => handleSettingChange(String(key), e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <Input
            value={String((settings as any)[key] || fallback)}
            onChange={(e) => handleSettingChange(String(key), e.target.value)}
          />
        </div>
      </div>
    );

    const bindSelect = (label: string, key: string, options: { value: string; label: string }[], fallback: string) => (
      <div className="space-y-2">
        <div className="text-sm font-medium">{label}</div>
        <select
          value={String((settings as any)[key] || fallback)}
          onChange={(e) => handleSettingChange(key, e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );

    const bindRange = (label: string, key: string, min: number, max: number, fallback: number, unit?: string) => (
      <div className="space-y-2">
        <div className="text-sm font-medium">{label}: {(settings as any)[key] || fallback}{unit || ''}</div>
        <input
          type="range"
          min={min}
          max={max}
          value={Number((settings as any)[key]) || fallback}
          onChange={(e) => handleSettingChange(key, e.target.value)}
          className="w-full"
        />
      </div>
    );

    const bindTextarea = (label: string, key: string, placeholder?: string, rows?: number) => (
      <div className="space-y-2">
        <div className="text-sm font-medium">{label}</div>
        <textarea
          value={String((settings as any)[key] || '')}
          onChange={(e) => handleSettingChange(key, e.target.value)}
          placeholder={placeholder}
          rows={rows || 4}
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground font-mono text-xs"
        />
      </div>
    );

    const bindJsonArray = (label: string, key: string, placeholder?: string) => (
      <div className="space-y-2">
        <div className="text-sm font-medium">{label}</div>
        <textarea
          value={String((settings as any)[key] || '')}
          onChange={(e) => handleSettingChange(key, e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground font-mono text-xs"
        />
        <div className="text-xs text-muted-foreground">{t('editor.jsonRequired')}</div>
      </div>
    );

    let body: React.ReactNode = (
      <div className="text-sm text-muted-foreground">
        {t('editor.notEditable')}
      </div>
    );

    if (path === '__settings.store_name') {
      body = bindText('Store Name', 'store_name', 'Your Store Name');
    } else if (path.startsWith('layout.header.logo') || path === 'layout.header') {
      body = (
        <div className="space-y-4">
          {bindImage('Store Logo', 'store_logo')}
          {bindText('Store Name', 'store_name', 'Your Store Name')}
          {bindColor('Header Background', 'template_header_bg' as any, '#FDF8F3')}
          {bindColor('Header Text Color', 'template_header_text' as any, '#F97316')}
        </div>
      );
    } else if (path.startsWith('layout.hero.title')) {
      body = (
        <div className="space-y-4">
          {bindText('Hero Heading', 'template_hero_heading', 'Main headline for your store')}
          {bindColor('Heading Color', 'template_hero_title_color' as any, '#1C1917')}
          {bindText('Heading Size (px)', 'template_hero_title_size' as any, '32')}
        </div>
      );
    } else if (path.startsWith('layout.hero.subtitle')) {
      body = (
        <div className="space-y-4">
          {bindText('Hero Subtitle', 'template_hero_subtitle', 'Subtitle or tagline')}
          {bindColor('Subtitle Color', 'template_hero_subtitle_color' as any, '#78716C')}
          {bindText('Subtitle Size (px)', 'template_hero_subtitle_size' as any, '13')}
        </div>
      );
    } else if (path.startsWith('layout.hero.kicker')) {
      body = (
        <div className="space-y-4">
          {bindText('Kicker Text', 'template_hero_kicker' as any, 'NEW SEASON • SOFT & PLAYFUL')}
          {bindColor('Kicker Color', 'template_hero_kicker_color' as any, '#78716C')}
        </div>
      );
    } else if (path.startsWith('layout.hero.cta')) {
      body = (
        <div className="space-y-4">
          {bindText('Primary Button Text', 'template_button_text', 'Shop Now')}
          {bindText('Secondary Button Text', 'template_button2_text' as any, 'View All')}
          {bindColor('Primary Button Color', 'template_accent_color', '#F97316')}
          {bindColor('Secondary Button Border', 'template_button2_border' as any, '#D6D3D1')}
        </div>
      );
    } else if (path.startsWith('layout.hero.image')) {
      body = (
        <div className="space-y-4">
          {bindImage('Hero Image (Banner)', 'banner_url')}
          {bindText('Hero Video URL (optional)', 'hero_video_url' as any, 'https://...')}
        </div>
      );
    } else if (path.startsWith('layout.hero.badge')) {
      body = (
        <div className="space-y-4">
          {bindText('Badge Title', 'template_hero_badge_title' as any, 'Soft Plush Elephant')}
          {bindText('Badge Subtitle', 'template_hero_badge_subtitle' as any, 'Limited offer')}
          {bindColor('Badge Accent', 'template_accent_color', '#F97316')}
        </div>
      );
    } else if (path === 'layout.hero') {
      body = (
        <div className="space-y-4">
          {bindImage('Hero Image', 'banner_url')}
          {bindText('Hero Heading', 'template_hero_heading', 'Main headline')}
          {bindText('Hero Subtitle', 'template_hero_subtitle', 'Subtitle')}
          {bindColor('Background Color', 'template_bg_color' as any, '#FDF8F3')}
          {bindColor('Accent Color', 'template_accent_color', '#F97316')}
        </div>
      );
    } else if (path.startsWith('layout.featured.title')) {
      body = (
        <div className="space-y-4">
          {bindText('Section Title', 'template_featured_title' as any, 'Soft & snugly picks')}
          {bindColor('Title Color', 'template_section_title_color' as any, '#1C1917')}
          {bindText('Title Size (px)', 'template_section_title_size' as any, '20')}
        </div>
      );
    } else if (path.startsWith('layout.featured.subtitle')) {
      body = (
        <div className="space-y-4">
          {bindText('Section Subtitle', 'template_featured_subtitle' as any, 'A small edit of plush toys...')}
          {bindColor('Subtitle Color', 'template_section_subtitle_color' as any, '#78716C')}
        </div>
      );
    } else if (path.startsWith('layout.featured.items')) {
      body = (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Product details are managed in your product list.
          </div>
          {bindColor('Product Card Background', 'template_card_bg' as any, '#FFFFFF')}
          {bindColor('Product Tag Color', 'template_accent_color', '#F97316')}
          {bindColor('Product Title Color', 'template_product_title_color' as any, '#1C1917')}
          {bindColor('Product Price Color', 'template_product_price_color' as any, '#1C1917')}
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/store')}>Edit Products</Button>
        </div>
      );
    } else if (path.startsWith('layout.featured.addLabel')) {
      body = (
        <div className="space-y-4">
          {bindText('Add Button Label', 'template_add_to_cart_label' as any, 'Add')}
          <div className="text-xs text-muted-foreground">
            This label is used on product cards (e.g., Add/View).
          </div>
        </div>
      );
    } else if (path.startsWith('layout.featured')) {
      body = (
        <div className="space-y-4">
          {bindText('Section Title', 'template_featured_title' as any, 'Soft & snugly picks')}
          {bindText('Section Subtitle', 'template_featured_subtitle' as any, 'Description text...')}
          {bindColor('Section Background', 'template_bg_color' as any, '#FDF8F3')}
          <div className="text-sm text-muted-foreground">
            Products are generated from your product list.
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/store')}>Go to Products</Button>
        </div>
      );
    } else if (path.startsWith('layout.footer.copyright')) {
      body = (
        <div className="space-y-4">
          {bindText('Copyright Text', 'template_copyright' as any, '© 2026 Your Store')}
          {bindColor('Footer Text Color', 'template_footer_text' as any, '#A8A29E')}
        </div>
      );
    } else if (path.startsWith('layout.footer.social')) {
      body = (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Add social media links in JSON format.
          </div>
          {bindJsonArray('Social Links', 'template_social_links', '[{"platform":"facebook","url":"https://facebook.com/..."},{"platform":"instagram","url":"https://instagram.com/..."}]')}
          <div className="text-xs text-muted-foreground">
            Supported: facebook, twitter, instagram, youtube, linkedin, tiktok, pinterest
          </div>
        </div>
      );
    } else if (path.startsWith('layout.footer.links')) {
      body = (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Footer links can be customized in Advanced settings.
          </div>
          {bindColor('Link Color', 'template_footer_link_color' as any, '#78716C')}
        </div>
      );
    } else if (path.startsWith('layout.header.nav')) {
      body = (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Add navigation links in JSON format.
          </div>
          {bindJsonArray('Navigation Links', 'template_nav_links', '[{"label":"Shop","url":"/products"},{"label":"About","url":"/about"},{"label":"Contact","url":"/contact"}]')}
        </div>
      );
    } else if (path === 'layout.categories') {
      body = (
        <div className="space-y-4">
          <div className="font-medium text-sm">Category Pills Styling</div>
          {bindColor('Pill Background', 'template_category_pill_bg' as any, '#F5F5F4')}
          {bindColor('Pill Text Color', 'template_category_pill_text' as any, '#78716C')}
          {bindColor('Active Pill Background', 'template_category_pill_active_bg' as any, '#F97316')}
          {bindColor('Active Pill Text', 'template_category_pill_active_text' as any, '#FFFFFF')}
          {bindRange('Pill Border Radius', 'template_category_pill_border_radius', 0, 50, 9999, 'px')}
        </div>
      );
    } else if (path === 'layout.grid' || path.startsWith('layout.grid.')) {
      body = (
        <div className="space-y-4">
          <div className="font-medium text-sm">Product Grid Settings</div>
          {bindText('Grid Section Title', 'template_grid_title' as any, 'Our Products')}
          {bindSelect('Grid Columns (Desktop)', 'template_grid_columns', [
            { value: '2', label: '2 Columns' },
            { value: '3', label: '3 Columns' },
            { value: '4', label: '4 Columns' },
            { value: '5', label: '5 Columns' },
            { value: '6', label: '6 Columns' },
          ], '4')}
          {bindRange('Grid Gap', 'template_grid_gap', 8, 48, 24, 'px')}
          {bindRange('Card Border Radius', 'template_card_border_radius', 0, 32, 12, 'px')}
          {bindColor('Card Background', 'template_card_bg' as any, '#FFFFFF')}
        </div>
      );
    } else if (path === 'layout.footer') {
      body = (
        <div className="space-y-4">
          {bindText('Copyright Text', 'template_copyright' as any, '© 2026 Your Store')}
          {bindColor('Footer Background', 'template_footer_bg' as any, '#FDF8F3')}
          {bindColor('Footer Text Color', 'template_footer_text' as any, '#A8A29E')}
          {bindColor('Footer Link Color', 'template_footer_link_color' as any, '#78716C')}
          {bindJsonArray('Social Links', 'template_social_links', '[{"platform":"instagram","url":"https://instagram.com/..."}]')}
        </div>
      );
    } else if (path === '__root' || path === '__settings') {
      body = (
        <div className="space-y-4">
          <div className="font-medium text-sm">Global Typography</div>
          {bindSelect('Font Family', 'template_font_family', [
            { value: 'system-ui, -apple-system, sans-serif', label: 'System (Default)' },
            { value: 'Inter, sans-serif', label: 'Inter' },
            { value: 'Poppins, sans-serif', label: 'Poppins' },
            { value: 'Roboto, sans-serif', label: 'Roboto' },
            { value: 'Open Sans, sans-serif', label: 'Open Sans' },
            { value: 'Lato, sans-serif', label: 'Lato' },
            { value: 'Montserrat, sans-serif', label: 'Montserrat' },
            { value: 'Playfair Display, serif', label: 'Playfair Display' },
            { value: 'Merriweather, serif', label: 'Merriweather' },
            { value: 'Georgia, serif', label: 'Georgia' },
          ], 'system-ui, -apple-system, sans-serif')}
          {bindSelect('Body Font Weight', 'template_font_weight', [
            { value: '300', label: 'Light (300)' },
            { value: '400', label: 'Normal (400)' },
            { value: '500', label: 'Medium (500)' },
          ], '400')}
          {bindSelect('Heading Font Weight', 'template_heading_font_weight', [
            { value: '500', label: 'Medium (500)' },
            { value: '600', label: 'Semi-bold (600)' },
            { value: '700', label: 'Bold (700)' },
            { value: '800', label: 'Extra-bold (800)' },
          ], '600')}

          <div className="font-medium text-sm pt-4">Border Radius</div>
          {bindRange('Global Border Radius', 'template_border_radius', 0, 24, 8, 'px')}
          {bindRange('Card Border Radius', 'template_card_border_radius', 0, 32, 12, 'px')}
          {bindRange('Button Border Radius', 'template_button_border_radius', 0, 50, 9999, 'px')}

          <div className="font-medium text-sm pt-4">Spacing</div>
          {bindRange('Base Spacing', 'template_spacing', 8, 32, 16, 'px')}
          {bindRange('Section Spacing', 'template_section_spacing', 24, 96, 48, 'px')}

          <div className="font-medium text-sm pt-4">Animations</div>
          {bindRange('Animation Speed', 'template_animation_speed', 100, 500, 200, 'ms')}
          {bindSelect('Hover Scale', 'template_hover_scale', [
            { value: '1', label: 'None' },
            { value: '1.02', label: 'Subtle (1.02)' },
            { value: '1.05', label: 'Medium (1.05)' },
            { value: '1.1', label: 'Strong (1.1)' },
          ], '1.02')}

          <div className="font-medium text-sm pt-4">Custom CSS</div>
          {bindTextarea('Custom CSS', 'template_custom_css', '/* Add your custom CSS here */\n.my-class {\n  color: red;\n}', 6)}
        </div>
      );
    } else if (path.startsWith('layout.footer') || path.startsWith('layout.header')) {
      body = (
        <div className="space-y-4">
          {bindColor('Background Color', 'template_bg_color' as any, '#FDF8F3')}
          {bindColor('Accent Color', 'template_accent_color', '#F97316')}
          {bindColor('Text Color', 'template_text_color' as any, '#1C1917')}
          {bindColor('Muted Text Color', 'template_muted_color' as any, '#78716C')}
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.edit')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-xs text-muted-foreground">{t('editor.selected')}: {path}</div>
          {body}
        </CardContent>
      </Card>
    );
  }, [selectedEditPath, settings, navigate, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('editor.back')}
            </Button>
            <h1 className="text-lg font-semibold">{t('editor.title')}</h1>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={String(settings.template || 'shiro-hana')}
              onChange={(e) => handleSettingChange('template', e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
              aria-label="Select template"
            >
              <option value="shiro-hana">Shiro Hana</option>
              <option value="babyos">Babyos</option>
              <option value="bags">Bags Editorial</option>
              <option value="jewelry">JewelryOS</option>
              <option value="fashion">Fashion</option>
              <option value="electronics">Electronics</option>
              <option value="beauty">Beauty</option>
              <option value="food">Food & Restaurant</option>
              <option value="cafe">Cafe & Bakery</option>
              <option value="furniture">Furniture</option>
              <option value="perfume">Perfume</option>
            </select>
            <Button
              variant={activeTab === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('preview')}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('editor.preview')}
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              {t('editor.settings')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? t('editor.saving') : t('editor.save')}
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="m-4 border-green-500 text-green-700">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'preview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-4 items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  {t('editor.mobile')}
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('tablet')}
                >
                  {t('editor.tablet')}
                </Button>
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                >
                  {t('editor.desktop')}
                </Button>
              </div>

              {/* Device Frame Container */}
              <div
                style={{
                  marginLeft: '0',
                  marginRight: 'auto',
                  ...(previewDevice === 'mobile' ? {
                    // Samsung Galaxy S24 Ultra frame styling
                    background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0d0d0d 100%)',
                    borderRadius: '28px',
                    padding: '6px',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px #333',
                    width: '342px',
                  } : previewDevice === 'tablet' ? {
                    // iPad frame styling (65% scale)
                    background: '#2d2d2d',
                    borderRadius: '16px',
                    padding: '12px 10px',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.35), inset 0 0 0 2px #444',
                    width: '562px',
                  } : {
                    // Desktop: simple border, no device frame
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    width: '100%',
                  }),
                }}
              >
                {/* Samsung Galaxy punch-hole camera (rendered inside screen) */}

                {/* Front Camera for iPad */}
                {previewDevice === 'tablet' && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      background: '#1a1a1a',
                      borderRadius: '50%',
                      boxShadow: 'inset 0 0 2px rgba(255,255,255,0.2)',
                    }} />
                  </div>
                )}

                {/* Screen */}
                <div
                  className="overflow-hidden bg-white flex flex-col"
                  style={{
                    maxWidth: deviceFrame.maxWidth as any,
                    width: deviceFrame.width as any,
                    height: deviceFrame.height as any,
                    aspectRatio: deviceFrame.aspectRatio as any,
                    borderRadius: previewDevice === 'mobile' ? '22px' : previewDevice === 'tablet' ? '8px' : '4px',
                    position: 'relative',
                  }}
                >
                  <style>{`[data-edit-selected="true"]{outline:2px solid hsl(var(--primary)); outline-offset:2px;}`}</style>
                  <div ref={previewRootRef} onClickCapture={handlePreviewClickCapture} className="flex-1 overflow-y-auto">
                    {RenderStorefront(selectedTemplateId, templateProps as any)}
                  </div>
                </div>

                {/* Punch-hole camera overlay for Galaxy */}
                {previewDevice === 'mobile' && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '12px',
                    height: '12px',
                    background: '#000',
                    borderRadius: '50%',
                    boxShadow: 'inset 0 0 3px rgba(255,255,255,0.15)',
                    zIndex: 10,
                  }} />
                )}
              </div>
            </div>

            <div className="sticky top-24">
              {editPanel}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('editor.storeInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('editor.template')}</label>
                  <select
                    value={String(settings.template || 'shiro-hana')}
                    onChange={(e) => handleSettingChange('template', e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="shiro-hana">Shiro Hana</option>
                    <option value="babyos">Babyos</option>
                    <option value="bags">Bags Editorial</option>
                    <option value="jewelry">JewelryOS</option>
                    <option value="fashion">Fashion</option>
                    <option value="electronics">Electronics</option>
                    <option value="beauty">Beauty</option>
                    <option value="food">Food & Restaurant</option>
                    <option value="cafe">Cafe & Bakery</option>
                    <option value="furniture">Furniture</option>
                    <option value="perfume">Perfume</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('editor.storeName')}</label>
                  <Input
                    value={settings.store_name || ''}
                    onChange={(e) => handleSettingChange('store_name', e.target.value)}
                    placeholder={t('editor.storeNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('editor.storeDescription')}</label>
                  <Input
                    value={settings.store_description || ''}
                    onChange={(e) => handleSettingChange('store_description', e.target.value)}
                    placeholder={t('editor.storeDescPlaceholder')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hero Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('editor.heroSection')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('editor.heroHeading')}</label>
                  <Input
                    value={settings.template_hero_heading || ''}
                    onChange={(e) => handleSettingChange('template_hero_heading', e.target.value)}
                    placeholder={t('editor.heroHeadingPlaceholder')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('editor.heroSubtitle')}</label>
                  <Input
                    value={settings.template_hero_subtitle || ''}
                    onChange={(e) => handleSettingChange('template_hero_subtitle', e.target.value)}
                    placeholder={t('editor.heroSubtitlePlaceholder')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('editor.buttonText')}</label>
                  <Input
                    value={settings.template_button_text || ''}
                    onChange={(e) => handleSettingChange('template_button_text', e.target.value)}
                    placeholder="Shop Now"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Branding */}
            <Card>
              <CardHeader>
                <CardTitle>{t('editor.branding')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('editor.logo')}</label>
                  <div className="flex items-center gap-4">
                    {settings.store_logo && (
                      <img src={settings.store_logo} alt="Logo" className="h-12 w-auto" />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('store_logo', file);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('editor.bannerImage')}</label>
                  <div className="flex items-center gap-4">
                    {settings.banner_url && (
                      <img src={settings.banner_url} alt="Banner" className="h-20 w-auto" />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload('banner_url', file);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('editor.accentColor')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.template_accent_color || settings.primary_color || '#1E90FF'}
                      onChange={(e) => handleSettingChange('template_accent_color', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={settings.template_accent_color || settings.primary_color || '#1E90FF'}
                      onChange={(e) => handleSettingChange('template_accent_color', e.target.value)}
                      placeholder="#1E90FF"
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
