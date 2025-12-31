/**
 * Unified Template Editor
 * 
 * This editor works with all templates using the Universal Store Schema.
 * The difference is in the editor MODE, not the template:
 * - Basic Mode: Simple edits (text, images, colors, visibility)
 * - Advanced Mode: Full control (layout, spacing, effects, animations)
 * 
 * Templates are now just different RENDERERS of the same schema.
 */

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  RotateCcw, 
  RotateCw, 
  Save, 
  ShieldAlert,
  Settings,
  Sparkles,
  Eye,
  EyeOff,
  Smartphone,
  Tablet,
  Monitor,
  Palette,
  Type,
  Image,
  Layout,
  Layers,
  Wand2,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { RenderStorefront } from './storefront/templates';
import { getCurrentUser } from '@/lib/auth';
import { EditorMode } from '@/lib/templateEditorSchema';

// Import base schemas
import baseShiroHanaHome from './storefront/templates/gold/shiro-hana-home.json';
import baseBabyHome from './storefront/templates/gold/baby-home.json';

// ============================================================================
// TEMPLATE LIST - All available templates with preview images
// ============================================================================

const templateList = [
  { id: 'shiro-hana', label: 'Shiro Hana', preview: '/template-previews/shiro-hana.png', category: 'premium' },
  { id: 'fashion', label: 'Fashion', preview: '/template-previews/fashion.png', category: 'fashion' },
  { id: 'fashion2', label: 'Fashion 2', preview: '/template-previews/fashion2.png', category: 'fashion' },
  { id: 'fashion3', label: 'Fashion 3', preview: '/template-previews/fashion3.png', category: 'fashion' },
  { id: 'electronics', label: 'Electronics', preview: '/template-previews/electronics.png', category: 'tech' },
  { id: 'food', label: 'Food', preview: '/template-previews/food.png', category: 'food' },
  { id: 'furniture', label: 'Furniture', preview: '/template-previews/furniture.png', category: 'home' },
  { id: 'jewelry', label: 'Jewelry', preview: '/template-previews/jewelry.png', category: 'jewelry' },
  { id: 'perfume', label: 'Perfume', preview: '/template-previews/perfume.png', category: 'beauty' },
  { id: 'baby', label: 'Baby', preview: '/template-previews/baby.png', category: 'baby' },
  { id: 'bags', label: 'Bags', preview: '/template-previews/bags.png', category: 'fashion' },
  { id: 'beauty', label: 'Beauty', preview: '/template-previews/beauty.png', category: 'beauty' },
  { id: 'cafe', label: 'Cafe', preview: '/template-previews/cafe.png', category: 'food' },
  { id: 'store', label: 'Store', preview: '/template-previews/store.png', category: 'general' },
];

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
};

type StoreProduct = {
  id: number;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  images?: string[];
  category?: string;
  stock_quantity: number;
  is_featured: boolean;
  slug: string;
  views: number;
};

type Breakpoint = 'mobile' | 'tablet' | 'desktop';
type EditBreakpoint = 'all' | Breakpoint;
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

// ============================================================================
// EDITOR MODE DEFINITIONS
// ============================================================================

/**
 * Fields shown in Basic Mode
 * These are the essential fields any user can edit
 */
const BASIC_MODE_FIELDS = [
  // Meta
  'meta.name',
  'meta.description',
  
  // Assets
  'assets.logo',
  'assets.hero',
  
  // Header
  'layout.header.logo',
  'layout.header.nav',
  'layout.header.visible',
  
  // Hero
  'layout.hero.title',
  'layout.hero.subtitle',
  'layout.hero.image',
  'layout.hero.cta',
  'layout.hero.visible',
  
  // Products
  'layout.featured.items.*.title',
  'layout.featured.items.*.description',
  'layout.featured.items.*.price',
  'layout.featured.items.*.image',
  'layout.featured.visible',
  'layout.featured.title',
  
  // Footer
  'layout.footer.copyright',
  'layout.footer.links',
  'layout.footer.visible',
  
  // Basic styles
  'styles.primaryColor',
  'styles.theme',
];

/**
 * Additional fields shown in Advanced Mode
 */
const ADVANCED_MODE_FIELDS = [
  // All basic fields plus:
  
  // Layout controls
  'layout.*.paddingX',
  'layout.*.paddingY',
  'layout.*.gap',
  'layout.*.columns',
  'layout.*.backgroundColor',
  'layout.*.textColor',
  'layout.*.layout',
  
  // Product styling
  'layout.featured.card.*',
  'layout.featured.items.*.layout.size',
  'layout.featured.items.*.layout.shape',
  'layout.featured.items.*.layout.style',
  'layout.featured.items.*.layout.hoverEffect',
  
  // Hero advanced
  'layout.hero.video',
  'layout.hero.overlay',
  'layout.hero.animation',
  'layout.hero.minHeight',
  
  // Advanced styles
  'styles.accentColor',
  'styles.secondaryColor',
  'styles.fonts',
  'styles.tokens',
  'styles.background',
  'styles.customCss',
  
  // SEO
  'seo.*',
];

// ============================================================================
// EDITOR SECTIONS
// ============================================================================

type EditorSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  exposure: EditorMode;
  fields: string[];
};

const EDITOR_SECTIONS: EditorSection[] = [
  {
    id: 'content',
    title: 'Content',
    icon: <Type className="w-4 h-4" />,
    exposure: 'basic',
    fields: ['layout.hero.title', 'layout.hero.subtitle', 'layout.footer.copyright'],
  },
  {
    id: 'images',
    title: 'Images',
    icon: <Image className="w-4 h-4" />,
    exposure: 'basic',
    fields: ['layout.header.logo', 'layout.hero.image', 'assets.*'],
  },
  {
    id: 'colors',
    title: 'Colors',
    icon: <Palette className="w-4 h-4" />,
    exposure: 'basic',
    fields: ['styles.primaryColor', 'styles.theme'],
  },
  {
    id: 'visibility',
    title: 'Visibility',
    icon: <Eye className="w-4 h-4" />,
    exposure: 'basic',
    fields: ['layout.*.visible'],
  },
  {
    id: 'layout',
    title: 'Layout',
    icon: <Layout className="w-4 h-4" />,
    exposure: 'advanced',
    fields: ['layout.*.paddingX', 'layout.*.paddingY', 'layout.*.gap', 'layout.*.columns'],
  },
  {
    id: 'effects',
    title: 'Effects',
    icon: <Sparkles className="w-4 h-4" />,
    exposure: 'advanced',
    fields: ['layout.*.animation', 'layout.featured.card.hoverEffect'],
  },
  {
    id: 'typography',
    title: 'Typography',
    icon: <Type className="w-4 h-4" />,
    exposure: 'advanced',
    fields: ['styles.fonts.*', '*.style.fontSize', '*.style.fontWeight'],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: <Wand2 className="w-4 h-4" />,
    exposure: 'advanced',
    fields: ['styles.customCss', 'seo.*'],
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UnifiedTemplateEditor() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Editor mode from URL param or default to 'basic'
  const initialMode = (searchParams.get('mode') as EditorMode) || 'basic';
  const [editorMode, setEditorMode] = React.useState<EditorMode>(initialMode);
  
  // State
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState<StoreSettings>({
    template: 'shiro-hana',
    primary_color: '#16a34a',
    secondary_color: '#0ea5e9',
    currency_code: 'DZD',
  });
  const [products, setProducts] = React.useState<StoreProduct[]>([]);
  const [filtered, setFiltered] = React.useState<StoreProduct[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  
  // Preview state
  const [previewDevice, setPreviewDevice] = React.useState<PreviewDevice>('desktop');
  const [editBreakpoint, setEditBreakpoint] = React.useState<EditBreakpoint>('all');
  const [selectedSection, setSelectedSection] = React.useState<string>('content');
  
  // Template selector state
  const [templatesCollapsed, setTemplatesCollapsed] = React.useState(false);
  const [pendingTemplate, setPendingTemplate] = React.useState<string | null>(null);
  
  // History for undo/redo
  const historyRef = React.useRef<StoreSettings[]>([]);
  const futureRef = React.useRef<StoreSettings[]>([]);
  const [historyVersion, setHistoryVersion] = React.useState(0);
  
  // Template props
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [sortOption, setSortOption] = React.useState<'newest' | 'price-asc' | 'price-desc' | 'featured' | 'views-desc'>('newest');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Update URL when mode changes
  React.useEffect(() => {
    setSearchParams({ mode: editorMode });
  }, [editorMode, setSearchParams]);

  // Load data
  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const [settingsRes, productsRes] = await Promise.all([
          fetch('/api/client/store/settings', { credentials: 'include' }),
          fetch('/api/client/store/products', { credentials: 'include' }),
        ]);

        if (settingsRes.ok && mounted) {
          const s = await settingsRes.json();
          // Normalize template name (remove gold- prefix, it's just a renderer now)
          const templateName = String(s.template || '').replace(/^gold-/, '');
          setSettings({ ...s, template: templateName || 'shiro-hana' });
        }

        if (productsRes.ok && mounted) {
          const p = await productsRes.json();
          setProducts(p);
          setFiltered(p);
          const cats = Array.from(new Set(p.map((x: any) => x.category).filter(Boolean))).map(String);
          setCategories(cats);
        }
      } catch (e) {
        console.error('Failed to load editor data:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void run();
    return () => { mounted = false; };
  }, []);

  // Get visible sections based on editor mode
  const visibleSections = React.useMemo(() => {
    if (editorMode === 'advanced') {
      return EDITOR_SECTIONS; // All sections in advanced mode
    }
    return EDITOR_SECTIONS.filter(s => s.exposure === 'basic');
  }, [editorMode]);

  // History helpers
  const canUndo = historyRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const pushHistory = React.useCallback((snapshot: StoreSettings) => {
    historyRef.current.push(JSON.parse(JSON.stringify(snapshot)));
    if (historyRef.current.length > 60) historyRef.current.shift();
    futureRef.current = [];
    setHistoryVersion(v => v + 1);
  }, []);

  const undo = React.useCallback(() => {
    if (!historyRef.current.length) return;
    const prev = historyRef.current.pop() as StoreSettings;
    futureRef.current.push(JSON.parse(JSON.stringify(settings)));
    setSettings(prev);
    setHistoryVersion(v => v + 1);
  }, [settings]);

  const redo = React.useCallback(() => {
    if (!futureRef.current.length) return;
    const next = futureRef.current.pop() as StoreSettings;
    historyRef.current.push(JSON.parse(JSON.stringify(settings)));
    setSettings(next);
    setHistoryVersion(v => v + 1);
  }, [settings]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/client/store/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Save failed');
    } catch (e) {
      console.error('Failed to save:', e);
    } finally {
      setSaving(false);
    }
  };

  // Format price helper (no decimals)
  const formatPrice = React.useCallback((n: number) => {
    const code = settings.currency_code || 'DZD';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: code, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(n));
    } catch {
      return `${Math.round(n)} ${code}`;
    }
  }, [settings.currency_code]);

  // Template props
  const storeSlug = settings.store_slug || 'preview';
  const templateId = settings.template || 'shiro-hana';
  const primaryColor = settings.primary_color || '#16a34a';
  const secondaryColor = settings.secondary_color || '#0ea5e9';
  const bannerUrl = settings.banner_url || null;

  // Handle template switch
  const handleTemplateSwitch = React.useCallback((newTemplateId: string) => {
    if (newTemplateId === templateId) return;
    pushHistory(settings);
    setSettings(prev => ({ ...prev, template: newTemplateId }));
  }, [templateId, settings, pushHistory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">Template Editor</h1>
              <Badge variant={editorMode === 'advanced' ? 'default' : 'secondary'}>
                {editorMode === 'advanced' ? 'Advanced' : 'Basic'}
              </Badge>
            </div>
          </div>

          {/* Center - Mode Toggle */}
          <div className="flex items-center gap-2">
            <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as EditorMode)}>
              <TabsList>
                <TabsTrigger value="basic" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="advanced" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      {/* Template Selector - Scrolling Marquee */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-sm font-semibold">Choose Template</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTemplatesCollapsed(!templatesCollapsed)}
            className="h-8 w-8 p-0"
          >
            {templatesCollapsed ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            templatesCollapsed
              ? 'max-h-0 opacity-0'
              : 'max-h-[220px] opacity-100'
          }`}
        >
          {/* Infinite scrolling marquee */}
          <div className="overflow-hidden relative pb-4">
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 35s linear infinite;
              }
              .animate-marquee:hover {
                animation-play-state: paused;
              }
            `}</style>
            <div className="flex gap-3 px-4 animate-marquee" style={{ width: 'max-content' }}>
              {/* First set of templates */}
              {templateList.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateSwitch(tpl.id)}
                  className={`flex-shrink-0 w-[120px] md:w-[140px] rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 relative group ${
                    templateId === tpl.id
                      ? 'ring-4 ring-primary shadow-2xl scale-105'
                      : 'border-2 border-muted hover:border-muted-foreground/50 shadow-md hover:shadow-xl'
                  }`}
                >
                  <div className="aspect-[3/4] relative">
                    <img 
                      src={tpl.preview} 
                      alt={tpl.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback gradient if image not found
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.style.background = 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)';
                        }
                      }}
                    />
                    <div className={`absolute inset-0 flex items-end justify-center pb-3 transition-all ${
                      templateId === tpl.id
                        ? 'bg-gradient-to-t from-black/60 to-transparent'
                        : 'bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/60'
                    }`}>
                      <span className={`text-center font-semibold text-xs transition-colors ${
                        templateId === tpl.id
                          ? 'text-white'
                          : 'text-white/90 group-hover:text-white'
                      }`}>
                        {tpl.label}
                      </span>
                    </div>
                  </div>
                  {templateId === tpl.id && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
              {/* Duplicate for seamless loop */}
              {templateList.map((tpl) => (
                <button
                  key={`${tpl.id}-dup`}
                  onClick={() => handleTemplateSwitch(tpl.id)}
                  className={`flex-shrink-0 w-[120px] md:w-[140px] rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 relative group ${
                    templateId === tpl.id
                      ? 'ring-4 ring-primary shadow-2xl scale-105'
                      : 'border-2 border-muted hover:border-muted-foreground/50 shadow-md hover:shadow-xl'
                  }`}
                >
                  <div className="aspect-[3/4] relative">
                    <img 
                      src={tpl.preview} 
                      alt={tpl.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.style.background = 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)';
                        }
                      }}
                    />
                    <div className={`absolute inset-0 flex items-end justify-center pb-3 transition-all ${
                      templateId === tpl.id
                        ? 'bg-gradient-to-t from-black/60 to-transparent'
                        : 'bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/60'
                    }`}>
                      <span className={`text-center font-semibold text-xs transition-colors ${
                        templateId === tpl.id
                          ? 'text-white'
                          : 'text-white/90 group-hover:text-white'
                      }`}>
                        {tpl.label}
                      </span>
                    </div>
                  </div>
                  {templateId === tpl.id && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Editor Panels */}
        <aside className="w-80 border-r bg-card overflow-y-auto">
          {/* Section Tabs */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-2">
              {visibleSections.map(section => (
                <Button
                  key={section.id}
                  variant={selectedSection === section.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSection(section.id)}
                  className="gap-1"
                >
                  {section.icon}
                  {section.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Editor Fields */}
          <div className="p-4 space-y-4">
            {selectedSection === 'content' && (
              <>
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input
                    value={settings.store_name || ''}
                    onChange={(e) => {
                      pushHistory(settings);
                      setSettings({ ...settings, store_name: e.target.value });
                    }}
                    placeholder="Your Store Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Store Description</Label>
                  <Textarea
                    value={settings.store_description || ''}
                    onChange={(e) => {
                      pushHistory(settings);
                      setSettings({ ...settings, store_description: e.target.value });
                    }}
                    placeholder="Describe your store..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Heading</Label>
                  <Input
                    value={settings.template_hero_heading || ''}
                    onChange={(e) => {
                      pushHistory(settings);
                      setSettings({ ...settings, template_hero_heading: e.target.value });
                    }}
                    placeholder="Welcome to our store"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Textarea
                    value={settings.template_hero_subtitle || ''}
                    onChange={(e) => {
                      pushHistory(settings);
                      setSettings({ ...settings, template_hero_subtitle: e.target.value });
                    }}
                    placeholder="Discover amazing products"
                    rows={2}
                  />
                </div>
              </>
            )}

            {selectedSection === 'colors' && (
              <>
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.primary_color || '#16a34a'}
                      onChange={(e) => {
                        pushHistory(settings);
                        setSettings({ ...settings, primary_color: e.target.value });
                      }}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={settings.primary_color || '#16a34a'}
                      onChange={(e) => {
                        pushHistory(settings);
                        setSettings({ ...settings, primary_color: e.target.value });
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.secondary_color || '#0ea5e9'}
                      onChange={(e) => {
                        pushHistory(settings);
                        setSettings({ ...settings, secondary_color: e.target.value });
                      }}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={settings.secondary_color || '#0ea5e9'}
                      onChange={(e) => {
                        pushHistory(settings);
                        setSettings({ ...settings, secondary_color: e.target.value });
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
                {editorMode === 'advanced' && (
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.template_accent_color || '#f59e0b'}
                        onChange={(e) => {
                          pushHistory(settings);
                          setSettings({ ...settings, template_accent_color: e.target.value });
                        }}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={settings.template_accent_color || '#f59e0b'}
                        onChange={(e) => {
                          pushHistory(settings);
                          setSettings({ ...settings, template_accent_color: e.target.value });
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedSection === 'images' && (
              <>
                <div className="space-y-2">
                  <Label>Store Logo URL</Label>
                  <Input
                    value={settings.store_logo || ''}
                    onChange={(e) => {
                      pushHistory(settings);
                      setSettings({ ...settings, store_logo: e.target.value });
                    }}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Banner/Hero Image URL</Label>
                  <Input
                    value={settings.banner_url || ''}
                    onChange={(e) => {
                      pushHistory(settings);
                      setSettings({ ...settings, banner_url: e.target.value });
                    }}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {selectedSection === 'layout' && editorMode === 'advanced' && (
              <Alert>
                <Layers className="h-4 w-4" />
                <AlertDescription>
                  Layout controls are available in the full schema editor.
                  Use the preview to select elements and adjust their spacing.
                </AlertDescription>
              </Alert>
            )}

            {selectedSection === 'effects' && editorMode === 'advanced' && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Effects like hover animations and transitions can be configured
                  per-element in the advanced schema.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 flex flex-col">
          {/* Preview Controls */}
          <div className="border-b bg-muted/30 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Preview:</span>
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                  className="rounded-none"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('tablet')}
                  className="rounded-none border-x"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                  className="rounded-none"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Template: <span className="font-medium">{templateId}</span>
            </div>
          </div>

          {/* Preview Frame */}
          <div className="flex-1 bg-muted/50 p-4 overflow-auto">
            <div
              className="bg-background mx-auto shadow-lg rounded-lg overflow-hidden transition-all duration-300"
              style={{
                width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
                maxWidth: '100%',
                minHeight: '600px',
              }}
            >
              {RenderStorefront(templateId as any, {
                storeSlug,
                products,
                filtered,
                settings,
                categories,
                searchQuery,
                setSearchQuery,
                categoryFilter,
                setCategoryFilter,
                sortOption,
                setSortOption,
                viewMode,
                setViewMode,
                formatPrice,
                primaryColor,
                secondaryColor,
                bannerUrl,
                navigate,
                canManage: true,
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
