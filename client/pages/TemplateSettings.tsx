import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Eye, Check, ChevronDown } from 'lucide-react';
import { getAuthToken } from '@/lib/auth';
import { uploadImage } from '@/lib/api';

// Import all templates for preview
import FashionTemplate from '@/components/templates/fashion';
import Fashion2Template from '@/components/templates/fashion2';
import Fashion3Template from '@/components/templates/fashion3';
import ElectronicsTemplate from '@/components/templates/electronics';
import FoodTemplate from '@/components/templates/food';
import FurnitureTemplate from '@/components/templates/furniture';
import JewelryTemplate from '@/components/templates/jewelry';
import PerfumeTemplate from '@/components/templates/perfume';
import BabyTemplate from '@/components/templates/baby';
import BagsTemplate from '@/components/templates/bags';
import BeautyTemplate from '@/components/templates/beauty';
import CafeTemplate from '@/components/templates/cafe';

interface TemplateSettings {
  store_name?: string;
  store_description?: string;
  banner_url?: string;
  template_accent_color?: string;
  template_hero_heading?: string;
  template_hero_subtitle?: string;
  template_button_text?: string;
  currency_code?: string;
  primary_color?: string;
  secondary_color?: string;
  template?: string;
  // Template-specific
  grid_columns?: number;
  enable_dark_mode?: boolean;
  gallery_count?: number;
  show_categories?: boolean;
}

const templateConfigs: Record<string, any> = {
  fashion: {
    label: 'Fashion',
    sections: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'template_hero_heading', label: 'Heading', type: 'text', placeholder: 'Fashion Store' },
          { key: 'template_hero_subtitle', label: 'Subtitle', type: 'text', placeholder: 'Discover our collection' },
          { key: 'template_button_text', label: 'Button Text', type: 'text', placeholder: 'Shop Now' },
          { key: 'banner_url', label: 'Banner Image', type: 'image', placeholder: 'Choose image' },
        ]
      },
      {
        title: 'Colors & Style',
        fields: [
          { key: 'template_accent_color', label: 'Accent Color', type: 'color' },
        ]
      }
    ]
  },
  fashion2: {
    label: 'Fashion 2',
    sections: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Build a fashion store that feels like a campaign' },
          { key: 'template_hero_subtitle', label: 'Subtitle', type: 'text', placeholder: 'Push your key pieces first' },
          { key: 'template_button_text', label: 'Button Text', type: 'text', placeholder: 'Shop Now' },
          { key: 'banner_url', label: 'Hero Banner Image', type: 'image', placeholder: 'Choose image' },
        ]
      }
    ]
  },
  fashion3: {
    label: 'Fashion 3 (Dark)',
    sections: [
      {
        title: 'Video Hero',
        description: 'Fashion3 features a video hero with yellow/dark theme. Add product data to showcase hotspots.',
        fields: [
          { key: 'template_video_url', label: 'Hero Video URL', type: 'url', placeholder: 'https://video.mp4' },
        ]
      },
      {
        title: 'Hotspot Configuration',
        description: 'Hotspots overlay products on images. Configure as JSON.',
        fields: [
          { key: 'template_hotspot_image', label: 'Hotspot Image URL', type: 'url', placeholder: 'https://...' },
          { key: 'template_hotspot_config', label: 'Hotspot Points (JSON)', type: 'textarea', placeholder: '[{"id":1,"x":"30%","y":"40%","label":"Product Name","price":0}]' },
        ]
      },
      {
        title: 'Lookbook',
        description: 'Showcase outfit looks with images and descriptions.',
        fields: [
          { key: 'template_lookbook_images', label: 'Lookbook Images (one per line)', type: 'textarea', placeholder: 'https://image1.jpg\nhttps://image2.jpg' },
        ]
      },
      {
        title: 'Seasonal Banner',
        fields: [
          { key: 'template_seasonal_title', label: 'Seasonal Drop Title', type: 'text', placeholder: 'Drop 01 · Night Shift' },
          { key: 'template_seasonal_subtitle', label: 'Drop Description', type: 'text', placeholder: 'Oversized coat, cargos and sneakers — limited run.' },
        ]
      }
    ]
  },
  electronics: {
    label: 'Electronics',
    sections: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Flagship performance for your entire tech store' },
          { key: 'template_hero_subtitle', label: 'Subtitle', type: 'text', placeholder: 'Showcase phones, headphones, gaming gear and accessories' },
          { key: 'hero_badge', label: 'Hero Badge (e.g. "2024 Latest")', type: 'text', placeholder: '2024 Latest' },
        ]
      },
      {
        title: 'Featured Products',
        description: 'Reference products by their ID to highlight them',
        fields: [
          { key: 'hero_product_id', label: 'Main Hero Product ID', type: 'number', placeholder: '1' },
          { key: 'split_hero_product_id', label: 'Secondary Hero Product ID', type: 'number', placeholder: '2' },
          { key: 'best_sellers_ids', label: 'Best Sellers IDs (comma-separated)', type: 'text', placeholder: '1,2,3,4' },
          { key: 'deals_ids', label: 'Deals IDs (comma-separated)', type: 'text', placeholder: '5,6,7' },
        ]
      }
    ]
  },
  food: {
    label: 'Food/Cafe',
    sections: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Premium Food Selection' },
          { key: 'template_hero_subtitle', label: 'Subtitle', type: 'text', placeholder: 'Authentic flavors from our kitchen' },
          { key: 'banner_url', label: 'Banner Image', type: 'image', placeholder: 'Choose image' },
        ]
      },
      {
        title: 'Layout Settings',
        fields: [
          { key: 'gallery_count', label: 'Products per Row', type: 'number', min: 1, max: 6, placeholder: '3' },
        ]
      }
    ]
  },
  furniture: {
    label: 'Furniture',
    sections: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Furniture Collection' },
          { key: 'banner_url', label: 'Banner Image', type: 'image', placeholder: 'Choose image' },
        ]
      },
      {
        title: 'Mega Menu Categories',
        description: 'Configure room categories for the mega menu dropdown',
        fields: [
          { key: 'template_mega_menu_categories', label: 'Categories (JSON)', type: 'textarea', placeholder: '["Living Room","Bedroom","Office","Dining"]' },
        ]
      },
      {
        title: 'Price Range',
        fields: [
          { key: 'template_price_min', label: 'Minimum Price', type: 'number', placeholder: '0' },
          { key: 'template_price_max', label: 'Maximum Price', type: 'number', placeholder: '100000' },
        ]
      }
    ]
  },
  jewelry: {
    label: 'Jewelry',
    sections: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Luxury Jewelry Collection' },
          { key: 'banner_url', label: 'Banner Image', type: 'image', placeholder: 'Choose image' },
        ]
      },
      {
        title: 'Material Types',
        description: 'Configure which materials are available for filtering',
        fields: [
          { key: 'template_materials', label: 'Materials (comma-separated)', type: 'text', placeholder: 'Gold,Silver,Platinum,Rose Gold' },
        ]
      },
      {
        title: 'Gold Edit Section',
        description: 'Showcase featured collection items',
        fields: [
          { key: 'template_featured_ids', label: 'Featured Product IDs (comma-separated)', type: 'text', placeholder: '1,2,3,4' },
        ]
      }
    ]
  },
  perfume: {
    label: 'Perfume',
    sections: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'The Realms of Scent' },
          { key: 'template_hero_subtitle', label: 'Subtitle', type: 'text', placeholder: 'Discover scents that tell your story' },
        ]
      },
      {
        title: 'Realm Filters',
        description: 'Configure scent realms for filtering',
        fields: [
          { key: 'template_realms', label: 'Realms (comma-separated)', type: 'text', placeholder: 'All,Noir,Gold,Dream' },
        ]
      }
    ]
  },
  baby: {
    label: 'Baby',
    sections: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Baby Products' },
          { key: 'banner_url', label: 'Banner Image', type: 'image', placeholder: 'Choose image' },
        ]
      },
      {
        title: 'Layout Settings',
        fields: [
          { key: 'grid_columns', label: 'Grid Columns', type: 'number', min: 1, max: 6, placeholder: '4' },
        ]
      }
    ]
  },
  bags: {
    label: 'Bags',
    sections: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Cold silhouettes, cut in leather and light.' },
          { key: 'template_hero_subtitle', label: 'Subtitle', type: 'text', placeholder: 'A focused edit of structured totes, city crossbody bags and evening silhouettes.' },
          { key: 'banner_url', label: 'Hero Featured Image', type: 'image', placeholder: 'Choose image' },
        ]
      },
      {
        title: 'Background Settings',
        fields: [
          { key: 'template_bg_image', label: 'Page Background Image', type: 'image', placeholder: 'Choose background image' },
          { key: 'template_hero_bg_blur', label: 'Background Blur Amount (0-20px)', type: 'number', placeholder: '12', min: 0, max: 20 },
        ]
      },
      {
        title: 'Filter Configuration',
        fields: [
          { key: 'template_materials', label: 'Materials (comma-separated)', type: 'text', placeholder: 'Leather,Canvas,Nylon,Suede,Velvet' },
          { key: 'template_types', label: 'Bag Types (comma-separated)', type: 'text', placeholder: 'Tote,Crossbody,Clutch,Backpack' },
        ]
      }
    ]
  },
  beauty: {
    label: 'Beauty',
    sections: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Find Your Perfect Shade' },
          { key: 'banner_url', label: 'Banner Image', type: 'image', placeholder: 'Choose image' },
        ]
      },
      {
        title: 'Shade Colors',
        description: 'Configure color swatches for shade finder',
        fields: [
          { key: 'template_shade_colors', label: 'Shade Colors (JSON)', type: 'textarea', placeholder: '["#F5D5B8","#E8C4A0","#D4A574","#C9915C","#B8713F"]' },
        ]
      },
      {
        title: 'Layout Settings',
        fields: [
          { key: 'gallery_count', label: 'Products per Row', type: 'number', min: 1, max: 6, placeholder: '4' },
        ]
      }
    ]
  },
  cafe: {
    label: 'Cafe/Bakery',
    sections: [
      {
        title: 'Hero Section',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Artisan Bakery & Cafe' },
          { key: 'banner_url', label: 'Banner Image', type: 'image', placeholder: 'Choose image' },
        ]
      },
      {
        title: 'Store Information',
        fields: [
          { key: 'template_since_year', label: 'Since Year', type: 'number', placeholder: '2021' },
          { key: 'template_store_city', label: 'City/Location', type: 'text', placeholder: 'Algiers' },
        ]
      }
    ]
  }
};

const templateComponents: Record<string, any> = {
  fashion: FashionTemplate,
  fashion2: Fashion2Template,
  fashion3: Fashion3Template,
  electronics: ElectronicsTemplate,
  food: FoodTemplate,
  furniture: FurnitureTemplate,
  jewelry: JewelryTemplate,
  perfume: PerfumeTemplate,
  baby: BabyTemplate,
  bags: BagsTemplate,
  beauty: BeautyTemplate,
  cafe: CafeTemplate,
};

const templateList = [
  { id: 'fashion', label: 'Fashion', preview: '/template-previews/fashion-minimal.png' },
  { id: 'fashion2', label: 'Fashion 2', preview: '/template-previews/fashion-modern.png' },
  { id: 'fashion3', label: 'Fashion 3', preview: '/template-previews/fashion-premium.png' },
  { id: 'electronics', label: 'Electronics', preview: '/template-previews/electronics.png' },
  { id: 'food', label: 'Food', preview: '/template-previews/food.png' },
  { id: 'furniture', label: 'Furniture', preview: '/template-previews/furniture.png' },
  { id: 'jewelry', label: 'Jewelry', preview: '/template-previews/jewelry.png' },
  { id: 'perfume', label: 'Perfume', preview: '/template-previews/perfume.png' },
  { id: 'baby', label: 'Baby', preview: '/template-previews/baby.png' },
  { id: 'bags', label: 'Bags', preview: '/template-previews/bags.png' },
  { id: 'beauty', label: 'Beauty', preview: '/template-previews/beauty.png' },
  { id: 'cafe', label: 'Cafe', preview: '/template-previews/cafe.png' },
];

export default function TemplateSettingsPage() {
  const [template, setTemplate] = useState<string>('fashion');
  const [settings, setSettings] = useState<TemplateSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Fetch current settings
  useEffect(() => {
    fetchSettings();
    fetchProducts();
    
    // Listen for dark mode changes
    const observeTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    
    const observer = new MutationObserver(observeTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch('/api/client/store/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setTemplate(data.template || 'fashion');
      } else {
        console.error('Failed to fetch settings:', res.status);
        setMessage({ type: 'error', text: 'Failed to load settings' });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch('/api/client/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getAuthToken();
      const res = await fetch('/api/client/store/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await res.json().catch(() => ({ error: 'Failed to save settings' }));
        setMessage({ type: 'error', text: error.error || 'Failed to save settings' });
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  }

  const config = templateConfigs[template] || templateConfigs.fashion;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Full-width Template Selector Section */}
      <div className={`w-full border-b transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="mb-8">
            <h2 className={`text-4xl font-bold mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Your Template</h2>
            <p className={`transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Choose a design that matches your brand</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {templateList.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => {
                  setTemplate(tpl.id);
                  setSettings(prev => ({ ...prev, template: tpl.id }));
                }}
                className={`rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 relative group ${
                  template === tpl.id
                    ? 'ring-4 ring-blue-500 shadow-2xl scale-105'
                    : isDarkMode
                    ? 'border-2 border-gray-600 hover:border-gray-500 shadow-md hover:shadow-xl'
                    : 'border-2 border-gray-200 hover:border-gray-400 shadow-md hover:shadow-xl'
                }`}
              >
                <div className="aspect-square relative">
                  <img 
                    src={tpl.preview} 
                    alt={tpl.label}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 flex items-end justify-center pb-3 transition-all ${
                    template === tpl.id
                      ? 'bg-gradient-to-t from-black/60 to-transparent'
                      : 'bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/60'
                  }`}>
                    <span className={`text-center font-semibold text-sm transition-colors ${
                      template === tpl.id
                        ? 'text-white'
                        : 'text-white/90 group-hover:text-white'
                    }`}>
                      {tpl.label}
                    </span>
                  </div>
                </div>
                {template === tpl.id && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <Check className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Settings and Preview Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Settings Form and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Settings (Now smaller) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Store Name */}

        {/* Basic Settings Section */}
        <div className={`border rounded-lg overflow-hidden transition-colors ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setExpandedSections(prev => ({ ...prev, basic: !prev.basic }))}
            className={`w-full px-4 py-3 font-semibold text-left flex items-center justify-between transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
          >
            <h3 className="text-base">Store Information</h3>
            <span className={`transform transition-transform ${expandedSections.basic ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {expandedSections.basic && (
            <div className={`p-4 space-y-4 transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Store Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Store Name</label>
                <Input
                  value={settings.store_name || ''}
                  onChange={(e) => handleChange('store_name', e.target.value)}
                  placeholder="My Store"
                />
              </div>

              {/* Currency */}
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Currency Code</label>
                <Input
                  value={settings.currency_code || 'USD'}
                  onChange={(e) => handleChange('currency_code', e.target.value)}
                  placeholder="USD"
                />
              </div>
            </div>
          )}
        </div>

        {/* Template-Specific Sections */}
        {config.sections?.map((section: any, idx: number) => (
          <div key={idx} className={`border rounded-lg overflow-hidden transition-colors ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }))}
              className={`w-full px-4 py-3 font-semibold text-left flex items-center justify-between transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
            >
              <div className="text-left">
                <h3 className="text-base">{section.title}</h3>
                {section.description && (
                  <p className={`text-xs font-normal mt-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{section.description}</p>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 transform transition-transform ${expandedSections[idx] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections[idx] && (
              <div className={`p-4 space-y-4 transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {section.fields?.map((field: any) => (
                  <div key={field.key}>
                    <label className={`block text-sm font-medium mb-2 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{field.label}</label>
                    {field.type === 'color' && (
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={(settings[field.key as keyof TemplateSettings] as string) || '#000000'}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className={`w-12 h-10 rounded cursor-pointer transition-colors ${isDarkMode ? 'border border-gray-600' : 'border border-gray-300'}`}
                        />
                        <Input
                          value={(settings[field.key as keyof TemplateSettings] as string) || ''}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder="#000000"
                          className={isDarkMode ? 'dark' : ''}
                        />
                      </div>
                    )}
                    {field.type === 'checkbox' && (
                      <input
                        type="checkbox"
                        checked={!!settings[field.key as keyof TemplateSettings]}
                        onChange={(e) => handleChange(field.key, e.target.checked)}
                        className="w-4 h-4"
                      />
                    )}
                    {field.type === 'number' && (
                      <Input
                        type="number"
                        value={settings[field.key as keyof TemplateSettings] || field.placeholder || ''}
                        onChange={(e) => handleChange(field.key, parseInt(e.target.value))}
                        min={field.min}
                        max={field.max}
                        placeholder={field.placeholder}
                        className={isDarkMode ? 'dark' : ''}
                      />
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        value={(settings[field.key as keyof TemplateSettings] as string) || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full p-2 rounded text-sm font-mono resize-vertical min-h-24 transition-colors ${isDarkMode ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                      />
                    )}
                    {field.type === 'image' && (
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const res = await uploadImage(file);
                                handleChange(field.key, res.url);
                                setMessage({ type: 'success', text: 'Image uploaded successfully' });
                              } catch (err) {
                                setMessage({ type: 'error', text: 'Failed to upload image' });
                              }
                            }
                          }}
                          className={`flex-1 ${isDarkMode ? 'dark' : ''}`}
                        />
                        {(settings[field.key as keyof TemplateSettings] as string) && (
                          <img
                            src={(settings[field.key as keyof TemplateSettings] as string) || ''}
                            alt="preview"
                            className="w-12 h-12 object-cover rounded border"
                          />
                        )}
                      </div>
                    )}
                    {['text', 'url'].includes(field.type) && (
                      <Input
                        type={field.type}
                        value={(settings[field.key as keyof TemplateSettings] as string) || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={isDarkMode ? 'dark' : ''}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 gap-2"
          >
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg transition-colors ${message.type === 'success' ? isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-900' : isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-900'}`}>
            {message.text}
          </div>
        )}
        </div>

        {/* Right Column - Preview (Now larger) */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 space-y-4">
            <h3 className={`font-bold text-lg transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Template Preview</h3>
            <div className={`border rounded-lg overflow-hidden min-h-screen transition-colors ${isDarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'}`}>
              {templateComponents[template] ? (
                React.createElement(templateComponents[template], {
                  products: products.length > 0 ? products : [],
                  settings: settings,
                  formatPrice: (price: number) => `${price} ${settings.currency_code || 'DZD'}`,
                  categories: [...new Set(products.map(p => p.category || 'Uncategorized'))],
                  filters: {}
                })
              ) : (
                <div className={`p-8 text-center transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Template not found</div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
