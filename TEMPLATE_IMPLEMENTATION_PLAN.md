# Complete Template Conversion Implementation Guide

## What's Been Done ✅

1. **✅ Hook System** - `useTemplateData.ts` 
   - `useTemplateData<T>()` - reads window.TEMPLATE_DATA
   - `useTemplateSettings<T>()` - reads window.TEMPLATE_SETTINGS
   - `useTemplate<TData, TSettings>()` - gets both

2. **✅ Base Components**
   - `fashion.tsx` - Complete example implementation
   - `BaseTemplateSettings.tsx` - Reusable settings component
   - `FashionSettings.tsx` - Fashion-specific settings page

3. **✅ Registry** - Updated `TemplateRegistry.ts`
   - All 12 templates registered (components imported)
   - Helper functions: `getTemplate()`, `getTemplateComponent()`, `getTemplatesByCategory()`
   - Metadata for each template with categories

4. **✅ Documentation** - `TEMPLATE_CONVERSION_GUIDE.md`
   - Comprehensive overview of conversion approach
   - Data/settings structure patterns
   - Code organization

---

## What You Need to Do (11 Remaining Templates)

### Template Conversion Workflow

For each remaining template, follow these 4 steps:

#### Step 1: Analyze the HTML
- Identify the unique data structure (products, filters, etc.)
- Note the color scheme and accent colors
- Find hardcoded text that should be dynamic

#### Step 2: Create the TSX Component
```typescript
// template-name.tsx
import React, { useState, useMemo } from 'react';
import { useTemplateData, useTemplateSettings } from '../../hooks/useTemplateData';

interface TemplateData {
  storeImage: string;
  storeName: string;
  products: Product[];
  // template-specific data
}

interface TemplateSettings {
  heroHeading: string;
  accentColor: string;
  currencySymbol: string;
  // template-specific settings
}

export default function TemplateNameComponent() {
  const data = useTemplateData<TemplateData>();
  const settings = useTemplateSettings<TemplateSettings>();
  
  // Provide defaults
  const products = data?.products || [];
  const accentColor = settings?.accentColor || '#default-color';
  
  // Render component
  return ( /* JSX */ );
}
```

#### Step 3: Create Settings Component
```typescript
// TemplateNameSettings.tsx
import React, { useState, useEffect } from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'Template Default Heading',
  ctaButtonText: 'Shop Now',
  accentColor: '#default-hex',
  currencySymbol: 'USD',
};

export default function TemplateNameSettings() {
  return (
    <BaseTemplateSettings
      templateName="Template Name"
      defaultSettings={defaultSettings}
      additionalFields={
        // Optional template-specific fields
      }
    />
  );
}
```

#### Step 4: Verify Registry Entry
- Check that both imports are added to TemplateRegistry.ts
- Verify entry exists in TEMPLATES array

---

## Templates Breakdown

### 1. **fashion.tsx** ✅ DONE
**File**: `/client/components/templates/fashion.tsx`
**Settings**: `/client/pages/admin/TemplateSettings/FashionSettings.tsx`

- Multi-filter system (gender, category, fit)
- Carousel for "looks"
- Dark theme with amber accents
- Product grid 2-col mobile / 3-col desktop

---

### 2. **fashion2.tsx**
**File**: `/client/components/templates/fashion2.tsx`
**Settings**: `/client/pages/admin/TemplateSettings/Fashion2Settings.tsx`

Extract from: `fashion2.html`

**Unique Features to Identify**:
- View the HTML file to identify its specific structure
- Look for different filter options
- Note any unique layout (gallery vs grid)
- Find color scheme

**Template Pattern**:
```
1. Read fashion2.html lines 50-150 to identify:
   - How products are stored
   - What filters exist
   - Color values used
2. Create component using same hook pattern as fashion.tsx
3. Create settings page with relevant customizations
```

---

### 3. **fashion3.tsx**
**File**: `/client/components/templates/fashion3.tsx`
**Settings**: `/client/pages/admin/TemplateSettings/Fashion3Settings.tsx`

---

### 4. **baby.tsx**
**File**: `/client/components/templates/baby.tsx`
**Settings**: `/client/pages/admin/TemplateSettings/BabySettings.tsx`

**Key Data Points from HTML**:
- Products have: name, category, age-range, price
- Featured items section
- Warm color scheme (amber/pink tones)
- Centered, friendly layout
- Product cards with shadows

**Data Interface**:
```typescript
interface Product {
  id: number;
  name: string;
  category: string;
  ageRange: string;
  price: number;
}

interface BabyData {
  storeImage: string;
  storeName: string;
  products: Product[];
  featured?: Product[];
}

interface BabySettings {
  heroHeading: string;
  heroSubtitle: string;
  ctaButtonText: string;
  accentColor: string; // Warm amber
  currencySymbol: string;
}
```

---

### 5. **bags.tsx**
**File**: `/client/components/templates/bags.tsx`
**Settings**: `/client/pages/admin/TemplateSettings/BagsSettings.tsx`

**Key Features**:
- Editorial/magazine-style layout
- Material types (leather, canvas, etc.)
- Serif typography
- Chapters/sections of bags
- Professional shadows

**Data Interface**:
```typescript
interface Bag {
  id: number;
  name: string;
  material: string;
  color: string;
  price: number;
  chapter?: string;
}

interface BagsData {
  storeImage: string;
  storeName: string;
  bags: Bag[];
  chapters: Array<{ id: string; name: string; }>;
}
```

---

### 6. **beauty.tsx**
**File**: `/client/components/templates/beauty.tsx`
**Settings**: `/client/pages/admin/TemplateSettings/BeautySettings.tsx`

Extract pattern from: `beaty.html` (note: filename is "beaty" not "beauty")

---

### 7. **cafe.tsx**
**File**: `/client/components/templates/cafe.tsx`
**Settings**: `/client/pages/admin/TemplateSettings/CafeSettings.tsx`

---

### 8. **electronics.tsx** ✅ PARTIALLY ANALYZED
**File**: `/client/components/templates/electronics.tsx`
**Settings**: `/client/pages/admin/TemplateSettings/ElectronicsSettings.tsx`

**Key Features** (from HTML review):
- Dark theme with cyan accents
- Glassmorphism (blur effects)
- Tech aesthetic
- Hero banner with glow effect
- Category tabs
- Hard-edged cards

**Data Interface**:
```typescript
interface ElectronicProduct {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  specs?: string[];
}

interface ElectronicsData {
  storeImage: string;
  storeName: string;
  products: ElectronicProduct[];
  categories: string[];
}

interface ElectronicsSettings {
  heroHeading: string;
  accentColor: string; // Cyan #38bdf8
  currencySymbol: string;
}
```

---

### 9. **food.tsx** ✅ PARTIALLY ANALYZED
**File**: `/client/components/templates/food.tsx`
**Settings**: `/client/pages/admin/TemplateSettings/FoodSettings.tsx`

**Key Features**:
- Japanese minimal aesthetic
- Light theme (cream background)
- Wasabi green accents
- Radial gradient backgrounds
- Hover animations with scale-up

**Data Interface**:
```typescript
interface FoodProduct {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  vegetarian?: boolean;
  vegan?: boolean;
}

interface FoodData {
  storeImage: string;
  storeName: string;
  products: FoodProduct[];
}

interface FoodSettings {
  heroHeading: string;
  accentColor: string; // Wasabi #a3c76d
  currencySymbol: string;
}
```

---

### 10. **furniture.tsx**
**File**: `/client/components/templates/furniture.tsx`
**Settings**: `/client/pages/admin/TemplateSettings/FurnitureSettings.tsx`

---

### 11. **jewelry.tsx**
**File**: `/client/components/templates/jewelry.tsx`
**Settings**: `/client/pages/admin/TemplateSettings/JewelrySettings.tsx`

---

### 12. **perfume.tsx** ✅ PARTIALLY ANALYZED
**File**: `/client/components/templates/perfume.tsx`
**Settings**: `/client/pages/admin/TemplateSettings/PerfumeSettings.tsx`

**Key Features**:
- Dark premium aesthetic
- Hero-focused (large image section)
- Realm-based categorization (Dark, Gold, Art)
- Fragrance notes display
- Carousel for products

**Data Interface**:
```typescript
interface PerfumeProduct {
  id: number;
  name: string;
  realm: string; // 'dark', 'gold', 'art'
  realmLabel: string;
  family: string; // 'Amber', 'Fresh', etc.
  intensity: string; // 'Day', 'Evening', 'Night'
  notes: string[];
  price: number;
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

---

## Quick Implementation Checklist

For each template, verify:

- [ ] Component reads from `window.TEMPLATE_DATA`
- [ ] Component reads from `window.TEMPLATE_SETTINGS`
- [ ] Uses `useTemplateData()` and `useTemplateSettings()` hooks
- [ ] Has TypeScript interfaces for data and settings
- [ ] Handles null/undefined data with sensible defaults
- [ ] Uses Tailwind classes (convert inline styles)
- [ ] All hardcoded text moved to settings
- [ ] All images use data or fallback to storeImage
- [ ] Colors reference `accentColor` from settings
- [ ] Prices show `currencySymbol` from settings
- [ ] Uses `useMemo` for filtered/computed lists
- [ ] Settings component extends BaseTemplateSettings or is custom
- [ ] Entry exists in TemplateRegistry.ts

---

## File Organization Reference

```
/client
├── components/
│   ├── TemplateRegistry.ts ✅ UPDATED
│   ├── BaseTemplateSettings.tsx ✅ CREATED
│   └── templates/
│       ├── fashion.tsx ✅ DONE
│       ├── fashion2.tsx [TODO]
│       ├── fashion3.tsx [TODO]
│       ├── baby.tsx [TODO]
│       ├── bags.tsx [TODO]
│       ├── beauty.tsx [TODO]
│       ├── cafe.tsx [TODO]
│       ├── electronics.tsx [TODO]
│       ├── food.tsx [TODO]
│       ├── furniture.tsx [TODO]
│       ├── jewelry.tsx [TODO]
│       └── perfume.tsx [TODO]
├── hooks/
│   └── useTemplateData.ts ✅ DONE
└── pages/admin/
    └── TemplateSettings/
        ├── FashionSettings.tsx ✅ DONE
        ├── Fashion2Settings.tsx [TODO]
        ├── Fashion3Settings.tsx [TODO]
        ├── BabySettings.tsx [TODO]
        ├── BagsSettings.tsx [TODO]
        ├── BeautySettings.tsx [TODO]
        ├── CafeSettings.tsx [TODO]
        ├── ElectronicsSettings.tsx [TODO]
        ├── FoodSettings.tsx [TODO]
        ├── FurnitureSettings.tsx [TODO]
        ├── JewelrySettings.tsx [TODO]
        └── PerfumeSettings.tsx [TODO]
```

---

## Next Steps

1. **Analyze remaining HTML files** - Review the unique structure of each
2. **Create TSX components** - Use fashion.tsx as the template
3. **Create Settings pages** - Extend BaseTemplateSettings.tsx
4. **Test data loading** - Ensure window.TEMPLATE_DATA and window.TEMPLATE_SETTINGS work
5. **Verify Registry** - All 12 templates should be importable

---

## Data Injection Example

When using a template, inject data like this:

```typescript
// In the parent/wrapper component
window.TEMPLATE_DATA = {
  storeImage: 'https://...',
  storeName: 'My Store',
  products: [...],
};

window.TEMPLATE_SETTINGS = {
  heroHeading: 'Welcome',
  accentColor: '#f97316',
  currencySymbol: 'USD',
};

// Then render the template component
<FashionTemplate />
```

This is already set up in `TemplateWrapper.tsx` if you check that file.
