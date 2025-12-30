# Universal Edit Plan - Basic vs Advanced

> **READ THIS FILE BEFORE WORKING ON ANY TEMPLATE**
> This is the master plan for what edits ALL templates must support.

---

## The Goal

Every template (bags, electronics, fashion, cafe, etc.) must support the SAME editing capabilities.
- Shiro Hana is the reference - if Shiro Hana can do it, ALL templates must do it
- Basic edits = simple, essential customizations
- Advanced edits = power user features, complex customizations

**Tier rule (FINAL):**
- **Basic editor** is available to **Bronze + Silver + Free Month (trial)**.
- **Advanced editor** is available to **Gold (unlimited)**.

---

## BASIC EDITS (Essential - Every Template MUST Have These)

### 1. Store Identity
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Store Name | The store's display name | `store_name` |
| Store Logo | Logo image URL | `store_logo` or `logo_url` |
| Store Description | Short store description | `store_description` |

### 2. Hero Section (Text)
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Hero Title | Main headline | `template_hero_heading` |
| Hero Subtitle | Supporting text | `template_hero_subtitle` |
| Hero CTA Button Text | "Shop Now" etc. | `template_button_text` |
| Hero CTA Link | Where button goes | `template_button_link` |

### 2b. Hero Media (Basic)
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Hero Image | Upload / change hero image | `banner_url` |
| Hero Video URL | Add a hero background video | `template_hero_video_url` |

### 3. Colors (Theme)
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Primary Color | Main brand color | `primary_color` |
| Secondary Color | Background/contrast | `secondary_color` |
| Accent Color | Buttons, highlights | `accent_color` |
| Text Color | Main text | `text_color` |
| Secondary Text Color | Muted text | `secondary_text_color` |
| Background Color | Page background | `background_color` |

### 4. Typography
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Font Family | Body font | `font_family` |
| Heading Size | Small/Medium/Large | `heading_size_multiplier` |

### 5. Buttons
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Buy Now Text | Product buy button | `template_buy_now_label` |
| Add to Cart Text | Cart button | `template_add_to_cart_label` |

### 6. Footer
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Footer About | About text | `footer_about` |
| Copyright | © text | `footer_copyright` |

### 7. Dark Mode (Basic)
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Dark Mode Toggle | Enable/disable dark mode | `enable_dark_mode` |

---

## ADVANCED EDITS (Power Features)

### 1. Hero Image Controls
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Hero Image | (Already Basic) | `banner_url` |
| Hero Image Scale | Zoom level (0.5 - 2.0) | `template_hero_image_scale` |
| Hero Image Position X | Focal point horizontal | `template_hero_image_pos_x` |
| Hero Image Position Y | Focal point vertical | `template_hero_image_pos_y` |
| Hero Image Fit | cover/contain/fill | `template_hero_image_fit` |

### 2. Hero Video
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Video URL | (Already Basic) | `template_hero_video_url` |
| Autoplay | Auto-start video | `template_hero_video_autoplay` |
| Loop | Repeat video | `template_hero_video_loop` |
| Muted | Mute video | `template_hero_video_muted` |

### 3. Layout Controls
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Border Radius | Roundness of corners | `border_radius` |
| Section Padding | Space around sections | `section_padding` |
| Card Padding | Space inside cards | `card_padding` |
| Grid Columns | Products per row | `grid_columns` |
| Grid Gap | Space between items | `grid_gap` |

### 4. Effects
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Dark Mode | (Already Basic) | `enable_dark_mode` |
| Animations | Enable transitions | `enable_animations` |
| Product Shadows | Card shadows | `show_product_shadows` |
| Parallax | Parallax scrolling | `enable_parallax` |

### 7. Structure / Layout Editing (Gold Unlimited)

These are **Advanced-mode-only** capabilities (not just fields):
- Move hero/sections, reorder blocks
- Add/remove sections
- Change template structure / layout variants
- Any schema-level operations (drag/drop blocks, add components, etc.)

### 5. Sections Visibility
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Show Featured | Featured products section | `show_featured_section` |
| Show Testimonials | Customer reviews | `show_testimonials` |
| Show FAQ | FAQ section | `show_faq` |

### 6. Product Card Style
| Field | Description | Settings Key |
|-------|-------------|--------------|
| Card Style | card/tile/minimal | `product_card_style` |
| Image Ratio | square/portrait/landscape | `product_image_ratio` |
| Quick View | Enable quick view | `show_quick_view` |

---

## Template Checklist

Use this checklist when updating each template:

### Template: ____________

**BASIC EDITS:**
- [ ] Store Name (`store_name`) - reads and displays
- [ ] Store Logo (`store_logo`) - reads and displays
- [ ] Hero Title (`template_hero_heading`) - reads and editable
- [ ] Hero Subtitle (`template_hero_subtitle`) - reads and editable
- [ ] Hero CTA Text (`template_button_text`) - reads and editable
- [ ] Primary Color (`primary_color`) - applies to theme
- [ ] Secondary Color (`secondary_color`) - applies to theme
- [ ] Accent Color (`accent_color`) - applies to buttons/highlights
- [ ] Text Color (`text_color`) - applies to text
- [ ] Font Family (`font_family`) - applies to typography
- [ ] Buy Now Text (`template_buy_now_label`) - reads and displays

**ADVANCED EDITS:**
- [ ] Hero Image (`banner_url`) - displays hero image
- [ ] Hero Image Scale (`template_hero_image_scale`) - zoom effect
- [ ] Hero Image Position (`template_hero_image_pos_x/y`) - focal point
- [ ] Hero Video (`template_hero_video_url`) - video background
- [ ] Border Radius (`border_radius`) - applies to cards/buttons
- [ ] Dark Mode (`enable_dark_mode`) - theme switch
- [ ] Animations (`enable_animations`) - transitions
- [ ] Product Shadows (`show_product_shadows`) - card shadows
- [ ] Grid Columns (`grid_columns`) - product layout
- [ ] Section Padding (`section_padding`) - spacing

---

## Implementation Pattern

Every template should follow this pattern:

```tsx
import { useUniversalTemplateData } from '@/hooks/useUniversalTemplateData';

export default function MyTemplate(props: TemplateProps) {
  // Get universal data - SAME for all templates
  const data = useUniversalTemplateData(props.settings);
  
  // BASIC EDITS - Use universal data
  const {
    storeName,
    storeLogo,
    heroTitle,
    heroSubtitle,
    heroCtaText,
    primaryColor,
    secondaryColor,
    accentColor,
    textColor,
    fontFamily,
    buyButtonText,
  } = data;
  
  // ADVANCED EDITS - Use universal data
  const {
    heroImage,
    heroImageScale,
    heroImagePositionX,
    heroImagePositionY,
    heroVideo,
    borderRadius,
    enableDarkMode,
    enableAnimations,
    showProductShadows,
    gridColumns,
  } = data;
  
  // Template-specific styling (visual only)
  // Each template renders these values in its own visual style
  
  return (
    <div style={{ backgroundColor: secondaryColor }}>
      {/* Hero with universal data */}
      <h1 data-edit-path="__settings.template_hero_heading">{heroTitle}</h1>
      <p data-edit-path="__settings.template_hero_subtitle">{heroSubtitle}</p>
      
      {/* Hero image with scale/position */}
      {heroImage && (
        <img 
          src={heroImage}
          data-edit-path="__settings.banner_url"
          style={{
            transform: `scale(${heroImageScale})`,
            objectPosition: `${heroImagePositionX * 100}% ${heroImagePositionY * 100}%`
          }}
        />
      )}
      
      {/* Buttons with universal text */}
      <button 
        data-edit-path="__settings.template_button_text"
        style={{ backgroundColor: accentColor, borderRadius }}
      >
        {heroCtaText}
      </button>
    </div>
  );
}
```

---

## Questions to Answer

Before implementing, let's confirm:

1. **Q: Are Basic edits for free users and Advanced for paid?**
   A: ✅ **Basic = Bronze, Silver, and Free Month users**
      **Advanced = Gold subscription ONLY**

2. **Q: Should the editor UI separate Basic/Advanced into tabs?**
   A: ✅ **YES - Separate tabs in the editor**

3. **Q: What's the difference in capability?**
  A: ✅ **Basic**: Change texts, colors, hero image, hero video URL, dark mode
    **Advanced (Gold)**: Resize/position hero image, layout controls, and unlimited structure editing

4. **Q: Which templates should we update first?**
   A: _____________

5. **Q: Are there any other Basic edits missing?**
   A: _____________

6. **Q: Are there any other Advanced edits missing?**
   A: _____________

---

## Subscription Tiers - Edit Permissions

| Feature | Bronze | Silver | Gold |
|---------|--------|--------|------|
| **BASIC EDITS** | ✅ | ✅ | ✅ |
| Store Name/Logo | ✅ | ✅ | ✅ |
| Hero Text (title, subtitle) | ✅ | ✅ | ✅ |
| Button Text | ✅ | ✅ | ✅ |
| Colors (all 6) | ✅ | ✅ | ✅ |
| Font Family | ✅ | ✅ | ✅ |
| Heading Size | ✅ | ✅ | ✅ |
| Hero Image Upload/Change | ✅ | ✅ | ✅ |
| Hero Video URL | ✅ | ✅ | ✅ |
| Dark Mode Toggle | ✅ | ✅ | ✅ |
| **ADVANCED EDITS (Gold Unlimited)** | ❌ | ❌ | ✅ |
| Image Resize/Scale | ❌ | ❌ | ✅ |
| Image Position (focal point) | ❌ | ❌ | ✅ |
| Autoplay/Loop/Muted controls | ❌ | ❌ | ✅ |
| Move Sections / Structure edits | ❌ | ❌ | ✅ |
| Add/Remove Sections | ❌ | ❌ | ✅ |
| Change Hero Layout | ❌ | ❌ | ✅ |
| Grid Columns | ❌ | ❌ | ✅ |
| Section Padding | ❌ | ❌ | ✅ |
| Border Radius | ❌ | ❌ | ✅ |
| Animations Toggle | ❌ | ❌ | ✅ |

> **Free Month (trial)**: Same as Bronze/Silver (Basic only)

---

## Templates Status

| Template | Basic Done | Advanced Done | Notes |
|----------|------------|---------------|-------|
| shiro-hana | ✅ | ✅ | Reference template |
| baby | ⬜ | ⬜ | |
| fashion | ⬜ | ⬜ | |
| perfume | ⬜ | ⬜ | |
| jewelry | ⬜ | ⬜ | |
| bags | ⬜ | ⬜ | |
| store | ⬜ | ⬜ | |
| furniture | ⬜ | ⬜ | |
| electronics | ⬜ | ⬜ | Started |
| beauty | ⬜ | ⬜ | |
| fashion2 | ⬜ | ⬜ | |
| fashion3 | ⬜ | ⬜ | |
| cafe | ⬜ | ⬜ | |
| food | ⬜ | ⬜ | |
| beaty | ⬜ | ⬜ | |

---

## Session Notes

_Add notes here as we work through templates:_

### Session 1 - December 30, 2025
- Created this planning document
- Questions pending answers from user

