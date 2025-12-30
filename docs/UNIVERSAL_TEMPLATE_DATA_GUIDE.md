# Universal Template Data System

## The Vision

> **"Add a new edit capability once → it automatically works in ALL templates"**

All templates are different **visually**, but they all have the **same editable content**:
- Same editable hero title
- Same editable hero subtitle  
- Same editable hero image (with resize, position)
- Same editable colors
- Same editable logo
- etc.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HOW IT WORKS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌─────────────────────┐    ┌───────────────────┐  │
│  │ Store        │    │ Universal Template  │    │ Templates         │  │
│  │ Settings     │ →  │ Data Hook          │ →  │ (Bags, Fashion,   │  │
│  │ (Database)   │    │ (Standardized)     │    │  Electronics...)  │  │
│  └──────────────┘    └─────────────────────┘    └───────────────────┘  │
│                               ↑                                         │
│                               │                                         │
│                      ┌────────┴────────┐                               │
│                      │ GoldTemplateEditor │                            │
│                      │ (Edits settings)  │                              │
│                      └───────────────────┘                              │
│                                                                         │
│  ADD A NEW FIELD TO THE HOOK → ALL TEMPLATES GET IT AUTOMATICALLY      │
└─────────────────────────────────────────────────────────────────────────┘
```

## How to Add a New Editable Field

### Step 1: Add to Universal Data Interface

In `/client/hooks/useUniversalTemplateData.ts`:

```typescript
export interface UniversalTemplateData {
  // ... existing fields ...
  
  // NEW: Add your new field
  heroImageZoom: number;        // Zoom level for hero image
  heroImageBlur: number;        // Blur effect for hero image
  videoBackgroundUrl: string;   // Video background URL
}
```

### Step 2: Add Settings Mapping

In the same file, add the database key mapping:

```typescript
const SETTINGS_MAP = {
  // ... existing mappings ...
  
  // NEW: Map to database field
  heroImageZoom: 'template_hero_image_zoom',
  heroImageBlur: 'template_hero_image_blur',
  videoBackgroundUrl: 'template_video_background_url',
};
```

### Step 3: Add Default Value

```typescript
const DEFAULTS: UniversalTemplateData = {
  // ... existing defaults ...
  
  // NEW: Default values
  heroImageZoom: 1,
  heroImageBlur: 0,
  videoBackgroundUrl: '',
};
```

### Step 4: Add to the Hook Implementation

```typescript
export function useUniversalTemplateData(settings) {
  return useMemo(() => ({
    // ... existing fields ...
    
    // NEW: Read from settings
    heroImageZoom: Number(s.template_hero_image_zoom) || DEFAULTS.heroImageZoom,
    heroImageBlur: Number(s.template_hero_image_blur) || DEFAULTS.heroImageBlur,
    videoBackgroundUrl: s.template_video_background_url || DEFAULTS.videoBackgroundUrl,
  }), [settings]);
}
```

### Step 5: Add to Editable Fields List (for Editor)

```typescript
export const UNIVERSAL_EDITABLE_FIELDS = [
  // ... existing fields ...
  
  // NEW: Editor field definitions
  { field: 'heroImageZoom', label: 'Hero Image Zoom', type: 'number', category: 'Hero' },
  { field: 'heroImageBlur', label: 'Hero Image Blur', type: 'number', category: 'Hero' },
  { field: 'videoBackgroundUrl', label: 'Video Background', type: 'url', category: 'Hero' },
];
```

### Step 6: Use in Templates

Now ALL templates can use these fields:

```tsx
// In ANY template:
import { useUniversalTemplateData } from '@/hooks/useUniversalTemplateData';

export default function MyTemplate(props) {
  const data = useUniversalTemplateData(props.settings);
  
  return (
    <div>
      {/* Hero image with zoom - automatically editable! */}
      <img 
        data-edit-path="__settings.template_hero_image_zoom"
        src={data.heroImage}
        style={{ transform: `scale(${data.heroImageZoom})` }}
      />
      
      {/* Video background - automatically editable! */}
      {data.videoBackgroundUrl && (
        <video 
          data-edit-path="__settings.template_video_background_url"
          src={data.videoBackgroundUrl}
          autoPlay
          loop
          muted
        />
      )}
    </div>
  );
}
```

## Available Components

Use the pre-built components for even easier integration:

```tsx
import { 
  HeroTitle, 
  HeroSubtitle, 
  HeroImage,
  StoreName,
  BuyButton 
} from '@/hooks/UniversalEditableComponents';

export default function MyTemplate(props) {
  const data = useUniversalTemplateData(props.settings);
  
  return (
    <div>
      <StoreName data={data} className="text-2xl font-bold" />
      <HeroTitle data={data} className="text-4xl" />
      <HeroSubtitle data={data} className="text-gray-600" />
      <HeroImage data={data} className="w-full h-96 object-cover" />
      <BuyButton data={data} className="bg-blue-500 text-white px-4 py-2" />
    </div>
  );
}
```

## Currently Available Universal Fields

### Store Info
- `storeName` - Store name
- `storeDescription` - Store description
- `storeLogo` - Logo image URL
- `storeFavicon` - Favicon URL

### Hero Section
- `heroKicker` - Small text above title
- `heroTitle` - Main hero heading
- `heroSubtitle` - Hero description
- `heroImage` - Hero background/main image
- `heroImageScale` - Image scale (1 = 100%)
- `heroImagePositionX` - Focal point X (0-1)
- `heroImagePositionY` - Focal point Y (0-1)
- `heroVideo` - Hero video URL
- `heroVideoAutoplay` - Autoplay video
- `heroVideoLoop` - Loop video
- `heroCtaText` - Primary CTA button text
- `heroCtaLink` - Primary CTA link
- `heroSecondaryCtaText` - Secondary CTA text
- `heroSecondaryCtaLink` - Secondary CTA link

### Colors
- `primaryColor` - Primary brand color
- `secondaryColor` - Secondary color
- `accentColor` - Accent color
- `textColor` - Main text color
- `secondaryTextColor` - Muted text color
- `backgroundColor` - Background color

### Typography
- `fontFamily` - Body font
- `headingFontFamily` - Heading font
- `fontSize` - Base font size
- `headingSizeMultiplier` - Heading scale

### Layout
- `borderRadius` - Global border radius
- `sectionPadding` - Section padding
- `cardPadding` - Card padding
- `gridColumns` - Product grid columns
- `gridGap` - Grid gap

### Effects
- `enableAnimations` - Enable animations
- `enableShadows` - Enable shadows
- `enableDarkMode` - Dark mode
- `enableParallax` - Parallax effect

### Sections
- `featuredTitle` - Featured section title
- `featuredSubtitle` - Featured section subtitle
- `showFeaturedSection` - Show featured section
- `showTestimonials` - Show testimonials
- `testimonialsTitle` - Testimonials title

### Footer
- `footerAbout` - About text
- `footerCopyright` - Copyright text

### Products
- `buyButtonText` - Buy button text
- `addToCartText` - Add to cart text
- `showProductShadows` - Product card shadows
- `showQuickView` - Quick view feature

## File Locations

- **Hook**: `/client/hooks/useUniversalTemplateData.ts`
- **Components**: `/client/hooks/UniversalEditableComponents.tsx`
- **Editor**: `/client/pages/GoldTemplateEditor.tsx`
- **Templates**: `/client/components/templates/*.tsx`

## The Power of This System

1. **Add once, works everywhere** - New fields automatically available in all 15+ templates
2. **Type-safe** - TypeScript ensures correct field names
3. **Editor integration** - Fields automatically appear in the visual editor
4. **Backward compatible** - Templates can still use `rawSettings` for custom fields
5. **Self-documenting** - `UNIVERSAL_EDITABLE_FIELDS` lists all available fields
