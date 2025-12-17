# Template Conversion Guide

## Overview
This document provides the systematic approach and patterns for converting 12 HTML template files to TSX React components.

## Key Patterns

### 1. Data Structure Pattern
Every template reads from `window.TEMPLATE_DATA`:
```typescript
interface TemplateData {
  storeImage: string;
  storeName: string;
  products: Product[];
  [key: string]: any; // Template-specific data
}
```

### 2. Settings Structure Pattern
Every template reads from `window.TEMPLATE_SETTINGS`:
```typescript
interface TemplateSettings {
  heroHeading: string;
  ctaButtonText: string;
  accentColor: string;
  currencySymbol: string;
  [key: string]: any; // Template-specific settings
}
```

### 3. Component Conversion Steps

For each HTML template:

#### Step 1: Extract Core Data
- Identify hardcoded arrays/objects → move to window.TEMPLATE_DATA
- Identify hardcoded text/colors → move to window.TEMPLATE_SETTINGS
- Identify filter options/categories → parameterize from data

#### Step 2: Create TSX Component
- Import hooks: `useTemplateData`, `useTemplateSettings`
- Define TypeScript interfaces for data and settings
- Use `useMemo` for filtered/computed products
- Replace inline styles with Tailwind + dynamic style objects

#### Step 3: Create Settings Page
- Base class: Copy from FashionSettings.tsx and modify
- Update field labels for template-specific settings
- Add any custom settings relevant to that template

#### Step 4: Register in TemplateRegistry
- Import component and settings component
- Add entry to TEMPLATES array with unique ID

## Template Characteristics

| Template | Theme | Accent | Unique Features |
|----------|-------|--------|-----------------|
| fashion | Dark luxury | Amber/Orange | Multi-filter, carousel, serif |
| fashion2 | TBD | TBD | TBD |
| fashion3 | TBD | TBD | TBD |
| baby | Warm minimal | Amber | Soft colors, centered layout |
| bags | Editorial serif | Gray | Magazine-style, material shadows |
| beauty | TBD | TBD | TBD |
| cafe | TBD | TBD | TBD |
| electronics | Dark tech | Cyan | Glassmorphism, tech aesthetic |
| food | Minimal japanese | Wasabi green | Japanese typography, radial gradient |
| furniture | TBD | TBD | TBD |
| jewelry | TBD | TBD | TBD |
| perfume | Dark premium | Amber | Hero-focused, minimal UI |

## Code Organization
```
client/
├── components/
│   └── templates/
│       ├── fashion.tsx
│       ├── fashion2.tsx
│       ├── fashion3.tsx
│       ├── baby.tsx
│       ├── bags.tsx
│       ├── beauty.tsx
│       ├── cafe.tsx
│       ├── electronics.tsx
│       ├── food.tsx
│       ├── furniture.tsx
│       ├── jewelry.tsx
│       └── perfume.tsx
├── hooks/
│   └── useTemplateData.ts (DONE)
├── pages/admin/
│   └── TemplateSettings/
│       ├── FashionSettings.tsx (DONE)
│       ├── Fashion2Settings.tsx
│       ├── Fashion3Settings.tsx
│       ├── BabySettings.tsx
│       ├── BagsSettings.tsx
│       ├── BeautySettings.tsx
│       ├── CafeSettings.tsx
│       ├── ElectronicsSettings.tsx
│       ├── FoodSettings.tsx
│       ├── FurnitureSettings.tsx
│       ├── JewelrySettings.tsx
│       └── PerfumeSettings.tsx
└── components/
    └── TemplateRegistry.ts (TO UPDATE)
```

## Batch Conversion Checklist

- [ ] fashion.tsx (DONE)
- [ ] fashion2.tsx
- [ ] fashion3.tsx
- [ ] baby.tsx
- [ ] bags.tsx
- [ ] beauty.tsx
- [ ] cafe.tsx
- [ ] electronics.tsx
- [ ] food.tsx
- [ ] furniture.tsx
- [ ] jewelry.tsx
- [ ] perfume.tsx
- [ ] FashionSettings.tsx (DONE)
- [ ] All other settings pages (11 total)
- [ ] Update TemplateRegistry.ts with all 12 templates

## Quick Command for Settings Generation

Each settings component should:
1. Define interfaces for that template's specific settings
2. Create a form with relevant customization options
3. Save to window.TEMPLATE_SETTINGS
4. Provide default values

## Validation Checklist for Each Component

- [ ] Reads data from `window.TEMPLATE_DATA`
- [ ] Reads settings from `window.TEMPLATE_SETTINGS`
- [ ] Uses `useTemplateData` and `useTemplateSettings` hooks
- [ ] Has proper TypeScript interfaces
- [ ] Handles null/undefined with sensible defaults
- [ ] Uses `useMemo` for expensive computations
- [ ] All hardcoded strings moved to settings
- [ ] All hardcoded images use data or defaults
- [ ] Colors reference accentColor from settings
- [ ] Prices show currencySymbol from settings
