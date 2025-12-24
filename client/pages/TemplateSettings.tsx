import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Save, Eye, Check, ChevronDown, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { getAuthToken } from '@/lib/auth';
import { uploadImage } from '@/lib/api';
import {
  GENERATED_TEMPLATE_DEFAULTS,
  GENERATED_TEMPLATE_FIELDS,
  type InferredField,
} from '@/lib/generatedTemplateSettings';
import { setWindowTemplateSettings } from '@/lib/templateWindow';
import { UNIVERSAL_DEFAULTS } from '@/hooks/useTemplateUniversalSettings';
import { getTemplateEditorSections } from '@/lib/templateEditorRegistry';

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
import StoreTemplate from '@/components/templates/store';

// Category Manager Component
const CategoryManager = ({ categories, onChange, isDarkMode }: any) => {
  const [cats, setCats] = useState<any[]>(() => {
    if (typeof categories === 'string') {
      try {
        return JSON.parse(categories) || [];
      } catch {
        return [];
      }
    }
    return Array.isArray(categories) ? categories : [];
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const updated = [...cats, { name: newCategoryName, color: newCategoryColor }];
      setCats(updated);
      onChange(JSON.stringify(updated));
      setNewCategoryName('');
      setNewCategoryColor('#3B82F6');
    }
  };

  const handleRemoveCategory = (index: number) => {
    const updated = cats.filter((_, i) => i !== index);
    setCats(updated);
    onChange(JSON.stringify(updated));
  };

  return (
    <div className={`space-y-3 p-3 rounded border transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <div className="space-y-2">
        <label className={`block text-sm font-medium transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current Categories</label>
        <div className="flex flex-wrap gap-2">
          {cats.map((cat, idx) => (
            <div 
              key={idx}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${isDarkMode ? 'bg-gray-600' : 'bg-white border border-gray-300'}`}
              style={{ backgroundColor: cat.color + '20', borderColor: cat.color }}
            >
              <span style={{ color: cat.color }} className="font-medium">{cat.name}</span>
              <button
                onClick={() => handleRemoveCategory(idx)}
                className="text-red-500 hover:text-red-700 ml-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-3" style={{ borderColor: isDarkMode ? '#4B5563' : '#E5E7EB' }}>
        <label className={`block text-sm font-medium mb-2 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Add New Category</label>
        <div className="flex gap-2 flex-wrap">
          <Input
            type="text"
            placeholder="Category name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            className={`flex-1 min-w-48 ${isDarkMode ? 'dark' : ''}`}
          />
          <input
            type="color"
            value={newCategoryColor}
            onChange={(e) => setNewCategoryColor(e.target.value)}
            className={`w-10 h-10 rounded cursor-pointer transition-colors ${isDarkMode ? 'border border-gray-600' : 'border border-gray-300'}`}
          />
          <Button
            onClick={handleAddCategory}
            className="whitespace-nowrap"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TemplateSettings {
  [key: string]: any;
  store_name?: string;
  store_description?: string;
  store_slug?: string;
  banner_url?: string;
  template_accent_color?: string;
  template_hero_heading?: string;
  template_hero_subtitle?: string;
  template_button_text?: string;
  currency_code?: string;
  primary_color?: string;
  secondary_color?: string;
  template?: string;
  template_categories?: string;
  // Template-specific
  grid_columns?: number;
  enable_dark_mode?: boolean;
  gallery_count?: number;
  show_categories?: boolean;
}

// Universal template settings applied to ALL templates
const universalSections = [
  {
    title: '🎨 Branding',
    description: 'Logo, colors, and brand identity settings',
    fields: [
      { key: 'store_logo', label: 'Store Logo', type: 'image', placeholder: 'Upload your store logo' },
      { key: 'logo_width', label: 'Logo Width (px)', type: 'number', placeholder: '150', min: 50, max: 300 },
      { key: 'primary_color', label: 'Primary Color', type: 'color', placeholder: '#000000' },
      { key: 'secondary_color', label: 'Secondary Color', type: 'color', placeholder: '#F5F5F5' },
      { key: 'accent_color', label: 'Accent/Highlight Color', type: 'color', placeholder: '#FF6B35' },
      { key: 'text_color', label: 'Primary Text Color', type: 'color', placeholder: '#1A1A1A' },
      { key: 'secondary_text_color', label: 'Secondary Text Color', type: 'color', placeholder: '#666666' },
    ]
  },
  {
    title: '🔤 Typography',
    description: 'Font settings for headings and body text',
    fields: [
      { key: 'font_family', label: 'Font Family', type: 'select', options: ['Inter', 'Poppins', 'Montserrat', 'Playfair Display', 'Georgia', 'Roboto', 'Open Sans'], placeholder: 'Inter' },
      { key: 'heading_size_multiplier', label: 'Heading Size', type: 'select', options: ['Small', 'Medium', 'Large', 'Extra Large'], placeholder: 'Large' },
      { key: 'body_font_size', label: 'Body Font Size (px)', type: 'number', placeholder: '16', min: 12, max: 20 },
    ]
  },
  {
    title: '• Carousel Dots',
    description: 'Controls for carousel indicator dots (e.g. hero sliders)',
    fields: [
      { key: 'carousel_dot_size', label: 'Dot Size (px)', type: 'number', placeholder: '10', min: 4, max: 18 },
      { key: 'carousel_dot_gap', label: 'Dot Spacing (px)', type: 'number', placeholder: '8', min: 2, max: 20 },
      { key: 'carousel_dot_color', label: 'Dot Color (inactive)', type: 'color', placeholder: '#FFFFFF' },
      { key: 'carousel_dot_active_color', label: 'Dot Color (active)', type: 'color', placeholder: '#00F0FF' },
      { key: 'carousel_dot_border_color', label: 'Dot Border Color', type: 'color', placeholder: '#FFFFFF' },
    ]
  },
  {
    title: '📐 Layout & Spacing',
    description: 'Grid, spacing, and section layout settings',
    fields: [
      { key: 'grid_columns', label: 'Product Grid Columns', type: 'number', placeholder: '4', min: 1, max: 6 },
      { key: 'section_padding', label: 'Section Padding (px)', type: 'number', placeholder: '40', min: 10, max: 100 },
      { key: 'border_radius', label: 'Card Corner Radius (px)', type: 'number', placeholder: '8', min: 0, max: 30 },
      { key: 'enable_sidebar', label: 'Show Filters Sidebar', type: 'checkbox' },
    ]
  },
  {
    title: '🌙 Theme & Appearance',
    description: 'Dark mode and visual theme settings',
    fields: [
      { key: 'enable_dark_mode', label: 'Allow Dark Mode Toggle', type: 'checkbox' },
      { key: 'default_theme', label: 'Default Theme', type: 'select', options: ['Light', 'Dark', 'Auto (System)'], placeholder: 'Light' },
      { key: 'show_product_shadows', label: 'Show Product Card Shadows', type: 'checkbox' },
      { key: 'enable_animations', label: 'Enable Smooth Animations', type: 'checkbox' },
    ]
  },
  {
    title: '🔍 SEO & Meta Information',
    description: 'Search engine optimization and page metadata',
    fields: [
      { key: 'meta_title', label: 'Page Title (for browser tab)', type: 'text', placeholder: 'My Beautiful Store' },
      { key: 'meta_description', label: 'Meta Description (shown in search results)', type: 'textarea', placeholder: 'Discover amazing products...', maxLength: 160 },
      { key: 'meta_keywords', label: 'Keywords (comma-separated)', type: 'text', placeholder: 'fashion, style, products' },
    ]
  },
  {
    title: '⚡ Featured Section',
    description: 'Highlight best products on homepage',
    fields: [
      { key: 'show_featured_section', label: 'Show Featured Products', type: 'checkbox' },
      { key: 'featured_section_title', label: 'Featured Section Title', type: 'text', placeholder: 'Featured Products' },
      { key: 'featured_product_ids', label: 'Featured Product IDs (comma-separated)', type: 'text', placeholder: '1,2,3,4,5' },
    ]
  },
  {
    title: '⭐ Testimonials Section',
    description: 'Customer testimonials and reviews showcase',
    fields: [
      { key: 'show_testimonials', label: 'Show Testimonials', type: 'checkbox' },
      { key: 'testimonials', label: 'Testimonials (JSON format)', type: 'textarea', placeholder: '[{"name":"John","text":"Great products!","rating":5}]' },
    ]
  },
  {
    title: '📧 Newsletter Signup',
    description: 'Email subscription section',
    fields: [
      { key: 'show_newsletter', label: 'Show Newsletter Signup', type: 'checkbox' },
      { key: 'newsletter_title', label: 'Newsletter Title', type: 'text', placeholder: 'Subscribe to our newsletter' },
      { key: 'newsletter_subtitle', label: 'Newsletter Description', type: 'text', placeholder: 'Get exclusive offers and updates' },
    ]
  },
  {
    title: '🛡️ Trust Badges & Security',
    description: 'Trust indicators and security badges',
    fields: [
      { key: 'show_trust_badges', label: 'Show Trust Badges', type: 'checkbox' },
      { key: 'trust_badges', label: 'Trust Badges (JSON)', type: 'textarea', placeholder: '[{"icon":"shield","text":"Secure Payment"},{"icon":"truck","text":"Fast Shipping"}]' },
    ]
  },
  {
    title: '❓ FAQ Section',
    description: 'Frequently asked questions section',
    fields: [
      { key: 'show_faq', label: 'Show FAQ Section', type: 'checkbox' },
      { key: 'faq_items', label: 'FAQ Items (JSON format)', type: 'textarea', placeholder: '[{"question":"Do you ship internationally?","answer":"Yes, we ship worldwide."}]' },
    ]
  },
  {
    title: '🔗 Footer Links',
    description: 'Custom footer navigation and information',
    fields: [
      { key: 'footer_about', label: 'About Us (short text)', type: 'textarea', placeholder: 'We are dedicated to quality...', maxLength: 200 },
      { key: 'footer_links', label: 'Footer Links (JSON)', type: 'textarea', placeholder: '[{"label":"Privacy","url":"/privacy"},{"label":"Terms","url":"/terms"}]' },
      { key: 'social_links', label: 'Social Media Links (JSON)', type: 'textarea', placeholder: '[{"platform":"instagram","url":"https://instagram.com/yourstore"},{"platform":"whatsapp","url":"https://wa.me/..."}]' },
      { key: 'footer_contact', label: 'Contact Info (email/phone)', type: 'text', placeholder: 'contact@store.com' },
    ]
  },
  {
    title: '📱 Header & Navigation',
    description: 'Header menu and navigation settings',
    fields: [
      { key: 'header_sticky', label: 'Sticky Header (stays on scroll)', type: 'checkbox' },
      { key: 'show_search_bar', label: 'Show Product Search Bar', type: 'checkbox' },
      { key: 'show_cart_icon', label: 'Show Shopping Cart Icon', type: 'checkbox' },
      { key: 'custom_menu_items', label: 'Custom Menu Items (JSON)', type: 'textarea', placeholder: '[{"label":"About","url":"/about"},{"label":"Contact","url":"/contact"}]' },
    ]
  },
  {
    title: '📂 Categories',
    description: 'Create and manage product categories for your store',
    fields: [
      { key: 'template_categories', label: 'Store Categories (JSON format)', type: 'textarea', placeholder: '[{"name":"Electronics","color":"#3B82F6"},{"name":"Clothing","color":"#8B5CF6"},{"name":"Home","color":"#EC4899"}]', help: 'Add category name and optional color. Categories will appear as filters in your store.' },
    ]
  },
];

const templateConfigs: Record<string, any> = {
  fashion: {
    label: 'Fashion',
    sections: [
      ...universalSections,
      {
        title: 'Fashion-Specific: Hero Section',
        description: 'Upload hero image or video for your fashion store',
        fields: [
          { key: 'template_hero_heading', label: 'Heading', type: 'text', placeholder: 'Fashion Store' },
          { key: 'template_hero_subtitle', label: 'Subtitle', type: 'text', placeholder: 'Discover our collection' },
          { key: 'template_button_text', label: 'Button Text', type: 'text', placeholder: 'Shop Now' },
          { key: 'banner_url', label: 'Hero Banner Image', type: 'image', placeholder: 'Choose image' },
          { key: 'hero_video_url', label: 'Hero Video (MP4) - overrides image', type: 'video', placeholder: 'Upload MP4 video' },
        ]
      },
      {
        title: 'Fashion-Specific: Gender Filters',
        fields: [
          { key: 'template_genders', label: 'Gender Categories (comma-separated)', type: 'text', placeholder: 'Men,Women,Kids,Unisex' },
        ]
      }
    ]
  },
  fashion2: {
    label: 'Fashion 2',
    sections: [
      ...universalSections,
      {
        title: 'Fashion 2-Specific: Campaign Hero',
        description: 'Main hero section with campaign-style layout',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Build a fashion store that feels like a campaign' },
          { key: 'template_hero_subtitle', label: 'Subtitle', type: 'text', placeholder: 'Push your key pieces first' },
          { key: 'template_button_text', label: 'Button Text', type: 'text', placeholder: 'Shop Now' },
          { key: 'banner_url', label: 'Hero Banner Image', type: 'image', placeholder: 'Choose featured product image' },
          { key: 'hero_video_url', label: 'Hero Video (MP4) - overrides image', type: 'video', placeholder: 'Upload MP4 video' },
        ]
      }
    ]
  },
  fashion3: {
    label: 'Fashion 3 (Dark)',
    sections: [
      ...universalSections,
      {
        title: 'Fashion 3-Specific: Hero Section',
        description: 'Fashion3 features a video hero with yellow/dark theme (video optional)',
        fields: [
          { key: 'banner_url', label: 'Hero Banner Image', type: 'image', placeholder: 'Choose premium hero image' },
          { key: 'hero_video_url', label: 'Hero Video (Optional)', type: 'video', placeholder: 'Upload hero video - overrides image' },
        ]
      },
      {
        title: 'Fashion 3-Specific: Featured Outfit Image',
        description: 'Image displayed with interactive hotspots for products',
        fields: [
          { key: 'template_hotspot_image', label: 'Outfit Hotspot Image', type: 'image', placeholder: 'Upload featured outfit image' },
          { key: 'template_hotspot_config', label: 'Hotspot Points (JSON, advanced)', type: 'textarea', placeholder: '[{"id":1,"x":"30%","y":"40%","label":"Product Name","price":0}]' },
        ]
      },
      {
        title: 'Fashion 3-Specific: Lookbook Images',
        description: 'Upload images that showcase different looks/styles',
        fields: [
          { key: 'template_lookbook_1', label: 'Lookbook Image 1', type: 'image', placeholder: 'Upload first lookbook image' },
          { key: 'template_lookbook_2', label: 'Lookbook Image 2', type: 'image', placeholder: 'Upload second lookbook image' },
          { key: 'template_lookbook_3', label: 'Lookbook Image 3 (optional)', type: 'image', placeholder: 'Upload third lookbook image' },
        ]
      },
      {
        title: 'Fashion 3-Specific: Seasonal Banner',
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
      ...universalSections,
      {
        title: 'Electronics-Specific: Hero Section',
        description: 'Customize your tech store hero section',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Flagship performance for your entire tech store' },
          { key: 'template_hero_subtitle', label: 'Subtitle', type: 'text', placeholder: 'Showcase phones, headphones, gaming gear and accessories' },
          { key: 'hero_badge', label: 'Hero Badge (e.g. "2024 Latest")', type: 'text', placeholder: '2024 Latest' },
          { key: 'banner_url', label: 'Hero Banner Image', type: 'image', placeholder: 'Upload hero background' },
          { key: 'hero_video_url', label: 'Hero Video (MP4) - overrides image', type: 'video', placeholder: 'Upload MP4 video' },
        ]
      },
      {
        title: 'Electronics-Specific: Featured Products',
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
      ...universalSections,
      {
        title: 'Food-Specific: Hero Section',
        description: 'Upload a mouth-watering hero image or video for your food business',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Premium Food Selection' },
          { key: 'template_hero_subtitle', label: 'Subtitle', type: 'text', placeholder: 'Authentic flavors from our kitchen' },
          { key: 'banner_url', label: 'Hero Banner Image', type: 'image', placeholder: 'Choose food/cafe image' },
          { key: 'hero_video_url', label: 'Hero Video (MP4) - overrides image', type: 'video', placeholder: 'Upload MP4 video' },
        ]
      }
    ]
  },
  furniture: {
    label: 'Furniture',
    sections: [
      ...universalSections,
      {
        title: 'Furniture-Specific: Hero Section',
        description: 'Upload a beautiful furniture showroom hero image or video',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Furniture Collection' },
          { key: 'banner_url', label: 'Hero Banner Image', type: 'image', placeholder: 'Choose furniture image' },
          { key: 'hero_video_url', label: 'Hero Video (MP4) - overrides image', type: 'video', placeholder: 'Upload MP4 video' },
        ]
      },
      {
        title: 'Furniture-Specific: Mega Menu Categories',
        description: 'Configure room categories for the mega menu dropdown',
        fields: [
          { key: 'template_mega_menu_categories', label: 'Categories (JSON)', type: 'textarea', placeholder: '["Living Room","Bedroom","Office","Dining"]' },
        ]
      },
      {
        title: 'Furniture-Specific: Price Range',
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
      ...universalSections,
      {
        title: 'Jewelry-Specific: Hero Section',
        description: 'Upload your luxury jewelry collection hero image or video',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Luxury Jewelry Collection' },
          { key: 'banner_url', label: 'Hero Banner Image', type: 'image', placeholder: 'Upload jewelry collection image' },
          { key: 'hero_video_url', label: 'Hero Video (MP4) - overrides image', type: 'video', placeholder: 'Upload MP4 video' },
        ]
      },
      {
        title: 'Jewelry-Specific: Material Types',
        description: 'Configure which materials are available for filtering',
        fields: [
          { key: 'template_materials', label: 'Materials (comma-separated)', type: 'text', placeholder: 'Gold,Silver,Platinum,Rose Gold' },
        ]
      },
      {
        title: 'Jewelry-Specific: Gold Edit Section',
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
      ...universalSections,
      {
        title: 'Perfume-Specific: Hero Section',
        description: 'Upload a luxurious hero image or video for your perfume store',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'The Realms of Scent' },
          { key: 'template_hero_subtitle', label: 'Subtitle', type: 'text', placeholder: 'Discover scents that tell your story' },
          { key: 'banner_url', label: 'Hero Banner Image', type: 'image', placeholder: 'Choose luxurious perfume image' },
          { key: 'hero_video_url', label: 'Hero Video (Optional)', type: 'video', placeholder: 'Upload hero video - overrides image' },
        ]
      },
      {
        title: 'Perfume-Specific: Realm Filters',
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
      ...universalSections,
      {
        title: 'Baby-Specific: Hero Section',
        description: 'Upload a warm, welcoming hero image or video for your baby store',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Baby Products' },
          { key: 'banner_url', label: 'Hero Banner Image', type: 'image', placeholder: 'Choose baby products image' },
          { key: 'hero_video_url', label: 'Hero Video (MP4) - overrides image', type: 'video', placeholder: 'Upload MP4 video' },
        ]
      }
    ]
  },
  bags: {
    label: 'Bags',
    sections: [
      ...universalSections,
      {
        title: 'Bags-Specific: Hero Section',
        description: 'Upload beautiful bag collection images or video',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Cold silhouettes, cut in leather and light.' },
          { key: 'template_hero_subtitle', label: 'Subtitle', type: 'text', placeholder: 'A focused edit of structured totes, city crossbody bags and evening silhouettes.' },
          { key: 'banner_url', label: 'Hero Featured Image', type: 'image', placeholder: 'Choose bag image' },
          { key: 'hero_video_url', label: 'Hero Video (MP4) - overrides image', type: 'video', placeholder: 'Upload MP4 video' },
        ]
      },
      {
        title: 'Bags-Specific: Background Settings',
        description: 'Upload a background image that will appear behind your content',
        fields: [
          { key: 'template_bg_image', label: 'Page Background Image', type: 'image', placeholder: 'Choose background image' },
          { key: 'template_hero_bg_blur', label: 'Background Blur Amount (0-20px)', type: 'number', placeholder: '12', min: 0, max: 20 },
        ]
      },
      {
        title: 'Bags-Specific: Filter Configuration',
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
      ...universalSections,
      {
        title: 'Beauty-Specific: Hero Section',
        description: 'Upload a glamorous beauty product hero image or video',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Find Your Perfect Shade' },
          { key: 'banner_url', label: 'Hero Banner Image', type: 'image', placeholder: 'Choose beauty products image' },
          { key: 'hero_video_url', label: 'Hero Video (MP4) - overrides image', type: 'video', placeholder: 'Upload MP4 video' },
        ]
      },
      {
        title: 'Beauty-Specific: Shade Colors',
        description: 'Configure color swatches for shade finder',
        fields: [
          { key: 'template_shade_colors', label: 'Shade Colors (JSON)', type: 'textarea', placeholder: '["#F5D5B8","#E8C4A0","#D4A574","#C9915C","#B8713F"]' },
        ]
      }
    ]
  },
  cafe: {
    label: 'Cafe/Bakery',
    sections: [
      ...universalSections,
      {
        title: 'Cafe-Specific: Hero Section',
        description: 'Upload a delicious cafe/bakery hero image or video',
        fields: [
          { key: 'template_hero_heading', label: 'Main Heading', type: 'text', placeholder: 'Artisan Bakery & Cafe' },
          { key: 'banner_url', label: 'Hero Banner Image', type: 'image', placeholder: 'Choose cafe/bakery image' },
          { key: 'hero_video_url', label: 'Hero Video (Optional)', type: 'video', placeholder: 'Upload hero video - overrides image' },
        ]
      },
      {
        title: 'Cafe-Specific: Store Information',
        fields: [
          { key: 'template_since_year', label: 'Since Year', type: 'number', placeholder: '2021' },
          { key: 'template_store_city', label: 'City/Location', type: 'text', placeholder: 'Algiers' },
        ]
      }
    ]
  },
  store: {
    label: 'Store (Electronics)',
    sections: [
      ...universalSections,
      {
        title: 'Store-Specific: Hero Carousel',
        description: 'Configure the hero carousel slides for your electronics store',
        fields: [
          { key: 'template_hero_heading', label: 'Hero Title', type: 'text', placeholder: 'Your Trusted Electronics Store' },
          { key: 'template_hero_subtitle', label: 'Hero Subtitle', type: 'text', placeholder: 'Shop smartphones, laptops, monitors, and configure your dream PC' },
          { key: 'template_button_text', label: 'CTA Button Text', type: 'text', placeholder: 'Build Your PC' },
          { key: 'banner_url', label: 'Hero Background Image', type: 'image', placeholder: 'Choose hero background image' },
          { key: 'hero_video_url', label: 'Hero Video (Optional)', type: 'video', placeholder: 'Upload hero video - overrides image' },
        ]
      },
      {
        title: 'Store-Specific: Theme Settings',
        description: 'Neon theme and dark mode settings',
        fields: [
          { key: 'template_neon_color', label: 'Neon Accent Color', type: 'color', placeholder: '#00FF88' },
          { key: 'template_default_dark', label: 'Default to Dark Mode', type: 'checkbox' },
        ]
      },
      {
        title: 'Store-Specific: Product Categories',
        description: 'Configure product categories for filtering',
        fields: [
          { key: 'template_store_categories', label: 'Categories (comma-separated)', type: 'text', placeholder: 'Smartphones,Laptops,Monitors,Peripherals,Components' },
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
  store: StoreTemplate,
};

const templateList = [
  { id: 'fashion', label: 'Fashion', preview: '/template-previews/fashion.png' },
  { id: 'fashion2', label: 'Fashion 2', preview: '/template-previews/fashion2.png' },
  { id: 'fashion3', label: 'Fashion 3', preview: '/template-previews/fashion3.png' },
  { id: 'electronics', label: 'Electronics', preview: '/template-previews/electronics.png' },
  { id: 'food', label: 'Food', preview: '/template-previews/food.png' },
  { id: 'furniture', label: 'Furniture', preview: '/template-previews/furniture.png' },
  { id: 'jewelry', label: 'Jewelry', preview: '/template-previews/jewelry.png' },
  { id: 'perfume', label: 'Perfume', preview: '/template-previews/perfume.png' },
  { id: 'baby', label: 'Baby', preview: '/template-previews/baby.png' },
  { id: 'bags', label: 'Bags', preview: '/template-previews/bags.png' },
  { id: 'beauty', label: 'Beauty', preview: '/template-previews/beauty.png' },
  { id: 'cafe', label: 'Cafe', preview: '/template-previews/cafe.png' },
  { id: 'store', label: 'Store', preview: '/template-previews/store.png' },
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

  const [switchOpen, setSwitchOpen] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [switchMode, setSwitchMode] = useState<'defaults' | 'import'>('import');
  const [savingSwitch, setSavingSwitch] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    universalSections.forEach((_, idx) => {
      initial[`u_${idx}`] = true;
    });
    return initial;
  });

  const universalImportGroups = universalSections.map((section, idx) => ({
    id: `u_${idx}`,
    label: section.title,
    keys: (section.fields || []).map((f: any) => f.key).filter(Boolean),
  }));

  const computeImportKeys = () => {
    const keys: string[] = [];
    for (const g of universalImportGroups) {
      if (!selectedGroups[g.id]) continue;
      for (const k of g.keys) keys.push(k);
    }
    return Array.from(new Set(keys));
  };

  const requestTemplateSwitch = (toTemplate: string) => {
    if (toTemplate === template) return;
    setPendingTemplateId(toTemplate);
    setSwitchMode('import');
    setSwitchOpen(true);
  };

  const applyTemplateSwitch = async () => {
    if (!pendingTemplateId) return;
    try {
      setSavingSwitch(true);
      const token = getAuthToken();
      const importKeys = switchMode === 'import' ? computeImportKeys() : [];
      const res = await fetch('/api/client/store/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
      setSettings(normalizeLogoSettings(data));
      setTemplate(data.template || pendingTemplateId);
      setSwitchOpen(false);
      setPendingTemplateId(null);
    } catch (e) {
      // Fallback: switch locally so the user can keep editing.
      setTemplate(pendingTemplateId);
      setSettings((prev) => ({ ...prev, template: pendingTemplateId }));
      setSwitchOpen(false);
      setPendingTemplateId(null);
    } finally {
      setSavingSwitch(false);
    }
  };

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
      
      if (!token) {
        console.error('No auth token found');
        setMessage({ type: 'error', text: 'Please log in to access template settings' });
        // Redirect to login
        window.location.href = '/login';
        return;
      }
      
      console.log('Fetching settings with token:', token.substring(0, 20) + '...');
      const res = await fetch('/api/client/store/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(normalizeLogoSettings(data));
        setTemplate(data.template || 'fashion');
      } else {
        console.error('Failed to fetch settings:', res.status, res.statusText);
        if (res.status === 401) {
          setMessage({ type: 'error', text: 'Session expired. Please log in again' });
          window.location.href = '/login';
        } else {
          setMessage({ type: 'error', text: 'Failed to load settings' });
        }
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
      
      if (!token) {
        console.warn('No token for fetching products');
        return;
      }
      
      console.log('Fetching products with token:', token.substring(0, 20) + '...');
      const res = await fetch('/api/client/store/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || data || []);
      } else {
        console.error('Failed to fetch products:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => {
      if (key === 'store_logo' || key === 'logo_url') {
        const v = value;
        return {
          ...prev,
          store_logo: v,
          logo_url: v,
        };
      }

      return {
        ...prev,
        [key]: value
      };
    });
  };

  const effectiveSettings = useMemo(() => {
    const generatedDefaults = (GENERATED_TEMPLATE_DEFAULTS as any)[template] || {};
    const resolvedLogo = (settings as any)?.store_logo ?? (settings as any)?.logo_url;
    return {
      ...UNIVERSAL_DEFAULTS,
      ...generatedDefaults,
      ...settings,
      // Backward-compatible aliasing for templates still reading `logo_url`
      ...(resolvedLogo != null ? { store_logo: resolvedLogo, logo_url: resolvedLogo } : {}),
    };
  }, [settings, template]);

  useEffect(() => {
    setWindowTemplateSettings(effectiveSettings);
  }, [effectiveSettings]);

  // Validation helper
  const validateSettings = () => {
    if (!settings.store_name || settings.store_name.trim().length === 0) {
      setMessage({ type: 'error', text: '❌ Store name is required' });
      return false;
    }
    if (settings.store_name.length > 100) {
      setMessage({ type: 'error', text: '❌ Store name must be less than 100 characters' });
      return false;
    }
    if (settings.primary_color && !/^#[0-9A-F]{6}$/i.test(settings.primary_color)) {
      setMessage({ type: 'error', text: '❌ Primary color must be a valid hex color (#RRGGBB)' });
      return false;
    }
    if (settings.secondary_color && !/^#[0-9A-F]{6}$/i.test(settings.secondary_color)) {
      setMessage({ type: 'error', text: '❌ Secondary color must be a valid hex color (#RRGGBB)' });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    // Validate first
    if (!validateSettings()) {
      setTimeout(() => setMessage(null), 5000);
      return;
    }

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
        const data = await res.json();
        setSettings(normalizeLogoSettings(data));
        setMessage({ type: 'success', text: '✅ Settings saved successfully!' });
        // Auto-clear after 4 seconds
        setTimeout(() => setMessage(null), 4000);
      } else {
        const error = await res.json().catch(() => ({ error: 'Failed to save settings' }));
        setMessage({ type: 'error', text: `❌ ${error.error || 'Failed to save settings'}` });
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: `❌ Error saving settings: ${(err as any).message}` });
    } finally {
      setSaving(false);
    }
  };

  const baseConfig = templateConfigs[template] || templateConfigs.fashion;
  const config = useMemo(() => {
    const knownKeys = new Set<string>();
    for (const section of baseConfig.sections || []) {
      for (const field of section.fields || []) {
        if (field?.key) knownKeys.add(field.key);
      }
    }

    // Treat logo keys as aliases so we don't show duplicates in the auto-detected section.
    if (knownKeys.has('store_logo')) knownKeys.add('logo_url');
    if (knownKeys.has('logo_url')) knownKeys.add('store_logo');

    const templateProvidedSections = getTemplateEditorSections(template) || [];

    const inferred = ((GENERATED_TEMPLATE_FIELDS as any)[template] || []) as InferredField[];
    const inferredFields = inferred
      .filter((f) => f?.key && !knownKeys.has(f.key))
      .map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type === 'json' ? 'textarea' : f.type,
        placeholder:
          typeof f.defaultValue === 'string'
            ? f.defaultValue
            : f.type === 'json'
              ? '[]'
              : undefined,
      }));

    if (!inferredFields.length && !templateProvidedSections.length) return baseConfig;

    return {
      ...baseConfig,
      sections: [
        ...(baseConfig.sections || []),
        ...templateProvidedSections,
        {
          title: '🧩 Auto-detected',
          description: 'Detected from template code to match preview defaults.',
          fields: inferredFields,
        },
      ],
    };
  }, [baseConfig, template]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 w-8 h-8" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your store settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
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
                <div className="max-h-64 overflow-auto space-y-2 pr-2">
                  {universalImportGroups.map((g) => (
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

      {/* Improved Toast Notification */}
      {message && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-8 z-50 animate-in fade-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-4 py-3 md:px-5 md:py-4 rounded-xl shadow-2xl backdrop-blur-sm border ${
            message.type === 'success'
              ? 'bg-emerald-50/95 dark:bg-emerald-950/95 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
              : 'bg-red-50/95 dark:bg-red-950/95 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm md:text-base font-medium flex-1">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-lg leading-none opacity-70 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Full-width Template Selector Section */}
      <div className={`w-full border-b transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-3">
          <div className="mb-2 md:mb-3">
            <h2 className={`text-base md:text-lg font-bold mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Your Template</h2>
            <p className={`text-xs md:text-sm transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Choose a design that matches your brand</p>
          </div>
          
          {/* Infinite scrolling marquee */}
          <div className="overflow-hidden relative">
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 40s linear infinite;
              }
              .animate-marquee:hover {
                animation-play-state: paused;
              }
            `}</style>
            <div className="flex gap-3 animate-marquee" style={{ width: 'max-content' }}>
              {/* First set of templates */}
              {templateList.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => requestTemplateSwitch(tpl.id)}
                  className={`flex-shrink-0 w-[140px] md:w-[160px] rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 relative group ${
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
              {/* Duplicate set for seamless loop */}
              {templateList.map((tpl) => (
                <button
                  key={`${tpl.id}-dup`}
                  onClick={() => requestTemplateSwitch(tpl.id)}
                  className={`flex-shrink-0 w-[140px] md:w-[160px] rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 relative group ${
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
      </div>

      {/* Settings and Preview Content */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
        {/* Settings Form and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
        {/* Left Column - Settings (First Half) */}
        <div className="lg:col-span-1 space-y-2">
          {/* Store Name */}

        {/* Basic Settings Section */}
        <div className={`border rounded-lg overflow-hidden transition-colors ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setExpandedSections(prev => ({ ...prev, basic: !prev.basic }))}
            className={`w-full px-2 md:px-3 py-2 font-semibold text-left flex items-center justify-between transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
          >
            <h3 className="text-base">Store Information</h3>
            <span className={`transform transition-transform ${expandedSections.basic ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {expandedSections.basic && (
            <div className={`p-2 md:p-3 space-y-2 md:space-y-3 transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Store Name */}
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Store Name</label>
                <Input
                  value={effectiveSettings.store_name || ''}
                  onChange={(e) => handleChange('store_name', e.target.value)}
                  placeholder="My Store"
                />
              </div>

              {/* Currency */}
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Currency Code</label>
                <Input
                  value={effectiveSettings.currency_code || 'USD'}
                  onChange={(e) => handleChange('currency_code', e.target.value)}
                  placeholder="USD"
                />
              </div>
            </div>
          )}
        </div>

        {/* Template-Specific Sections - Left Half */}
        {config.sections?.slice(0, Math.ceil(config.sections.length / 2)).map((section: any, idx: number) => (
          <div key={idx} className={`border rounded-lg overflow-hidden transition-colors ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }))}
              className={`w-full px-2 md:px-3 py-2 font-semibold text-left flex items-center justify-between transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
            >
              <div className="text-left">
                <h3 className="text-base">{section.title}</h3>
                {section.description && (
                  <p className={`text-xs font-normal mt-0 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{section.description}</p>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 transform transition-transform ${expandedSections[idx] ? 'rotate-180' : ''}`} />
            </button>
            {expandedSections[idx] && (
              <div className={`p-2 md:p-3 space-y-2 md:space-y-3 transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {section.fields?.map((field: any) => (
                  <div key={field.key}>
                    <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{field.label}</label>
                    {field.type === 'color' && (
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={(effectiveSettings[field.key as keyof TemplateSettings] as string) || '#000000'}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className={`w-12 h-10 rounded cursor-pointer transition-colors ${isDarkMode ? 'border border-gray-600' : 'border border-gray-300'}`}
                        />
                        <Input
                          value={(effectiveSettings[field.key as keyof TemplateSettings] as string) || ''}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder="#000000"
                          className={isDarkMode ? 'dark' : ''}
                        />
                      </div>
                    )}
                    {field.type === 'checkbox' && (
                      <input
                        type="checkbox"
                        checked={!!effectiveSettings[field.key as keyof TemplateSettings]}
                        onChange={(e) => handleChange(field.key, e.target.checked)}
                        className="w-4 h-4"
                      />
                    )}
                    {field.type === 'select' && (
                      <select
                        value={(effectiveSettings[field.key as keyof TemplateSettings] as string) || field.placeholder || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className={`w-full h-10 px-3 rounded-md text-sm transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 border border-gray-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-900'
                        }`}
                      >
                        {(field.options || []).map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.type === 'number' && (
                      <Input
                        type="number"
                        value={(effectiveSettings[field.key as keyof TemplateSettings] ?? field.placeholder ?? '') as any}
                        onChange={(e) => handleChange(field.key, parseInt(e.target.value))}
                        min={field.min}
                        max={field.max}
                        placeholder={field.placeholder}
                        className={isDarkMode ? 'dark' : ''}
                      />
                    )}
                    {field.type === 'textarea' && (
                      <>
                        {field.key === 'template_categories' ? (
                          <CategoryManager 
                            categories={effectiveSettings.template_categories} 
                            onChange={(cats) => handleChange('template_categories', cats)}
                            isDarkMode={isDarkMode}
                          />
                        ) : (
                          <textarea
                            value={(effectiveSettings[field.key as keyof TemplateSettings] as string) || ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className={`w-full p-2 rounded text-sm font-mono resize-vertical min-h-24 transition-colors ${isDarkMode ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                          />
                        )}
                      </>
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
                                console.log('Uploading file:', file.name, file.size);
                                const res = await uploadImage(file);
                                console.log('Upload response:', res);
                                handleChange(field.key, res.url);
                                setMessage({ type: 'success', text: 'Image uploaded successfully' });
                                setTimeout(() => setMessage(null), 3000);
                              } catch (err) {
                                console.error('Upload error:', err);
                                const errorMsg = err instanceof Error ? err.message : 'Failed to upload image';
                                setMessage({ type: 'error', text: errorMsg });
                                setTimeout(() => setMessage(null), 5000);
                              }
                            }
                          }}
                          className={`flex-1 ${isDarkMode ? 'dark' : ''}`}
                        />
                        {(effectiveSettings[field.key as keyof TemplateSettings] as string) && (
                          <img
                            src={(effectiveSettings[field.key as keyof TemplateSettings] as string) || ''}
                            alt="preview"
                            className="w-12 h-12 object-cover rounded border"
                          />
                        )}
                      </div>
                    )}
                    {field.type === 'video' && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 50 * 1024 * 1024) {
                                  setMessage({ type: 'error', text: 'Video must be under 50MB' });
                                  setTimeout(() => setMessage(null), 5000);
                                  return;
                                }
                                try {
                                  setMessage({ type: 'success', text: 'Uploading video...' });
                                  const res = await uploadImage(file);
                                  handleChange(field.key, res.url);
                                  setMessage({ type: 'success', text: 'Video uploaded successfully' });
                                  setTimeout(() => setMessage(null), 3000);
                                } catch (err) {
                                  console.error('Video upload error:', err);
                                  const errorMsg = err instanceof Error ? err.message : 'Failed to upload video';
                                  setMessage({ type: 'error', text: errorMsg });
                                  setTimeout(() => setMessage(null), 5000);
                                }
                              }
                            }}
                            className={`flex-1 ${isDarkMode ? 'dark' : ''}`}
                          />
                          {(effectiveSettings[field.key as keyof TemplateSettings] as string) && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleChange(field.key, '')}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {(effectiveSettings[field.key as keyof TemplateSettings] as string) && (
                          <video
                            src={(effectiveSettings[field.key as keyof TemplateSettings] as string) || ''}
                            className="w-full max-w-xs h-24 object-cover rounded border"
                            controls
                            muted
                          />
                        )}
                        <p className="text-xs text-muted-foreground">Max 50MB. MP4/WebM recommended. Video will autoplay muted.</p>
                      </div>
                    )}
                    {['text', 'url'].includes(field.type) && (
                      <Input
                        type={field.type}
                        value={(effectiveSettings[field.key as keyof TemplateSettings] as string) || ''}
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
        </div>

        {/* Center Column - Preview */}
        <div className="lg:col-span-3">
          <div className="sticky top-2 space-y-2">
            <h3 className={`font-bold text-base md:text-lg transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Template Preview</h3>
            <div className={`border rounded-lg overflow-hidden transition-colors ${isDarkMode ? 'bg-black border-gray-700' : 'bg-white border-gray-200'}`}>
              {templateComponents[template] ? (
                React.createElement(templateComponents[template], {
                  products: products.length > 0 ? products : [],
                  settings: effectiveSettings,
                  formatPrice: (price: number) => `${price} ${effectiveSettings.currency_code || 'DZD'}`,
                  categories: [...new Set(products.map(p => p.category || 'Uncategorized'))],
                  filters: {},
                  navigate: () => {},
                  storeSlug: effectiveSettings.store_slug || 'preview'
                })
              ) : (
                <div className={`p-3 md:p-4 text-center transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Template not found</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Settings (Second Half) + Actions */}
        <div className="lg:col-span-1 space-y-2">
          {/* Template-Specific Sections - Right Half */}
          {config.sections?.slice(Math.ceil(config.sections.length / 2)).map((section: any, idx: number) => {
            const actualIdx = Math.ceil(config.sections.length / 2) + idx;
            return (
              <div key={actualIdx} className={`border rounded-lg overflow-hidden transition-colors ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, [actualIdx]: !prev[actualIdx] }))}
                  className={`w-full px-2 md:px-3 py-2 font-semibold text-left flex items-center justify-between transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
                >
                  <div className="text-left">
                    <h3 className="text-base">{section.title}</h3>
                    {section.description && (
                      <p className={`text-xs font-normal mt-0 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{section.description}</p>
                    )}
                  </div>
                  <ChevronDown className={`w-5 h-5 transform transition-transform ${expandedSections[actualIdx] ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections[actualIdx] && (
                  <div className={`p-2 md:p-3 space-y-2 md:space-y-3 transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    {section.fields?.map((field: any) => (
                      <div key={field.key}>
                        <label className={`block text-sm font-medium mb-1 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{field.label}</label>
                        {field.type === 'color' && (
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={(effectiveSettings[field.key as keyof TemplateSettings] as string) || '#000000'}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              className={`w-12 h-10 rounded cursor-pointer transition-colors ${isDarkMode ? 'border border-gray-600' : 'border border-gray-300'}`}
                            />
                            <Input
                              value={(effectiveSettings[field.key as keyof TemplateSettings] as string) || ''}
                              onChange={(e) => handleChange(field.key, e.target.value)}
                              placeholder="#000000"
                              className={isDarkMode ? 'dark' : ''}
                            />
                          </div>
                        )}
                        {field.type === 'checkbox' && (
                          <input
                            type="checkbox"
                            checked={!!effectiveSettings[field.key as keyof TemplateSettings]}
                            onChange={(e) => handleChange(field.key, e.target.checked)}
                            className="w-4 h-4"
                          />
                        )}
                        {field.type === 'select' && (
                          <select
                            value={(effectiveSettings[field.key as keyof TemplateSettings] as string) || field.placeholder || ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            className={`w-full h-10 px-3 rounded-md text-sm transition-colors ${
                              isDarkMode
                                ? 'bg-gray-700 border border-gray-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-900'
                            }`}
                          >
                            {(field.options || []).map((opt: string) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                        {field.type === 'number' && (
                          <Input
                            type="number"
                            value={(effectiveSettings[field.key as keyof TemplateSettings] ?? field.placeholder ?? '') as any}
                            onChange={(e) => handleChange(field.key, parseInt(e.target.value))}
                            min={field.min}
                            max={field.max}
                            placeholder={field.placeholder}
                            className={isDarkMode ? 'dark' : ''}
                          />
                        )}
                        {field.type === 'textarea' && (
                          <>
                            {field.key === 'template_categories' ? (
                              <CategoryManager 
                                categories={effectiveSettings.template_categories} 
                                onChange={(cats) => handleChange('template_categories', cats)}
                                isDarkMode={isDarkMode}
                              />
                            ) : (
                              <textarea
                                value={(effectiveSettings[field.key as keyof TemplateSettings] as string) || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className={`w-full p-2 rounded text-sm font-mono resize-vertical min-h-24 transition-colors ${isDarkMode ? 'bg-gray-700 border border-gray-600 text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
                              />
                            )}
                          </>
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
                                    console.log('Uploading file:', file.name, file.size);
                                    const res = await uploadImage(file);
                                    console.log('Upload response:', res);
                                    handleChange(field.key, res.url);
                                    setMessage({ type: 'success', text: 'Image uploaded successfully' });
                                    setTimeout(() => setMessage(null), 3000);
                                  } catch (err) {
                                    console.error('Upload error:', err);
                                    const errorMsg = err instanceof Error ? err.message : 'Failed to upload image';
                                    setMessage({ type: 'error', text: errorMsg });
                                    setTimeout(() => setMessage(null), 5000);
                                  }
                                }
                              }}
                              className={`flex-1 ${isDarkMode ? 'dark' : ''}`}
                            />
                            {(effectiveSettings[field.key as keyof TemplateSettings] as string) && (
                              <img
                                src={(effectiveSettings[field.key as keyof TemplateSettings] as string) || ''}
                                alt="preview"
                                className="w-12 h-12 object-cover rounded border"
                              />
                            )}
                          </div>
                        )}
                        {['text', 'url'].includes(field.type) && (
                          <Input
                            type={field.type}
                            value={(effectiveSettings[field.key as keyof TemplateSettings] as string) || ''}
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
            );
          })}

          {/* Action Buttons */}
          <div className={`border rounded-lg overflow-hidden transition-colors ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, actions: !prev.actions }))}
              className={`w-full px-2 md:px-3 py-2 font-semibold text-left flex items-center justify-between transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
            >
              <h3 className="text-base">Actions</h3>
              <span className={`transform transition-transform ${expandedSections.actions ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.actions && (
              <div className={`p-2 md:p-3 space-y-2 md:space-y-3 transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 md:pt-3 flex-col">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full gap-2"
                  >
                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function normalizeLogoSettings(input: any): TemplateSettings {
  const src: any = input && typeof input === 'object' ? input : {};
  const logo = src.store_logo ?? src.logo_url;
  if (logo == null || String(logo).trim().length === 0) return { ...src };

  return {
    ...src,
    store_logo: src.store_logo ?? logo,
    logo_url: src.logo_url ?? logo,
  };
}
