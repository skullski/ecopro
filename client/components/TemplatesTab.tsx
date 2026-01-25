import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { markOnboardingStepComplete } from '@/lib/onboarding';
import { useTranslation } from '@/lib/i18n';
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  useEffect(() => {
    markOnboardingStepComplete('templates_opened');
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>('All');

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
      .toLowerCase()
      .replace(/^gold-/, '')
      .replace(/-gold$/, '');
    if (raw === 'baby' || raw === 'babyos') return 'kids';
    if (raw === 'shiro-hana') return 'pro';
    if (raw === 'simple') return 'minimal';
    if (raw === 'traditional') return 'classic';
    if (raw === 'bold') return 'modern';
    if (!raw) return 'pro';
    return raw;
  };

  const getImageKey = (templateId: string, variant: 'carousel' | 'grid') => `${templateId}:${variant}`;

  const currentTemplateId = normalizeTemplateId(storeSettings?.template);
  const isPreviewingDifferentTemplate = Boolean(previewTemplateId && normalizeTemplateId(previewTemplateId) !== currentTemplateId);
  const previewTemplateName = previewTemplateId
    ? templates.find((tpl) => normalizeTemplateId(tpl.id) === normalizeTemplateId(previewTemplateId))?.name || previewTemplateId
    : null;

  const openTemplateSwitch = (templateId: string) => {
    const nextId = normalizeTemplateId(templateId);
    const currentId = currentTemplateId;
    if (currentId === nextId) {
      setPreviewTemplateId(null);
      return;
    }
    setPendingTemplateId(nextId);
    setSwitchMode('import');
    setSwitchError(null);
    setSwitchOpen(true);
  };

  const [switchError, setSwitchError] = useState<string | null>(null);

  const applyTemplateSwitch = async () => {
    if (!pendingTemplateId) return;
    setSwitchError(null);
    try {
      setSavingSwitch(true);
      const importKeys = switchMode === 'import' ? computeImportKeys() : [];
      const res = await fetch('/api/client/store/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          __templateSwitch: {
            toTemplate: pendingTemplateId,
            mode: switchMode,
            importKeys,
          },
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Switch failed (${res.status})`);
      }
      const data = await res.json();
      // Verify the template was actually saved
      if (data.template !== pendingTemplateId) {
        console.warn('Template mismatch: expected', pendingTemplateId, 'got', data.template);
      }
      setStoreSettings(() => data);
      setSwitchOpen(false);
      setPendingTemplateId(null);
      // Invalidate react-query cache so Dashboard/OnboardingGuide sees updated template
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
      markOnboardingStepComplete('template_switched');
    } catch (e: any) {
      console.error('Template switch failed:', e);
      setSwitchError(e.message || 'Failed to switch template. Please try again.');
      // Don't close dialog on error - let user retry
    } finally {
      setSavingSwitch(false);
    }
  };

  // Fallback templates in case API fails
  const FALLBACK_TEMPLATES: Template[] = [
    // Original templates
    { id: 'bags', name: 'Bags', category: 'Storefront', icon: '👜', description: 'Editorial layout with spotlight cards and collection grid.', image: '/template-previews/bags.png', colors: { primary: '#111827', secondary: '#ffffff', accent: '#111827' }, features: ['Editorial hero', 'Spotlight cards', 'Collection grid', 'Shared edit contract'] },
    { id: 'jewelry', name: 'Jewelry', category: 'Storefront', icon: '💍', description: 'Minimal luxury jewelry with gold glow and collection filtering.', image: '/template-previews/jewelry.png', colors: { primary: '#111827', secondary: '#ffffff', accent: '#d4af37' }, features: ['Sticky header', 'Hero highlight', 'Collection filters', 'Product grid'] },
    { id: 'fashion', name: 'Fashion', category: 'Storefront', icon: '👗', description: 'Modern fashion storefront with editorial layout.', image: '/template-previews/fashion.png', colors: { primary: '#111827', secondary: '#ffffff', accent: '#ef4444' }, features: ['Editorial hero', 'Fashion grid', 'Dual CTAs', 'Badge editing'] },
    { id: 'electronics', name: 'Electronics', category: 'Storefront', icon: '📱', description: 'Tech-focused store with dark theme and glass effects.', image: '/template-previews/electronics.png', colors: { primary: '#020617', secondary: '#0f172a', accent: '#38bdf8' }, features: ['Tech hero', 'Glass cards', 'Grid layout', 'Modern design'] },
    { id: 'beauty', name: 'Beauty', category: 'Storefront', icon: '💄', description: 'Elegant beauty store with soft pink tones.', image: '/template-previews/beauty.png', colors: { primary: '#fff6fb', secondary: '#ffffff', accent: '#b91c1c' }, features: ['Soft aesthetics', 'Beauty grid', 'Elegant fonts', 'Pink theme'] },
    { id: 'food', name: 'Food', category: 'Storefront', icon: '🍔', description: 'Restaurant-style food store with dark warm theme.', image: '/template-previews/food.png', colors: { primary: '#1a1a1a', secondary: '#2a2a2a', accent: '#ef4444' }, features: ['Parallax hero', 'Menu cards', 'Food grid', 'Dark theme'] },
    { id: 'cafe', name: 'Cafe', category: 'Storefront', icon: '☕', description: 'Warm bakery-style cafe with cozy aesthetics.', image: '/template-previews/cafe.png', colors: { primary: '#fef7ed', secondary: '#ffffff', accent: '#d97706' }, features: ['Warm colors', 'Bakery style', 'Cozy design', 'Menu layout'] },
    { id: 'furniture', name: 'Furniture', category: 'Storefront', icon: '🛋️', description: 'Minimal furniture store with sidebar categories.', image: '/template-previews/furniture.png', colors: { primary: '#f5f5f4', secondary: '#ffffff', accent: '#78716c' }, features: ['Sidebar nav', 'Category filters', 'Minimal design', 'Stone theme'] },
    { id: 'perfume', name: 'Perfume', category: 'Storefront', icon: '🌸', description: 'Ultra-luxury perfume store with dark theme.', image: '/template-previews/perfume.png', colors: { primary: '#000000', secondary: '#18181b', accent: '#f59e0b' }, features: ['Full hero', 'Luxury feel', 'Gold accents', 'Dark elegance'] },
    { id: 'minimal', name: 'Minimal', category: 'Storefront', icon: '◻️', description: 'Clean, white-space focused design for boutique shops.', image: '/template-previews/minimal.png', colors: { primary: '#ffffff', secondary: '#fafafa', accent: '#000000' }, features: ['Whitespace', 'Clean lines', 'Simple layout', 'Typography focus'] },
    { id: 'classic', name: 'Classic', category: 'Storefront', icon: '🏪', description: 'Traditional warm storefront for local shops.', image: '/template-previews/classic.png', colors: { primary: '#faf8f5', secondary: '#ffffff', accent: '#c17f59' }, features: ['Warm tones', 'Friendly design', 'Traditional layout', 'Serif fonts'] },
    { id: 'modern', name: 'Modern', category: 'Storefront', icon: '✨', description: 'Bold contemporary design with gradient accents.', image: '/template-previews/modern.png', colors: { primary: '#f8fafc', secondary: '#ffffff', accent: '#6366f1' }, features: ['Gradient hero', 'Bold typography', 'Rounded cards', 'Purple accents'] },
    // New Industry/Niche templates
    { id: 'sports', name: 'Sports', category: 'Storefront', icon: '🏀', description: 'Athletic gear store with energetic dark theme.', image: '/template-previews/sports.svg', colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#22c55e' }, features: ['Dark theme', 'Bold typography', 'Sports grid', 'Energetic design'] },
    { id: 'books', name: 'Bookstore', category: 'Storefront', icon: '📚', description: 'Cozy bookstore with warm amber tones.', image: '/template-previews/books.svg', colors: { primary: '#1c1917', secondary: '#292524', accent: '#d97706' }, features: ['Warm theme', 'Literary feel', 'Book grid', 'Cozy aesthetics'] },
    { id: 'pets', name: 'Pet Supplies', category: 'Storefront', icon: '🐾', description: 'Playful pet store with warm friendly colors.', image: '/template-previews/pets.svg', colors: { primary: '#fef3c7', secondary: '#fef9c3', accent: '#f59e0b' }, features: ['Playful design', 'Pet-friendly', 'Warm colors', 'Fun layout'] },
    { id: 'toys', name: 'Toys', category: 'Storefront', icon: '🎮', description: 'Colorful toy store with playful design.', image: '/template-previews/toys.svg', colors: { primary: '#fdf4ff', secondary: '#fae8ff', accent: '#d946ef' }, features: ['Colorful', 'Playful', 'Kid-friendly', 'Fun animations'] },
    { id: 'garden', name: 'Garden', category: 'Storefront', icon: '🌿', description: 'Fresh garden store with natural green theme.', image: '/template-previews/garden.svg', colors: { primary: '#f0fdf4', secondary: '#ecfdf5', accent: '#22c55e' }, features: ['Natural theme', 'Fresh design', 'Green accents', 'Organic feel'] },
    { id: 'art', name: 'Art Gallery', category: 'Storefront', icon: '🎨', description: 'Minimal art gallery with clean white space.', image: '/template-previews/art.svg', colors: { primary: '#fafafa', secondary: '#ffffff', accent: '#18181b' }, features: ['Gallery layout', 'Minimal design', 'Art focus', 'Clean space'] },
    { id: 'music', name: 'Music', category: 'Storefront', icon: '🎵', description: 'Dark music store with purple accents.', image: '/template-previews/music.svg', colors: { primary: '#18181b', secondary: '#27272a', accent: '#a855f7' }, features: ['Dark theme', 'Music vibes', 'Purple accents', 'Modern look'] },
    { id: 'health', name: 'Health', category: 'Storefront', icon: '💊', description: 'Clean pharmacy store with fresh green theme.', image: '/template-previews/health.svg', colors: { primary: '#ecfdf5', secondary: '#f0fdf4', accent: '#10b981' }, features: ['Clean design', 'Health focus', 'Trust colors', 'Professional'] },
    { id: 'watches', name: 'Watches', category: 'Storefront', icon: '⌚', description: 'Luxury watch store with dark gold theme.', image: '/template-previews/watches.svg', colors: { primary: '#0c0a09', secondary: '#1c1917', accent: '#d4af37' }, features: ['Luxury feel', 'Gold accents', 'Dark elegance', 'Premium look'] },
    { id: 'shoes', name: 'Shoes', category: 'Storefront', icon: '👟', description: 'Trendy shoe store with orange accents.', image: '/template-previews/shoes.svg', colors: { primary: '#fafaf9', secondary: '#f5f5f4', accent: '#ea580c' }, features: ['Trendy design', 'Orange accents', 'Modern grid', 'Fashion focus'] },
    { id: 'gaming', name: 'Gaming', category: 'Storefront', icon: '🎮', description: 'Cyberpunk gaming store with neon accents.', image: '/template-previews/gaming.svg', colors: { primary: '#0f0f23', secondary: '#1a1a2e', accent: '#06b6d4' }, features: ['Cyberpunk theme', 'Neon accents', 'Gaming vibes', 'Dark design'] },
    { id: 'automotive', name: 'Automotive', category: 'Storefront', icon: '🚗', description: 'Auto parts store with bold red accents.', image: '/template-previews/automotive.svg', colors: { primary: '#1a1a1a', secondary: '#262626', accent: '#dc2626' }, features: ['Bold design', 'Red accents', 'Auto theme', 'Dark background'] },
    { id: 'crafts', name: 'Handmade', category: 'Storefront', icon: '🧶', description: 'Warm handmade craft store with artisan feel.', image: '/template-previews/crafts.svg', colors: { primary: '#fffbeb', secondary: '#fef3c7', accent: '#f59e0b' }, features: ['Artisan feel', 'Warm colors', 'Handmade vibes', 'Cozy design'] },
    { id: 'outdoor', name: 'Outdoor', category: 'Storefront', icon: '🏕️', description: 'Adventure outdoor store with forest theme.', image: '/template-previews/outdoor.svg', colors: { primary: '#14532d', secondary: '#166534', accent: '#4ade80' }, features: ['Nature theme', 'Forest colors', 'Adventure feel', 'Outdoor vibes'] },
    { id: 'vintage', name: 'Vintage', category: 'Storefront', icon: '🕰️', description: 'Antique store with classic cream tones.', image: '/template-previews/vintage.svg', colors: { primary: '#faf5f0', secondary: '#f5ebe0', accent: '#92400e' }, features: ['Vintage feel', 'Antique style', 'Warm tones', 'Classic look'] },
    { id: 'tech', name: 'Tech', category: 'Storefront', icon: '💻', description: 'Modern tech store with cyan accents.', image: '/template-previews/tech.svg', colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#06b6d4' }, features: ['Tech theme', 'Modern design', 'Cyan accents', 'Dark mode'] },
    { id: 'organic', name: 'Organic', category: 'Storefront', icon: '🥬', description: 'Natural organic store with fresh green theme.', image: '/template-previews/organic.svg', colors: { primary: '#f0fdf4', secondary: '#ecfdf5', accent: '#16a34a' }, features: ['Organic feel', 'Natural colors', 'Fresh design', 'Eco-friendly'] },
    { id: 'luxury', name: 'Luxury', category: 'Storefront', icon: '👑', description: 'Ultra-luxury store with black and gold.', image: '/template-previews/luxury.svg', colors: { primary: '#0a0a0a', secondary: '#171717', accent: '#d4af37' }, features: ['Luxury theme', 'Gold accents', 'Premium feel', 'Elegant design'] },
    { id: 'kids', name: 'Kids', category: 'Storefront', icon: '🧸', description: 'Colorful kids store with playful pink theme.', image: '/template-previews/kids.svg', colors: { primary: '#fdf2f8', secondary: '#fce7f3', accent: '#ec4899' }, features: ['Kid-friendly', 'Playful colors', 'Fun design', 'Pink theme'] },
    { id: 'travel', name: 'Travel', category: 'Storefront', icon: '✈️', description: 'Adventure travel store with teal theme.', image: '/template-previews/travel.svg', colors: { primary: '#0f766e', secondary: '#14b8a6', accent: '#5eead4' }, features: ['Travel theme', 'Teal colors', 'Adventure feel', 'Wanderlust design'] },
    { id: 'photography', name: 'Photography', category: 'Storefront', icon: '📷', description: 'Minimal dark photography store.', image: '/template-previews/photography.svg', colors: { primary: '#171717', secondary: '#262626', accent: '#ffffff' }, features: ['Dark theme', 'Minimal design', 'Photo focus', 'Gallery style'] },
    { id: 'wedding', name: 'Wedding', category: 'Storefront', icon: '💒', description: 'Elegant wedding store with soft pink theme.', image: '/template-previews/wedding.svg', colors: { primary: '#fdf2f8', secondary: '#fce7f3', accent: '#ec4899' }, features: ['Romantic feel', 'Soft colors', 'Wedding theme', 'Elegant design'] },
    { id: 'fitness', name: 'Fitness', category: 'Storefront', icon: '💪', description: 'High-energy fitness store with orange accents.', image: '/template-previews/fitness.svg', colors: { primary: '#18181b', secondary: '#27272a', accent: '#f97316' }, features: ['Energetic', 'Bold design', 'Fitness vibes', 'Dark theme'] },
    { id: 'gifts', name: 'Gift Shop', category: 'Storefront', icon: '🎁', description: 'Festive gift store with red theme.', image: '/template-previews/gifts.svg', colors: { primary: '#fef2f2', secondary: '#fee2e2', accent: '#dc2626' }, features: ['Festive feel', 'Gift theme', 'Red accents', 'Celebration design'] },
    { id: 'candles', name: 'Candles', category: 'Storefront', icon: '🕯️', description: 'Cozy candle store with dark amber theme.', image: '/template-previews/candles.svg', colors: { primary: '#1c1917', secondary: '#292524', accent: '#f59e0b' }, features: ['Cozy feel', 'Amber glow', 'Dark theme', 'Warm design'] },
    { id: 'skincare', name: 'Skincare', category: 'Storefront', icon: '🧴', description: 'Clean skincare store with purple accents.', image: '/template-previews/skincare.svg', colors: { primary: '#faf5ff', secondary: '#f3e8ff', accent: '#a855f7' }, features: ['Clean design', 'Purple theme', 'Skincare focus', 'Soft aesthetics'] },
    { id: 'supplements', name: 'Supplements', category: 'Storefront', icon: '💪', description: 'Health supplement store with green theme.', image: '/template-previews/supplements.svg', colors: { primary: '#ecfdf5', secondary: '#d1fae5', accent: '#10b981' }, features: ['Health focus', 'Green theme', 'Clean design', 'Trust colors'] },
    { id: 'phone-accessories', name: 'Phone Accessories', category: 'Storefront', icon: '📱', description: 'Modern phone accessories with blue theme.', image: '/template-previews/phone-accessories.svg', colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#3b82f6' }, features: ['Tech theme', 'Blue accents', 'Modern design', 'Accessory focus'] },
    { id: 'tools', name: 'Tools', category: 'Storefront', icon: '🔧', description: 'Hardware tool store with orange accents.', image: '/template-previews/tools.svg', colors: { primary: '#292524', secondary: '#44403c', accent: '#ea580c' }, features: ['Industrial feel', 'Orange accents', 'Tool focus', 'Dark theme'] },
    { id: 'office', name: 'Office', category: 'Storefront', icon: '🏢', description: 'Professional office supplies with blue theme.', image: '/template-previews/office.svg', colors: { primary: '#f8fafc', secondary: '#f1f5f9', accent: '#2563eb' }, features: ['Professional', 'Blue theme', 'Clean design', 'Office focus'] },
    { id: 'stationery', name: 'Stationery', category: 'Storefront', icon: '✏️', description: 'Creative stationery store with yellow theme.', image: '/template-previews/stationery.svg', colors: { primary: '#fefce8', secondary: '#fef9c3', accent: '#eab308' }, features: ['Creative feel', 'Yellow theme', 'Stationery focus', 'Bright design'] },
    // Style/Design templates
    { id: 'neon', name: 'Neon', category: 'Storefront', icon: '🌈', description: 'Cyberpunk neon store with glowing accents.', image: '/template-previews/neon.svg', colors: { primary: '#0a0a0a', secondary: '#171717', accent: '#ec4899' }, features: ['Neon glow', 'Cyberpunk', 'Dark theme', 'Vibrant accents'] },
    { id: 'pastel', name: 'Pastel', category: 'Storefront', icon: '🎀', description: 'Soft pastel store with dreamy gradients.', image: '/template-previews/pastel.svg', colors: { primary: '#fdf2f8', secondary: '#faf5ff', accent: '#a78bfa' }, features: ['Soft colors', 'Pastel theme', 'Dreamy feel', 'Gradient accents'] },
    { id: 'monochrome', name: 'Monochrome', category: 'Storefront', icon: '⬛', description: 'Minimal black and white design.', image: '/template-previews/monochrome.svg', colors: { primary: '#ffffff', secondary: '#fafafa', accent: '#000000' }, features: ['B&W theme', 'Minimal design', 'Clean lines', 'Typography focus'] },
    { id: 'gradient', name: 'Gradient', category: 'Storefront', icon: '🌅', description: 'Colorful gradient store with vibrant colors.', image: '/template-previews/gradient.svg', colors: { primary: '#4f46e5', secondary: '#7c3aed', accent: '#ec4899' }, features: ['Gradient theme', 'Vibrant colors', 'Bold design', 'Modern feel'] },
    { id: 'florist', name: 'Florist', category: 'Storefront', icon: '💐', description: 'Elegant flower shop with pink theme.', image: '/template-previews/florist.svg', colors: { primary: '#fdf2f8', secondary: '#fce7f3', accent: '#db2777' }, features: ['Floral theme', 'Pink accents', 'Elegant design', 'Soft aesthetics'] },
    { id: 'eyewear', name: 'Eyewear', category: 'Storefront', icon: '👓', description: 'Minimal eyewear store with neutral tones.', image: '/template-previews/eyewear.svg', colors: { primary: '#f5f5f4', secondary: '#e7e5e4', accent: '#78716c' }, features: ['Neutral tones', 'Minimal design', 'Eyewear focus', 'Clean layout'] },
    { id: 'lingerie', name: 'Lingerie', category: 'Storefront', icon: '🩱', description: 'Elegant lingerie store with dark pink theme.', image: '/template-previews/lingerie.svg', colors: { primary: '#1a1a1a', secondary: '#262626', accent: '#f472b6' }, features: ['Elegant feel', 'Dark theme', 'Pink accents', 'Intimate design'] },
    { id: 'swimwear', name: 'Swimwear', category: 'Storefront', icon: '🏖️', description: 'Vibrant beach store with cyan theme.', image: '/template-previews/swimwear.svg', colors: { primary: '#06b6d4', secondary: '#22d3ee', accent: '#ffffff' }, features: ['Beach vibes', 'Cyan theme', 'Summer feel', 'Bright design'] },
    { id: 'streetwear', name: 'Streetwear', category: 'Storefront', icon: '🧢', description: 'Urban streetwear with dark yellow accents.', image: '/template-previews/streetwear.svg', colors: { primary: '#18181b', secondary: '#27272a', accent: '#facc15' }, features: ['Urban feel', 'Streetwear vibes', 'Bold design', 'Dark theme'] },
    { id: 'wine', name: 'Wine', category: 'Storefront', icon: '🍷', description: 'Elegant wine store with dark red theme.', image: '/template-previews/wine.svg', colors: { primary: '#1c1917', secondary: '#292524', accent: '#991b1b' }, features: ['Wine theme', 'Dark elegance', 'Red accents', 'Luxury feel'] },
    { id: 'chocolate', name: 'Chocolate', category: 'Storefront', icon: '🍫', description: 'Warm chocolate store with brown theme.', image: '/template-previews/chocolate.svg', colors: { primary: '#292524', secondary: '#44403c', accent: '#d97706' }, features: ['Chocolate theme', 'Warm colors', 'Sweet design', 'Cozy feel'] },
    { id: 'tea', name: 'Tea & Coffee', category: 'Storefront', icon: '🍵', description: 'Fresh tea store with green theme.', image: '/template-previews/tea.svg', colors: { primary: '#f0fdf4', secondary: '#dcfce7', accent: '#166534' }, features: ['Tea theme', 'Green colors', 'Fresh design', 'Natural feel'] },
    { id: 'pro', name: 'Pro (Professional)', category: 'Storefront', icon: '🏢', description: 'Professional premium storefront with split hero + sidebar layout.', image: '/template-previews/pro.svg', colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#2563eb' }, features: ['Sticky header', 'Split hero', 'Sidebar layout', 'Featured strip + grid'] },
    { id: 'pro-aurora', name: 'Pro Aurora', category: 'Storefront', icon: '🌌', description: 'Premium “futuristic glass” storefront variant.', image: '/template-previews/pro-aurora.svg', colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#22d3ee' }, features: ['Glass hero', 'Feature rail', 'Editorial grid', 'Pro layout'] },
    { id: 'pro-vertex', name: 'Pro Vertex', category: 'Storefront', icon: '🔷', description: 'Sharp, high-contrast professional variant.', image: '/template-previews/pro-vertex.svg', colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#a78bfa' }, features: ['Dense header', 'Split layout', 'Compact cards', 'Pro layout'] },
    { id: 'pro-atelier', name: 'Pro Atelier', category: 'Storefront', icon: '🧵', description: 'Editorial, luxury-inspired professional variant.', image: '/template-previews/pro-atelier.svg', colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#f59e0b' }, features: ['Editorial hero', 'Showcase section', 'Large cards', 'Pro layout'] },
    { id: 'pro-orbit', name: 'Pro Orbit', category: 'Storefront', icon: '🪐', description: 'Modern, spacious pro variant with “orbit” layout.', image: '/template-previews/pro-orbit.svg', colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#34d399' }, features: ['Wide hero', 'Sectioned layout', 'Balanced grid', 'Pro layout'] },
    { id: 'pro-zen', name: 'Pro Zen', category: 'Storefront', icon: '🧘', description: 'Minimal calm professional variant with clean rhythm.', image: '/template-previews/pro-zen.svg', colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#60a5fa' }, features: ['Quiet hero', 'Minimal chrome', 'Clean grid', 'Pro layout'] },
    { id: 'pro-studio', name: 'Pro Studio', category: 'Storefront', icon: '🎛️', description: 'Studio-style professional variant with strong hierarchy.', image: '/template-previews/pro-studio.svg', colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#fb7185' }, features: ['Strong hero', 'Feature blocks', 'Showcase grid', 'Pro layout'] },
    { id: 'pro-mosaic', name: 'Pro Mosaic', category: 'Storefront', icon: '🧩', description: 'Mosaic grid professional variant with mixed card sizes.', image: '/template-previews/pro-mosaic.svg', colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#f472b6' }, features: ['Mosaic cards', 'Mixed sizes', 'Modern spacing', 'Pro layout'] },
    { id: 'pro-grid', name: 'Pro Grid', category: 'Storefront', icon: '🟦', description: 'Clean grid-first pro variant for catalogs.', image: '/template-previews/pro-grid.svg', colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#38bdf8' }, features: ['Grid-first', 'Filters-ready layout', 'Compact cards', 'Pro layout'] },
    { id: 'pro-catalog', name: 'Pro Catalog', category: 'Storefront', icon: '📚', description: 'Catalog-heavy pro variant with strong navigation.', image: '/template-previews/pro-catalog.svg', colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#c084fc' }, features: ['Catalog header', 'Collections layout', 'Dense grid', 'Pro layout'] },
    // Screenshot-inspired templates - Batch 1 (Green/Sage)
    { id: 'sage-boutique', name: 'Sage Boutique', category: 'Storefront', icon: '🌿', description: 'Elegant sage green boutique with serif typography.', image: '/template-previews/sage-boutique.svg', colors: { primary: '#e8efe8', secondary: '#ffffff', accent: '#4a7c59' }, features: ['Sage theme', 'Newsletter section', 'Elegant typography', 'Soft design'] },
    { id: 'mint-elegance', name: 'Mint Elegance', category: 'Storefront', icon: '🍃', description: 'Fresh mint green store with stats and testimonials.', image: '/template-previews/mint-elegance.svg', colors: { primary: '#f0f7f4', secondary: '#ffffff', accent: '#3d9970' }, features: ['Mint theme', 'Stats bar', 'Testimonials', 'Two-column hero'] },
    { id: 'forest-store', name: 'Forest Store', category: 'Storefront', icon: '🌲', description: 'Dark forest green eco-friendly store.', image: '/template-previews/forest-store.svg', colors: { primary: '#1a2e1a', secondary: '#243824', accent: '#7cb87c' }, features: ['Dark forest', 'Eco theme', 'Organic shapes', 'Nature vibes'] },
    // Screenshot-inspired templates - Batch 2 (Orange/Coral)
    { id: 'sunset-shop', name: 'Sunset Shop', category: 'Storefront', icon: '🌅', description: 'Clean white store with orange accents and trust badges.', image: '/template-previews/sunset-shop.svg', colors: { primary: '#ffffff', secondary: '#f9fafb', accent: '#f97316' }, features: ['Orange accents', 'Trust badges', 'Clean layout', 'Category pills'] },
    { id: 'coral-market', name: 'Coral Market', category: 'Storefront', icon: '🌸', description: 'Pink-tinted market with search and wishlist features.', image: '/template-previews/coral-market.svg', colors: { primary: '#fff5f5', secondary: '#ffffff', accent: '#f472b6' }, features: ['Coral pink', 'Search bar', 'Wishlist buttons', 'Modern layout'] },
    { id: 'amber-store', name: 'Amber Store', category: 'Storefront', icon: '🔶', description: 'Elegant amber gold catalog with serif typography.', image: '/template-previews/amber-store.svg', colors: { primary: '#fffbf5', secondary: '#ffffff', accent: '#d97706' }, features: ['Amber gold', 'Serif fonts', 'Elegant catalog', 'Large hero'] },
    // Screenshot-inspired templates - Batch 3 (Magenta/Pink)
    { id: 'magenta-mall', name: 'Magenta Mall', category: 'Storefront', icon: '🛍️', description: 'Marketplace layout with sidebar and promo banners.', image: '/template-previews/magenta-mall.svg', colors: { primary: '#f3f4f6', secondary: '#ffffff', accent: '#db2777' }, features: ['Sidebar nav', 'Promo banners', 'Dense grid', 'Sale badges'] },
    { id: 'berry-market', name: 'Berry Market', category: 'Storefront', icon: '🫐', description: 'Purple-tinted market with category tiles and flash deals.', image: '/template-previews/berry-market.svg', colors: { primary: '#faf5ff', secondary: '#ffffff', accent: '#7c3aed' }, features: ['Berry purple', 'Category tiles', 'Flash deals', 'Gradient hero'] },
    { id: 'rose-catalog', name: 'Rose Catalog', category: 'Storefront', icon: '🌹', description: 'Rose pink catalog with filters and wishlist hearts.', image: '/template-previews/rose-catalog.svg', colors: { primary: '#fff1f2', secondary: '#ffffff', accent: '#e11d48' }, features: ['Rose pink', 'Filter dropdowns', 'NEW badges', 'Clean catalog'] },
    // Screenshot-inspired templates - Batch 4 (Lime/Green)
    { id: 'lime-direct', name: 'Lime Direct', category: 'Landing Pages', icon: '💚', description: 'Bright lime green direct sales with quick order form.', image: '/template-previews/lime-direct.svg', colors: { primary: '#f0fdf4', secondary: '#ffffff', accent: '#22c55e' }, features: ['Lime green', 'Quick order', 'Feature badges', 'Direct sales'] },
    { id: 'emerald-shop', name: 'Emerald Shop', category: 'Storefront', icon: '💎', description: 'Rich emerald theme with feature highlights and testimonials.', image: '/template-previews/emerald-shop.svg', colors: { primary: '#ecfdf5', secondary: '#ffffff', accent: '#059669' }, features: ['Emerald green', 'Feature cards', 'Testimonial', 'Stats hero'] },
    { id: 'neon-store', name: 'Neon Store', category: 'Storefront', icon: '🔋', description: 'Electric neon green on dark with glowing effects.', image: '/template-previews/neon-store.svg', colors: { primary: '#0a0a0a', secondary: '#141414', accent: '#00ff88' }, features: ['Neon green', 'Dark theme', 'Glow effects', 'Tech style'] },
    // Screenshot-inspired templates - Batch 5 (Clean/Minimal)
    { id: 'clean-single', name: 'Clean Single', category: 'Landing Pages', icon: '⬜', description: 'Ultra-minimal single product focus with clean order form.', image: '/template-previews/clean-single.svg', colors: { primary: '#ffffff', secondary: '#fafafa', accent: '#3b82f6' }, features: ['Single focus', 'Clean form', 'Feature list', 'Minimal design'] },
    { id: 'pure-product', name: 'Pure Product', category: 'Landing Pages', icon: '✨', description: 'Product-centric with sticky mobile CTA.', image: '/template-previews/pure-product.svg', colors: { primary: '#fefefe', secondary: '#f5f5f5', accent: '#0066ff' }, features: ['Product focus', 'Sticky CTA', 'Specs table', 'Apple-like'] },
    { id: 'snow-shop', name: 'Snow Shop', category: 'Storefront', icon: '❄️', description: 'Crisp white with soft shadows and card layout.', image: '/template-previews/snow-shop.svg', colors: { primary: '#f8fafc', secondary: '#ffffff', accent: '#6366f1' }, features: ['Snow white', 'Soft shadows', 'Card layout', 'Newsletter'] },
    // Screenshot-inspired templates - Batch 6 (Gallery)
    { id: 'gallery-pro', name: 'Gallery Pro', category: 'Landing Pages', icon: '🖼️', description: 'Image gallery focused with thumbnail navigation.', image: '/template-previews/gallery-pro.svg', colors: { primary: '#ffffff', secondary: '#fafafa', accent: '#2563eb' }, features: ['Gallery view', 'Thumbnails', 'Quick order', 'Many images'] },
    { id: 'showcase-plus', name: 'Showcase Plus', category: 'Landing Pages', icon: '🎯', description: 'Multi-image showcase with carousel and color variants.', image: '/template-previews/showcase-plus.svg', colors: { primary: '#faf9f7', secondary: '#ffffff', accent: '#ea580c' }, features: ['Image carousel', 'Color options', 'Reviews', 'Promo banner'] },
    { id: 'exhibit-store', name: 'Exhibit Store', category: 'Landing Pages', icon: '🏛️', description: 'Museum-style exhibition with floating info card.', image: '/template-previews/exhibit-store.svg', colors: { primary: '#f5f5f4', secondary: '#ffffff', accent: '#0d9488' }, features: ['Exhibition style', 'Large images', 'Serif fonts', 'Elegant inquiry'] },
    { id: 'pro-landing', name: 'Pro Landing', category: 'Landing Pages', icon: '🚀', description: 'Professional one-product landing page (story → proof → FAQ → buy).', image: '/template-previews/pro-landing.svg', colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#2563eb' }, features: ['Split hero', 'Trust badges', 'FAQ section', 'Sticky buy bar'] },
    { id: 'focus-one', name: 'Focus One', category: 'Landing Pages', icon: '🎯', description: 'High-conversion single-product landing with sticky CTA and upsells.', image: '/template-previews/focus-one.svg', colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#22c55e' }, features: ['Split hero', 'Sticky CTA', 'Trust badges', 'Optional upsells'] },
    { id: 'split-specs', name: 'Split Specs', category: 'Landing Pages', icon: '📋', description: 'Detail-first one-product page with specs + FAQ emphasis.', image: '/template-previews/split-specs.svg', colors: { primary: '#ffffff', secondary: '#f8fafc', accent: '#2563eb' }, features: ['Specs section', 'FAQ blocks', 'Clean layout', 'Optional upsells'] },
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

  const categories = Array.from(new Set(templates.map((t) => t.category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const visibleTemplates = activeCategory === 'All'
    ? templates
    : templates.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="text-sm font-medium">{t('templates.quickTipTitle') || 'Quick tip'}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {t('templates.quickTipDesc') || 'Pick a template you like, click Switch, then choose whether to import your hero text/colors.'}
        </div>
      </div>

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

            {switchError && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-md">
                {switchError}
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

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 rounded-full text-sm border transition ${
            activeCategory === 'All'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCategory(c)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              activeCategory === c
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Template Carousel - Infinite scroll */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 p-3">
        <style>{`
          @keyframes scrollCarousel {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .carousel-track {
            display: flex;
            gap: 12px;
            animation: scrollCarousel 30s linear infinite;
          }
          .carousel-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        <div className="carousel-track" style={{ width: 'fit-content' }}>
          {/* Double the templates for seamless loop */}
          {[...visibleTemplates, ...visibleTemplates].map((template, idx) => (
            <button
              key={`${template.id}-${idx}`}
              onClick={() => setPreviewTemplateId(template.id)}
              className={`flex-shrink-0 w-24 rounded-md border-2 transition-all overflow-hidden hover:scale-105 hover:z-10 ${
                currentTemplateId === normalizeTemplateId(template.id)
                  ? 'border-blue-500 ring-2 ring-blue-400 shadow-lg shadow-blue-500/30'
                  : 'border-slate-600 hover:border-slate-400'
              }`}
            >
              <div className="relative h-28 bg-slate-800 overflow-hidden">
                {!brokenImages[getImageKey(template.id, 'carousel')] ? (
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover object-top"
                    onError={() =>
                      setBrokenImages((prev) => ({
                        ...prev,
                        [getImageKey(template.id, 'carousel')]: true,
                      }))
                    }
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full flex-col gap-2 bg-slate-700">
                    <div className="text-2xl">{template.icon}</div>
                  </div>
                )}
                {/* Selected indicator */}
                {currentTemplateId === normalizeTemplateId(template.id) && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg">
                    ✓
                  </div>
                )}
              </div>
              <div className="p-1 bg-slate-800/90 backdrop-blur text-center">
                <h4 className="text-xs font-semibold text-white truncate">{template.name}</h4>
              </div>
            </button>
          ))}
        </div>
      </div>

      {isPreviewingDifferentTemplate && (
        <div className="mt-3 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{templates.find((t) => normalizeTemplateId(t.id) === normalizeTemplateId(previewTemplateId))?.icon}</span>
                <div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Previewing Template</div>
                  <div className="font-bold text-lg text-slate-900 dark:text-white">{previewTemplateName}</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                {templates.find((t) => normalizeTemplateId(t.id) === normalizeTemplateId(previewTemplateId))?.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {templates.find((t) => normalizeTemplateId(t.id) === normalizeTemplateId(previewTemplateId))?.features.slice(0, 4).map((f, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">{f}</span>
                ))}
              </div>
            </div>
            {/* Preview Image */}
            <div className="shrink-0 w-32 h-40 rounded-md overflow-hidden border border-slate-200 dark:border-slate-600 shadow-md">
              {!brokenImages[getImageKey(previewTemplateId || '', 'carousel')] ? (
                <img
                  src={templates.find((t) => normalizeTemplateId(t.id) === normalizeTemplateId(previewTemplateId))?.image}
                  alt="Template preview"
                  className="w-full h-full object-cover object-top"
                  onError={() => previewTemplateId && setBrokenImages((prev) => ({ ...prev, [getImageKey(previewTemplateId, 'carousel')]: true }))}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-slate-100 dark:bg-slate-700">
                  <span className="text-4xl">{templates.find((t) => normalizeTemplateId(t.id) === normalizeTemplateId(previewTemplateId))?.icon}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
            <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => previewTemplateId && openTemplateSwitch(previewTemplateId)}>
              Use This Template
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setPreviewTemplateId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Quick Select Grid - Compact view */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-1.5 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
        {visibleTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => setPreviewTemplateId(template.id)}
            className={`text-left rounded-md border-2 transition-all overflow-hidden hover:shadow-md ${
              currentTemplateId === normalizeTemplateId(template.id)
                ? 'border-blue-500 shadow-lg ring-1 ring-blue-400 ring-offset-1 dark:ring-offset-slate-900 bg-blue-50 dark:bg-slate-700'
                : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
            }`}
          >
            <div className="relative aspect-[4/5] bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
              {!brokenImages[getImageKey(template.id, 'grid')] ? (
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover object-top"
                  onError={() =>
                    setBrokenImages((prev) => ({
                      ...prev,
                      [getImageKey(template.id, 'grid')]: true,
                    }))
                  }
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full flex-col gap-1 bg-slate-100 dark:bg-slate-700">
                  <div className="text-lg">{template.icon}</div>
                </div>
              )}
              {currentTemplateId === normalizeTemplateId(template.id) && (
                <div className="absolute top-0.5 right-0.5 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow">
                  ✓
                </div>
              )}
            </div>
            <div className="px-1 py-0.5 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 border-t border-slate-200 dark:border-slate-600">
              <h4 className="text-[10px] font-semibold text-slate-900 dark:text-white truncate text-center">{template.name}</h4>
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
