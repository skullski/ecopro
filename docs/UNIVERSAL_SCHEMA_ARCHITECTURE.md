# Universal Schema Architecture

## Core Concept

**Schema = Data Contract** - One universal schema defines all editable fields  
**Template = Renderer** - Each template interprets the same schema differently  
**Editor = Controller** - Updates the schema; doesn't care which template is active

## Key Benefits

1. **Consistency** - Switching templates doesn't break data
2. **Scalability** - Add new templates without touching schema or editor
3. **Flexibility** - One schema supports both simple and advanced editors
4. **Portability** - Store data is independent of design
5. **Auto-propagation** - Add new field once → all templates inherit it

---

## Two Editor Modes (Same Schema)

### Basic Editor (Easy Mode)
- **Goal**: Instant usability, no learning curve
- **Exposed fields**: logo, hero image, texts, wallpaper, product slots
- **Locked**: No resizing, no drag-drop, no advanced styling
- **User flow**: Pick template → products auto-slot → change content only

### Advanced Editor (Power Mode)  
- **Goal**: Full creative freedom
- **Exposed fields**: All schema fields (layout, sizes, colors, effects)
- **User flow**: Same schema, but can move blocks, resize cards, add effects

---

## Universal Schema Sample

```json
{
  "meta": {
    "storeId": "string",
    "name": "string",
    "locale": "string",
    "currency": "string"
  },
  "assets": {
    "logo": { "type": "image", "exposure": "basic" },
    "favicon": { "type": "image", "exposure": "advanced" },
    "wallpaper": { "type": "image", "exposure": "basic" }
  },
  "hero": {
    "title": { "type": "text", "exposure": "basic" },
    "subtitle": { "type": "text", "exposure": "basic" },
    "image": { "type": "image", "exposure": "basic" },
    "video": { "type": "url", "exposure": "advanced" },
    "layoutHint": { "type": "enum", "values": ["top","split","fullscreen"], "exposure": "advanced" }
  },
  "products": {
    "defaultCard": {
      "shape": { "type": "enum", "values": ["card","tile","circle","list"], "exposure": "advanced" },
      "size": { "type": "enum", "values": ["small","medium","large"], "exposure": "advanced" },
      "style": { "type": "object", "exposure": "advanced" }
    },
    "items": [
      {
        "id": "string",
        "title": "string",
        "price": "number",
        "image": "string",
        "description": "string",
        "tags": ["string"],
        "inventory": { "type": "number" },
        "layout": {
          "position": { "type": "number", "exposure": "basic" },
          "size": { "type": "enum", "exposure": "advanced" },
          "highlight": { "type": "boolean", "exposure": "basic" }
        }
      }
    ]
  },
  "sections": [
    {
      "id": "string",
      "type": { "type": "enum", "values": ["banner","collection","testimonial","custom"] },
      "visible": { "type": "boolean", "exposure": "basic" },
      "config": { "type": "object", "exposure": "advanced" }
    }
  ],
  "theme": {
    "primaryColor": { "type": "color", "exposure": "basic" },
    "accentColor": { "type": "color", "exposure": "advanced" },
    "font": { "type": "string", "exposure": "advanced" },
    "spacing": { "type": "object", "exposure": "advanced" }
  },
  "footer": {
    "links": [{ "label": "string", "url": "string" }],
    "copyright": { "type": "text", "exposure": "basic" }
  },
  "metaControls": {
    "version": "1.0",
    "lastUpdated": "ISODate"
  }
}
```

---

## Field Exposure Tags

| Field | Basic | Advanced |
|-------|-------|----------|
| logo | ✅ | ✅ |
| hero.title | ✅ | ✅ |
| hero.image | ✅ | ✅ |
| hero.video | ❌ | ✅ |
| hero.layoutHint | ❌ | ✅ |
| wallpaper | ✅ | ✅ |
| primaryColor | ✅ | ✅ |
| accentColor | ❌ | ✅ |
| font | ❌ | ✅ |
| product.position | ✅ | ✅ |
| product.size | ❌ | ✅ |
| product.shape | ❌ | ✅ |
| product.color | ❌ | ✅ |
| section.visible | ✅ | ✅ |
| section.config | ❌ | ✅ |

---

## Product Card Customization

### Schema Fields for Products
```json
{
  "id": "p1",
  "title": "Leather Boots",
  "price": 8000,
  "image": "boots.jpg",
  "layout": {
    "position": 1,
    "size": "medium",
    "shape": "card",
    "color": "#ffffff",
    "textColor": "#000000",
    "style": "shadow",
    "hoverEffect": "zoom"
  }
}
```

### Product Placements (Where they appear)
- **Grid**: Classic 2-4 columns, equal cards
- **Masonry**: Varied card sizes, Pinterest-style
- **Carousel**: Horizontal scroll with arrows
- **Sidebar highlight**: One featured product beside hero
- **Full-width spotlight**: One product stretched across page

### Product Shapes (How they look)
- **Card**: Rectangle with image + text below
- **Tile**: Square image with overlay text
- **Circle**: Round product image (fashion/food)
- **List row**: Image left, text right (catalog)
- **Chip**: Small pill-style for quick add

---

## How Templates Update Automatically

1. **Renderer reads schema at runtime** - templates fetch store schema and render fields they understand
2. **Graceful fallback** - if template encounters unknown field, it ignores or uses default
3. **Feature detection** - templates check `exposure` and `type` to decide rendering
4. **Versioning** - use `metaControls.version` for breaking changes
5. **Progressive enhancement** - templates adopt new fields optionally

---

## Future Fields to Add

Add incrementally - all templates inherit automatically:

- `hero.video` + `autoplay`
- `product.badges` (new, sale, limited)
- `product.hoverEffect` (zoom, reveal)
- `section.animation` (entrance effects)
- `seo` (metaTitle, metaDescription, structuredData)
- `accessibility` (altText, ariaLabels)
- `personalization` (recommendedProducts rules)
- `ABTestFlags` (template variants)
- `integrations` (payment badges, analytics IDs)
- `responsiveHints` (mobilePriority, hideOnMobile)

---

## Implementation Roadmap

1. ✅ **Create universal schema** with core fields - `shared/universal-store-schema.ts`
2. ✅ **Tag fields** as basic vs advanced - `exposure: 'basic' | 'advanced'`
3. ✅ **Create theme presets** - `shared/theme-presets.ts` (15+ presets)
4. ✅ **Connect Shiro Hana** to universal schema - re-exports types
5. ✅ **Create preset connector** - `shared/apply-theme-preset.ts`
6. 🔄 **Add preset selector to editor** - Let users pick theme
7. TODO **Deprecate legacy templates** - fashion.tsx, baby.tsx, etc.

---

## Template Extraction Summary

Each legacy template (fashion.tsx, baby.tsx, etc.) contains:
- **Colors** → Extracted to theme preset
- **Fonts** → Extracted to theme preset  
- **Card styles** → Extracted to theme preset defaults
- **Content** → Goes into schema via `createDefaultSchemaContent()`
- **Layout JSX** → Shiro Hana handles this universally

See `shared/template-extraction-guide.ts` for detailed mapping.

| Legacy Template | Theme Preset   | Default Content               |
|-----------------|----------------|-------------------------------|
| fashion.tsx     | fashion-dark   | "Build a wardrobe..."         |
| baby.tsx        | baby-soft      | "A soft universe..."          |
| electronics.tsx | tech-dark      | "Flagship performance..."     |
| jewelry.tsx     | jewelry-gold   | "Timeless elegance..."        |
| beauty.tsx      | beauty-blush   | "Beauty that feels..."        |

---

## Key Insights

> "The schema is the DNA of the store. Templates are just different bodies that express that DNA."

> "It's not the schema that changes — it's the editor's lens."

> "Once the universal schema exists, adding new UIs is mostly frontend design work — not backend or editor work."

> "By centralizing everything into one schema, every update you make propagates across the platform."
