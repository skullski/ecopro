import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Template {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  image: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  features: string[];
}

interface TemplatesTabProps {
  storeSettings: any;
  setStoreSettings: (fn: (s: any) => any) => void;
}

export function TemplatesTab({ storeSettings, setStoreSettings }: TemplatesTabProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [switchOpen, setSwitchOpen] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [switchMode, setSwitchMode] = useState<'defaults' | 'import'>('import');
  const [savingSwitch, setSavingSwitch] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Record<string, boolean>>({
    hero_text: true,
    hero_media: false,
    accent: true,
  });

  const importGroups = [
    {
      id: 'hero_text',
      label: 'Hero Text',
      keys: ['template_hero_heading', 'template_hero_subtitle', 'template_button_text'],
    },
    {
      id: 'accent',
      label: 'Accent Color',
      keys: ['template_accent_color'],
    },
    {
      id: 'hero_media',
      label: 'Hero Images',
      keys: ['hero_main_url', 'hero_tile1_url', 'hero_tile2_url', 'store_images'],
    },
  ];

  const computeImportKeys = () => {
    const keys: string[] = [];
    for (const g of importGroups) {
      if (!selectedGroups[g.id]) continue;
      for (const k of g.keys) keys.push(k);
    }
    return Array.from(new Set(keys));
  };

  const normalizeTemplateId = (id: any): string => {
    const raw = String(id || '')
      .trim()
      .replace(/^gold-/, '')
      .replace(/-gold$/, '');
    if (raw === 'baby') return 'babyos';
    if (!raw) return 'shiro-hana';
    return raw;
  };

  const openTemplateSwitch = (templateId: string) => {
    const nextId = normalizeTemplateId(templateId);
    const currentId = normalizeTemplateId(storeSettings?.template);
    if (currentId === nextId) return;
    setPendingTemplateId(nextId);
    setSwitchMode('import');
    setSwitchOpen(true);
  };

  const applyTemplateSwitch = async () => {
    if (!pendingTemplateId) return;
    try {
      setSavingSwitch(true);
      const importKeys = switchMode === 'import' ? computeImportKeys() : [];
      const res = await fetch('/api/client/store/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          __templateSwitch: {
            toTemplate: pendingTemplateId,
            mode: switchMode,
            importKeys,
          },
        }),
      });
      if (!res.ok) throw new Error(`Switch failed (${res.status})`);
      const data = await res.json();
      setStoreSettings(() => data);
      setSwitchOpen(false);
      setPendingTemplateId(null);
    } catch (e) {
      // Fallback: switch locally so user is not blocked.
      setStoreSettings((s: any) => ({ ...s, template: pendingTemplateId }));
      setSwitchOpen(false);
      setPendingTemplateId(null);
    } finally {
      setSavingSwitch(false);
    }
  };

  // Fallback templates in case API fails
  const FALLBACK_TEMPLATES: Template[] = [
    {
      id: 'shiro-hana',
      name: 'Shiro Hana',
      category: 'Storefront',
      icon: '🍣',
      description: 'Clean modern storefront with hero + product grid.',
      image: '/template-previews/store.png',
      colors: { primary: '#111827', secondary: '#f8fafc', accent: '#22c55e' },
      features: ['Hero', 'Product grid', 'Header & footer', 'Universal schema']
    },
    {
      id: 'babyos',
      name: 'Babyos',
      category: 'Storefront',
      icon: '👶',
      description: 'Playful baby-storefront with editable layout and colors.',
      image: '/template-previews/baby.png',
      colors: { primary: '#F97316', secondary: '#FDF8F3', accent: '#F97316' },
      features: ['Hero', 'Category pills', 'Product grid', 'Fully editable tokens']
    },
    {
      id: 'bags',
      name: 'Bags Editorial',
      category: 'Storefront',
      icon: '👜',
      description: 'Editorial layout with spotlight cards and collection grid.',
      image: '/template-previews/bags.png',
      colors: { primary: '#111827', secondary: '#ffffff', accent: '#111827' },
      features: ['Editorial hero', 'Spotlight cards', 'Collection grid', 'Shared edit contract']
    },
    {
      id: 'jewelry',
      name: 'JewelryOS',
      category: 'Storefront',
      icon: '💍',
      description: 'Minimal luxury jewelry with gold glow and collection filtering.',
      image: '/template-previews/jewelry.png',
      colors: { primary: '#111827', secondary: '#ffffff', accent: '#d4af37' },
      features: ['Sticky header', 'Hero highlight', 'Collection filters', 'Product grid']
    },
  ];

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/templates');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setTemplates(data);
            setError(null);
          } else {
            setTemplates(FALLBACK_TEMPLATES);
            setError('Using fallback templates');
          }
        } else {
          console.warn('API returned non-ok status:', res.status);
          setTemplates(FALLBACK_TEMPLATES);
          setError(null);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        setTemplates(FALLBACK_TEMPLATES);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 md:py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 md:py-6 text-muted-foreground">
        <p>No templates available. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <Dialog open={switchOpen} onOpenChange={setSwitchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Template</DialogTitle>
            <DialogDescription>
              Choose how to carry over your settings to the new template.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="templateSwitchMode"
                  checked={switchMode === 'defaults'}
                  onChange={() => setSwitchMode('defaults')}
                />
                Start from defaults (no import)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="templateSwitchMode"
                  checked={switchMode === 'import'}
                  onChange={() => setSwitchMode('import')}
                />
                Import selected settings
              </label>
            </div>

            {switchMode === 'import' && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Import groups</div>
                <div className="space-y-2">
                  {importGroups.map((g) => (
                    <label key={g.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!selectedGroups[g.id]}
                        onChange={(e) =>
                          setSelectedGroups((prev) => ({ ...prev, [g.id]: e.target.checked }))
                        }
                      />
                      {g.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSwitchOpen(false);
                setPendingTemplateId(null);
              }}
              disabled={savingSwitch}
            >
              Cancel
            </Button>
            <Button onClick={applyTemplateSwitch} disabled={savingSwitch}>
              {savingSwitch ? 'Switching...' : 'Switch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-700 dark:to-slate-700 p-4 rounded-lg border border-purple-200 dark:border-slate-600">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Choose Store Template</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300">Select how your store should appear to customers. Each template is fully customizable.</p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => openTemplateSwitch(template.id)}
            className={`text-left rounded-lg border-2 transition-all overflow-hidden hover:shadow-lg ${
              normalizeTemplateId(storeSettings.template) === normalizeTemplateId(template.id)
                ? 'border-blue-500 shadow-xl ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900 bg-blue-50 dark:bg-slate-700'
                : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500 bg-white dark:bg-slate-800 hover:shadow-md'
            }`}
          >
            {/* Template image preview */}
            <div className="relative h-56 bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
              <img 
                src={template.image} 
                alt={template.name}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const parent = img.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="flex items-center justify-center h-full w-full flex-col gap-2">
                        <div class="text-2xl md:text-xl md:text-2xl">${template.icon}</div>
                        <div class="text-sm font-medium text-center px-2">${template.name}</div>
                      </div>
                    `;
                  }
                }}
              />

              {/* Selected indicator */}
              {normalizeTemplateId(storeSettings.template) === normalizeTemplateId(template.id) && (
                <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg">
                  ✓
                </div>
              )}
            </div>

            {/* Template name footer */}
            <div className="p-3 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 border-t-2 border-slate-200 dark:border-slate-600">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{template.name}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{template.category}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Template Customization */}
      <div className="mt-6 pt-6 border-t-2 border-slate-300 dark:border-slate-600 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 p-4 rounded-lg">
        <h4 className="font-bold text-base mb-4 text-slate-900 dark:text-white flex items-center gap-2">
          <span>⚙️</span> Template Settings
        </h4>
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
            <Label className="text-sm font-bold text-slate-900 dark:text-white">✍️ Hero Heading</Label>
            <Input
              placeholder="Welcome to my store"
              value={storeSettings.template_hero_heading || ''}
              onChange={(e) => setStoreSettings((s: any) => ({ ...s, template_hero_heading: e.target.value }))}
              className="mt-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
          </div>
          <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
            <Label className="text-sm font-bold text-slate-900 dark:text-white">📝 Hero Subtitle</Label>
            <Input
              placeholder="Discover our exclusive collection"
              value={storeSettings.template_hero_subtitle || ''}
              onChange={(e) => setStoreSettings((s: any) => ({ ...s, template_hero_subtitle: e.target.value }))}
              className="mt-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
          </div>
          <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
            <Label className="text-sm font-bold text-slate-900 dark:text-white">🔘 Button Text</Label>
            <Input
              placeholder="Shop Now"
              value={storeSettings.template_button_text || ''}
              onChange={(e) => setStoreSettings((s: any) => ({ ...s, template_button_text: e.target.value }))}
              className="mt-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
          </div>
          <div className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
            <Label className="text-sm font-bold text-slate-900 dark:text-white">🎨 Accent Color</Label>
            <div className="flex gap-3 mt-2">
              <input
                type="color"
                value={storeSettings.template_accent_color || '#000000'}
                onChange={(e) => setStoreSettings((s: any) => ({ ...s, template_accent_color: e.target.value }))}
                className="h-12 w-20 border-2 border-slate-300 dark:border-slate-500 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
              />
              <Input
                type="text"
                value={storeSettings.template_accent_color || '#000000'}
                onChange={(e) => setStoreSettings((s: any) => ({ ...s, template_accent_color: e.target.value }))}
                className="flex-1 font-mono text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
