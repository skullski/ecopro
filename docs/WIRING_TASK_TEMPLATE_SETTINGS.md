# 🔌 WIRING TASK: Connect New Settings to Templates

**Status**: ⚠️ INCOMPLETE - Settings defined but NOT wired to components

---

## Current State

### ✅ What We Have
- 12 universal setting groups defined in `TemplateSettings.tsx`
- 40+ new database columns added via migration
- Settings saved to database
- Settings loaded from database

### ❌ What's Missing
- Template components NOT reading the new universal settings
- Templates still use old basic settings only
- No consumption of logo, typography, layout, SEO, testimonials, etc.

---

## How Settings Currently Work

```typescript
// 1. Settings saved to database
API.PUT('/api/client/store/settings', { settings })

// 2. Settings loaded to window
window.TEMPLATE_SETTINGS = settingsFromDB

// 3. Templates should read via hook
const settings = useTemplateSettings()

// 4. Templates apply to JSX
<div style={{ color: settings.primary_color }}>
```

---

## What Needs To Happen

### For Each Template (12 templates)

Each template needs to:

1. **Import the hook**
   ```typescript
   import { useTemplateSettings } from '@/hooks/useTemplateData';
   ```

2. **Read universal settings**
   ```typescript
   const settings = useTemplateSettings();
   const { 
     logo_url, primary_color, secondary_color, accent_color,
     font_family, body_font_size, heading_size_multiplier,
     grid_columns, section_padding, border_radius,
     enable_dark_mode, show_product_shadows, enable_animations,
     // ... other settings
   } = settings || {};
   ```

3. **Apply to styles**
   ```typescript
   // Logo in header
   <img src={logo_url} style={{ width: logo_width }} />
   
   // Colors
   <div style={{ color: primary_color }}>
   
   // Font
   <div style={{ fontFamily: font_family, fontSize: body_font_size }}>
   
   // Layout
   <div style={{ display: 'grid', gridTemplateColumns: `repeat(${grid_columns}, 1fr)` }}>
   
   // Dark mode
   <div className={enable_dark_mode ? 'dark' : 'light'}>
   ```

4. **Add inline stylesheet for dynamic settings**
   ```typescript
   <style>{`
     :root {
       --primary-color: ${primary_color};
       --secondary-color: ${secondary_color};
       --accent-color: ${accent_color};
       --font-family: ${font_family};
       --body-font-size: ${body_font_size}px;
       --grid-columns: ${grid_columns};
       --section-padding: ${section_padding}px;
       --border-radius: ${border_radius}px;
     }
   `}</style>
   ```

5. **Handle optional sections**
   ```typescript
   {show_featured_section && <FeaturedSection ids={featured_product_ids} />}
   {show_testimonials && <TestimonialsSection testimonials={testimonials} />}
   {show_newsletter && <NewsletterSection />}
   {show_faq && <FAQSection items={faq_items} />}
   ```

---

## Templates To Wire

1. **Fashion** - `/client/components/templates/fashion.tsx`
2. **Fashion 2** - `/client/components/templates/fashion2.tsx`
3. **Fashion 3** - `/client/components/templates/fashion3.tsx`
4. **Electronics** - `/client/components/templates/electronics.tsx`
5. **Food** - `/client/components/templates/food.tsx`
6. **Furniture** - `/client/components/templates/furniture.tsx`
7. **Jewelry** - `/client/components/templates/jewelry.tsx`
8. **Perfume** - `/client/components/templates/perfume.tsx`
9. **Baby** - `/client/components/templates/baby.tsx`
10. **Bags** - `/client/components/templates/bags.tsx`
11. **Beauty** - `/client/components/templates/beauty.tsx`
12. **Cafe** - `/client/components/templates/cafe.tsx`

---

## Implementation Approach

### Option A: Quick & Simple
- Apply basic settings (logo, colors, fonts) to each template
- Don't implement optional sections yet
- Get 80% of functionality working fast

### Option B: Comprehensive
- Implement all universal settings
- Add all optional sections (testimonials, FAQ, newsletter, etc.)
- Create reusable components for sections
- Full professional look

### Option C: Hybrid (RECOMMENDED)
- **Phase 1**: Basic wiring (logo, colors, fonts, layout) - 2-3 hours
- **Phase 2**: Advanced sections (testimonials, FAQ, etc.) - 4-5 hours
- **Phase 3**: Polish & testing - 2-3 hours

---

## Priority Order

**Highest Impact First**:
1. Logo, colors, fonts (affects ALL templates visually)
2. Grid layout (affects product display)
3. Dark mode support (big UX feature)
4. Featured section (engagement)
5. Testimonials/FAQ (trust & engagement)
6. Newsletter (email collection)

---

## Example: Fashion Template Wiring

```typescript
import React, { useState } from 'react';
import { useTemplateSettings } from '@/hooks/useTemplateData';

export default function FashionTemplate(props: TemplateProps) {
  const { navigate, storeSlug } = props;
  const settings = useTemplateSettings() || {};
  
  // Extract all new settings
  const {
    logo_url,
    primary_color = '#000000',
    secondary_color = '#F5F5F5',
    accent_color = '#F97316',
    font_family = 'Inter',
    body_font_size = 16,
    grid_columns = 4,
    section_padding = 40,
    border_radius = 8,
    enable_dark_mode = true,
    show_featured_section = true,
    featured_product_ids = '',
    show_testimonials = false,
    testimonials = '[]',
    show_faq = false,
    faq_items = '[]',
  } = settings;

  // ... rest of component

  return (
    <div className={enable_dark_mode ? 'dark' : ''}>
      <style>{`
        :root {
          --primary-color: ${primary_color};
          --secondary-color: ${secondary_color};
          --accent-color: ${accent_color};
          --font-family: '${font_family}', sans-serif;
          --body-size: ${body_font_size}px;
          --grid-cols: ${grid_columns};
          --padding: ${section_padding}px;
          --radius: ${border_radius}px;
        }
        
        body { 
          font-family: var(--font-family);
          font-size: var(--body-size);
          color: var(--primary-color);
          background: var(--secondary-color);
        }
        
        .product-grid {
          display: grid;
          grid-template-columns: repeat(var(--grid-cols), 1fr);
          gap: 16px;
          padding: var(--padding);
        }
        
        .card {
          border-radius: var(--radius);
          border: 1px solid #ddd;
        }
        
        .btn {
          background-color: var(--accent-color);
          border-radius: var(--radius);
        }
      `}</style>

      {/* Logo */}
      {logo_url && (
        <header>
          <img src={logo_url} alt="Logo" style={{ maxWidth: '150px' }} />
        </header>
      )}

      {/* Products Grid */}
      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="card">
            {/* product card */}
          </div>
        ))}
      </div>

      {/* Featured Section */}
      {show_featured_section && (
        <section style={{ padding: `var(--padding)` }}>
          {/* featured products */}
        </section>
      )}

      {/* Testimonials */}
      {show_testimonials && (
        <section>
          {JSON.parse(testimonials).map((t: any) => (
            <div key={t.name}>
              <p>"{t.text}"</p>
              <p>- {t.name}</p>
            </div>
          ))}
        </section>
      )}

      {/* FAQ */}
      {show_faq && (
        <section>
          {JSON.parse(faq_items).map((item: any) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </section>
      )}
    </div>
  );
}
```

---

## Wiring Checklist

- [ ] Fashion template wired
- [ ] Fashion2 template wired
- [ ] Fashion3 template wired
- [ ] Electronics template wired
- [ ] Food template wired
- [ ] Furniture template wired
- [ ] Jewelry template wired
- [ ] Perfume template wired
- [ ] Baby template wired
- [ ] Bags template wired
- [ ] Beauty template wired
- [ ] Cafe template wired
- [ ] Test all templates
- [ ] Verify settings apply correctly
- [ ] Test dark mode
- [ ] Test optional sections
- [ ] Deploy to production

---

## Estimated Effort

- **Per Template**: 30-45 minutes
- **All 12 Templates**: 6-9 hours
- **Testing & Polish**: 2-3 hours
- **Total**: 8-12 hours

---

## Next Steps

1. **Decide**: Quick (Option A), Full (Option B), or Hybrid (Option C)?
2. **Start**: Pick 1-2 templates to wire as examples
3. **Test**: Verify settings apply correctly
4. **Scale**: Apply pattern to remaining templates
5. **Deploy**: Ship wired templates to production

---

## Questions Before Wiring?

- Which option do you want (A/B/C)?
- Should we wire all 12 at once or start with top 3?
- Any templates you want prioritized?
- Want me to wire them now?
