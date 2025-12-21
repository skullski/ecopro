# Template Conversion Deep Dive - Step by Step

## Example: Converting fashion.html to fashion.tsx ✅

This is what was already done. Here's how to replicate for other templates.

### Step 1: Analyze HTML Structure

**Extract from fashion.html**:
```javascript
const IMAGE = "https://...";  // Hardcoded image

const allProducts = [         // Hardcoded product array
  {
    id: 1,
    name: "Structured Wool Coat",
    gender: "Women",
    category: "Outerwear",
    fit: "Oversized",
    color: "Black",
    price: 32000,
  },
  // ... more products
];

const looks = [               // Hardcoded looks/outfits
  {
    id: "look1",
    title: "Late-night city layers",
    caption: "Wool coat · relaxed trouser · canvas sneaker",
  },
  // ... more looks
];
```

### Step 2: Define TypeScript Interfaces

```typescript
// Extract what the data should look like
interface Product {
  id: number;
  name: string;
  gender: string;
  category: string;
  fit: string;
  color: string;
  price: number;
  image?: string;  // Add optional image field
}

interface Look {
  id: string;
  title: string;
  caption: string;
  image?: string;  // Add optional image field
}

interface TemplateFashionData {
  storeImage: string;
  storeName: string;
  products: Product[];
  looks: Look[];
  genders?: string[];
  categories?: string[];
  fits?: string[];
}

interface TemplateFashionSettings {
  heroHeading: string;
  heroSubtitle: string;
  ctaButtonText: string;
  brandName: string;
  currencySymbol: string;
  accentColor: string;
}
```

### Step 3: Create React Component

```typescript
import React, { useState, useMemo } from 'react';
import { useTemplateData, useTemplateSettings } from '../../hooks/useTemplateData';

export default function FashionTemplate() {
  // 1. Load data from window
  const data = useTemplateData<TemplateFashionData>();
  const settings = useTemplateSettings<TemplateFashionSettings>();

  // 2. Extract with defaults
  const storeImage = data?.storeImage || 'https://default-image.jpg';
  const storeName = data?.storeName || 'Store Name';
  const products = data?.products || [];
  const looks = data?.looks || [];
  const genders = data?.genders || ['Women', 'Men', 'Essentials'];
  const categories = data?.categories || ['All', 'Outerwear', 'Tops', 'Bottoms', 'Footwear'];
  const fits = data?.fits || ['All', 'Oversized', 'Relaxed', 'Regular', 'Boxy'];

  const heroHeading = settings?.heroHeading || 'Build a wardrobe that behaves like software.';
  const heroSubtitle = settings?.heroSubtitle || 'Fewer pieces, more combinations...';
  const ctaButtonText = settings?.ctaButtonText || 'Browse collection';
  const accentColor = settings?.accentColor || '#f97316';
  const currencySymbol = settings?.currencySymbol || 'DZD';

  // 3. Component state
  const [activeGender, setActiveGender] = useState('Women');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [fitFilter, setFitFilter] = useState('All');

  // 4. Computed values
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeGender !== 'All' && p.gender !== activeGender) return false;
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (fitFilter !== 'All' && p.fit !== fitFilter) return false;
      return true;
    });
  }, [products, activeGender, categoryFilter, fitFilter]);

  // 5. Render JSX (convert from HTML)
  return (
    <div className="min-h-screen bg-black text-zinc-50">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-black/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="text-xs tracking-widest uppercase">{storeName}</div>
          <nav className="hidden md:flex gap-5 text-[11px] text-zinc-400">
            <button>New</button>
            <button>Collections</button>
            <button>Wardrobe builder</button>
          </nav>
          <div className="flex gap-3 text-[11px] text-zinc-400">
            <span>Account</span>
            <span>Bag (0)</span>
          </div>
        </div>
      </header>

      {/* HERO - Dynamic background */}
      <section
        className="hero relative min-h-[70vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${storeImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40"></div>
        <div className="relative max-w-6xl mx-auto px-6 h-full flex items-end pb-14 min-h-[70vh]">
          <div className="max-w-lg">
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-zinc-50 mb-3">
              {heroHeading}
            </h1>
            <p className="text-sm text-zinc-300 max-w-md mb-4">
              {heroSubtitle}
            </p>
            <button 
              className="text-[11px] uppercase tracking-wide px-5 py-2 rounded-full border transition"
              style={{
                borderColor: accentColor,
                color: accentColor,
              }}
            >
              {ctaButtonText}
            </button>
          </div>
        </div>
      </section>

      {/* REST OF TEMPLATE... */}
    </div>
  );
}
```

### Step 4: Create Settings Component

```typescript
import React, { useState, useEffect } from 'react';

interface Settings {
  heroHeading: string;
  heroSubtitle: string;
  ctaButtonText: string;
  brandName: string;
  currencySymbol: string;
  accentColor: string;
}

const defaultSettings: Settings = {
  heroHeading: 'Build a wardrobe that behaves like software.',
  heroSubtitle: 'Fewer pieces, more combinations. Coats, trousers, and layers designed to work in any city, any season.',
  ctaButtonText: 'Browse collection',
  brandName: 'WardrobeOS',
  currencySymbol: 'DZD',
  accentColor: '#f97316',
};

export default function FashionSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load from window if available
  useEffect(() => {
    const windowSettings = (window as any).TEMPLATE_SETTINGS;
    if (windowSettings) {
      setSettings(prev => ({ ...prev, ...windowSettings }));
    }
  }, []);

  const handleChange = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    (window as any).TEMPLATE_SETTINGS = settings;
    console.log('Settings saved:', settings);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-2">Fashion Template Settings</h1>
      
      {/* Hero Section Fields */}
      <div className="space-y-4 bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
          <input
            type="text"
            value={settings.brandName}
            onChange={(e) => handleChange('brandName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hero Heading</label>
          <textarea
            value={settings.heroHeading}
            onChange={(e) => handleChange('heroHeading', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
          <textarea
            value={settings.heroSubtitle}
            onChange={(e) => handleChange('heroSubtitle', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button Text</label>
          <input
            type="text"
            value={settings.ctaButtonText}
            onChange={(e) => handleChange('ctaButtonText', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Styling Section */}
      <div className="space-y-4 bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Styling</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => handleChange('accentColor', e.target.value)}
              className="h-10 w-20 rounded border"
            />
            <input
              type="text"
              value={settings.accentColor}
              onChange={(e) => handleChange('accentColor', e.target.value)}
              className="px-3 py-2 border rounded-md flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol</label>
          <input
            type="text"
            value={settings.currencySymbol}
            onChange={(e) => handleChange('currencySymbol', e.target.value)}
            maxLength={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full px-4 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600"
      >
        Save Settings
      </button>
    </div>
  );
}
```

### Step 5: Register in TemplateRegistry

```typescript
// Add to imports at top
import FashionTemplate from './templates/fashion';
import FashionSettings from '../pages/admin/TemplateSettings/FashionSettings';

// Add to TEMPLATES array
export const TEMPLATES: TemplateMetadata[] = [
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Premium fashion storefront with multi-filter system',
    category: 'apparel',
    preview: '/templates/fashion-preview.png',
    component: FashionTemplate,
    settingsComponent: FashionSettings,
  },
  // ... more templates
];
```

---

## Template-Specific Conversion Examples

### Example: Converting baby.html

**HTML Analysis**:
```javascript
// baby.html contains:
const allProducts = [
  {
    id: 1,
    name: "Organic Cotton Onesie",
    category: "Bodywear",
    ageRange: "0-3 months",
    price: 4500,
  },
  // ... more baby products
];
```

**TypeScript Interfaces**:
```typescript
interface BabyProduct {
  id: number;
  name: string;
  category: string;
  ageRange: string;
  price: number;
  image?: string;
}

interface BabyTemplateData {
  storeImage: string;
  storeName: string;
  products: BabyProduct[];
  featured?: BabyProduct[];
  categories?: string[];
}

interface BabySettings {
  heroHeading: string;
  heroSubtitle: string;
  ctaButtonText: string;
  brandName: string;
  currencySymbol: string;
  accentColor: string; // Warm amber
}
```

**Key Component Features**:
- Warm color scheme (amber/pink)
- Age range filtering
- Featured section
- Soft, rounded corners
- Centered layout

---

### Example: Converting electronics.html

**HTML Analysis**:
```javascript
// electronics.html contains:
const products = [
  {
    id: 1,
    name: "Pro Laptop",
    category: "Computers",
    brand: "TechCo",
    price: 1299,
    specs: ["16GB RAM", "512GB SSD"],
  },
  // ... more electronics
];
```

**TypeScript Interfaces**:
```typescript
interface ElectronicProduct {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  specs?: string[];
  image?: string;
}

interface ElectronicsData {
  storeImage: string;
  storeName: string;
  products: ElectronicProduct[];
  categories?: string[];
}

interface ElectronicsSettings {
  heroHeading: string;
  accentColor: string; // Cyan #38bdf8
  currencySymbol: string;
}
```

**Key Component Features**:
- Glassmorphism effects (blur)
- Tech aesthetic with cyan accents
- Category tabs
- Hero banner with glow
- Specs display

---

### Example: Converting perfume.html

**HTML Analysis**:
```javascript
// perfume.html contains:
const products = [
  {
    id: 1,
    name: "Aurora Noir 01",
    realm: "dark",     // Key: realm-based categorization
    realmLabel: "Realm I",
    family: "Amber",
    intensity: "Evening",
    notes: ["Amber", "Vanilla", "Smoke"],
    price: 28000,
  },
  // ... more fragrances
];

const filter = "all";  // or "dark", "gold", "art"
```

**TypeScript Interfaces**:
```typescript
interface PerfumeProduct {
  id: number;
  name: string;
  realm: string;       // 'dark', 'gold', 'art'
  realmLabel: string;
  family: string;      // 'Amber', 'Fresh', 'Woody', etc.
  intensity: string;   // 'Day', 'Evening', 'Night'
  notes: string[];     // Fragrance notes
  price: number;
  image?: string;
}

interface PerfumeData {
  storeImage: string;
  storeName: string;
  products: PerfumeProduct[];
}

interface PerfumeSettings {
  heroHeading: string;
  accentColor: string; // Amber #f59e0b
  currencySymbol: string;
}
```

**Key Component Features**:
- Realm-based filtering (3 categories)
- Fragrance notes display
- Hero-focused layout
- Dark premium aesthetic
- Intensity indicator

---

## Common Conversion Patterns

### Pattern 1: Simple Product Grid

```typescript
// Before (HTML)
const products = [{id: 1, name: "...", price: 100}];

// After (TSX)
const data = useTemplateData<any>();
const products = data?.products || [];

<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
  {products.map(p => (
    <ProductCard key={p.id} product={p} />
  ))}
</div>
```

### Pattern 2: Filter System

```typescript
// Before (HTML)
let filtered = products;
if (filter !== "all") {
  filtered = products.filter(p => p.category === filter);
}

// After (TSX)
const [filter, setFilter] = useState("all");

const filtered = useMemo(() => {
  if (filter === "all") return products;
  return products.filter(p => p.category === filter);
}, [products, filter]);
```

### Pattern 3: Dynamic Colors

```typescript
// Before (HTML)
const accentColor = "#f97316"; // Hardcoded

// After (TSX)
const accentColor = settings?.accentColor || "#f97316";

// Usage
<button style={{ borderColor: accentColor, color: accentColor }}>
  Click me
</button>
```

### Pattern 4: Carousel/Scroll

```typescript
// Before (HTML)
<div className="carousel">
  {items.map(item => <div key={item.id}>{item.title}</div>)}
</div>

// After (TSX)
<div className="carousel flex gap-4 overflow-x-auto pb-2">
  {items.map(item => (
    <div key={item.id} className="flex-shrink-0 min-w-[300px]">
      {item.title}
    </div>
  ))}
</div>
```

---

## TypeScript Best Practices for Templates

### 1. Always Define Interfaces
```typescript
// ❌ Bad
const data = useTemplateData();
const product = data.products[0]; // data might be null!

// ✅ Good
interface MyData {
  products: Product[];
}
const data = useTemplateData<MyData>();
const products = data?.products || [];
```

### 2. Use useMemo for Filters
```typescript
// ❌ Bad
const filtered = products.filter(...); // Recomputes every render

// ✅ Good
const filtered = useMemo(() => {
  return products.filter(...);
}, [products, filterCriteria]);
```

### 3. Provide Sensible Defaults
```typescript
// ❌ Bad
const accentColor = settings.accentColor; // Might be undefined

// ✅ Good
const accentColor = settings?.accentColor || '#default-color';
```

### 4. Type Settings Properly
```typescript
// ❌ Bad
const settings = (window as any).TEMPLATE_SETTINGS;

// ✅ Good
const settings = useTemplateSettings<MySettingsType>();
```

---

## Validation Checklist

Before marking template as complete:

- [ ] Component renders without errors
- [ ] `window.TEMPLATE_DATA` injection works
- [ ] `window.TEMPLATE_SETTINGS` customization works
- [ ] Defaults display when data missing
- [ ] All hardcoded strings moved to settings
- [ ] All hardcoded colors use accentColor
- [ ] Prices show currencySymbol
- [ ] Images use data with fallback
- [ ] Responsive on mobile (2-col or stacked)
- [ ] Responsive on desktop (3+ cols)
- [ ] Filters work correctly
- [ ] Settings page has all relevant fields
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Settings save to window object

---

## File Checklist for Each Template

For template `xyz`:

- [ ] `/client/components/templates/xyz.tsx` - Component
- [ ] `/client/pages/admin/TemplateSettings/XyzSettings.tsx` - Settings
- [ ] Entry in `/client/components/TemplateRegistry.ts` - Registration
- [ ] TypeScript interfaces defined in component
- [ ] Data hooks implemented
- [ ] Settings hooks implemented
- [ ] Tested with sample data

