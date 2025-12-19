import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  // Fallback templates in case API fails
  const FALLBACK_TEMPLATES: Template[] = [
    {
      id: 'fashion',
      name: 'Fashion Premium',
      category: 'Fashion',
      icon: '👗',
      description: 'Modern fashion store',
      image: '/template-previews/fashion-premium.png',
      colors: { primary: '#000000', secondary: '#f5f5f5', accent: '#ffc107' },
      features: ['Product Grid', 'Collections', 'Lookbooks', 'Filters']
    },
    {
      id: 'fashion2',
      name: 'Fashion Modern',
      category: 'Fashion',
      icon: '👔',
      description: 'Contemporary fashion',
      image: '/template-previews/fashion-modern.png',
      colors: { primary: '#ffffff', secondary: '#1a1a1a', accent: '#ff6b35' },
      features: ['Dark Mode', 'Featured Products', 'Categories', 'Trending']
    },
    {
      id: 'fashion3',
      name: 'Fashion Minimal',
      category: 'Fashion',
      icon: '✨',
      description: 'Minimalist fashion',
      image: '/template-previews/fashion-minimal.png',
      colors: { primary: '#ffffff', secondary: '#f0f0f0', accent: '#333333' },
      features: ['Clean Layout', 'Grid View', 'Product Details', 'Reviews']
    },
    {
      id: 'electronics',
      name: 'Electronics',
      category: 'Tech',
      icon: '🔌',
      description: 'Tech store',
      image: '/template-previews/electronics.png',
      colors: { primary: '#0ea5e9', secondary: '#0f172a', accent: '#38bdf8' },
      features: ['Product Specs', 'Comparisons', 'Categories', 'Dark Theme']
    },
    {
      id: 'food',
      name: 'Cafe & Coffee',
      category: 'Food',
      icon: '☕',
      description: 'Premium food and beverage',
      image: '/template-previews/food.png',
      colors: { primary: '#6f4e37', secondary: '#fef9f3', accent: '#d4a574' },
      features: ['Menu Items', 'Descriptions', 'Pricing', 'Availability']
    },
    {
      id: 'furniture',
      name: 'Furniture',
      category: 'Home',
      icon: '🛋️',
      description: 'Modern furniture',
      image: '/template-previews/furniture.png',
      colors: { primary: '#4b5563', secondary: '#f5f5f5', accent: '#8b7355' },
      features: ['Product Grid', 'Categories', 'Favorites', 'Reviews']
    },
    {
      id: 'jewelry',
      name: 'Jewelry',
      category: 'Luxury',
      icon: '💎',
      description: 'Luxury jewelry',
      image: '/template-previews/jewelry.png',
      colors: { primary: '#1a1a1a', secondary: '#ffd700', accent: '#c0c0c0' },
      features: ['Collection View', 'Product Details', 'Gallery', 'Reviews']
    },
    {
      id: 'perfume',
      name: 'Perfume',
      category: 'Beauty',
      icon: '🌸',
      description: 'Fragrance store',
      image: '/template-previews/perfume.png',
      colors: { primary: '#2d3436', secondary: '#ffe6e9', accent: '#ff7675' },
      features: ['Product Grid', 'Scent Notes', 'Price Range', 'Reviews']
    },
    {
      id: 'baby',
      name: 'Baby Products',
      category: 'Family',
      icon: '👶',
      description: 'Baby products store',
      image: '/template-previews/baby.png',
      colors: { primary: '#74b9ff', secondary: '#fffacd', accent: '#a29bfe' },
      features: ['Safe Products', 'Age Groups', 'Safety Tips', 'Reviews']
    },
    {
      id: 'bags',
      name: 'Bags & Accessories',
      category: 'Fashion',
      icon: '👜',
      description: 'Bags and accessories',
      image: '/template-previews/bags.png',
      colors: { primary: '#2d3436', secondary: '#f5f6fa', accent: '#636e72' },
      features: ['Collection View', 'Material Info', 'Size Guide', 'Reviews']
    },
    {
      id: 'beauty',
      name: 'Beauty & Cosmetics',
      category: 'Beauty',
      icon: '💄',
      description: 'Beauty and cosmetics',
      image: '/template-previews/beauty.png',
      colors: { primary: '#d63031', secondary: '#fff5f7', accent: '#ff7675' },
      features: ['Product Grid', 'Ingredients', 'Swatches', 'Reviews']
    },
    {
      id: 'cafe',
      name: 'Cafe',
      category: 'Food',
      icon: '☕',
      description: 'Coffee shop',
      image: '/template-previews/cafe.png',
      colors: { primary: '#6f4e37', secondary: '#fef9f3', accent: '#d4a574' },
      features: ['Menu Items', 'Descriptions', 'Pricing', 'Availability']
    }
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
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-700 dark:to-slate-700 p-4 rounded-lg border border-purple-200 dark:border-slate-600">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Choose Store Template</h3>
        <p className="text-sm text-slate-700 dark:text-slate-300">Select how your store should appear to customers. Each template is fully customizable.</p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setStoreSettings((s: any) => ({ ...s, template: template.id }))}
            className={`text-left rounded-lg border-2 transition-all overflow-hidden hover:shadow-lg ${
              storeSettings.template === template.id
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
              {storeSettings.template === template.id && (
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
