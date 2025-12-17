# Template-Specific Settings Guide

## Overview

Each template in your store system now has **unique, customizable settings fields** that match its design and functionality. When you select a different template, the settings form automatically changes to show only the fields relevant to that template.

## How It Works

1. **Template Selection**: Choose a template from the horizontal template selector
2. **Dynamic Form**: The settings form below changes to show template-specific fields
3. **Sections**: Each template organizes settings into logical collapsible sections
4. **Save**: Click "Save Changes" to persist settings to your store

## Template-Specific Settings

### 📦 Fashion (Minimal)
**Design**: Simple, clean fashion store with gender/category/fit filters

**Customizable Fields**:
- **Hero Section**:
  - Main Heading (e.g., "Fashion Store")
  - Subtitle (e.g., "Discover our collection")
  - Button Text (e.g., "Shop Now")
  - Banner Image URL
- **Colors & Style**:
  - Accent Color (color picker)

**What It Controls**: Hero section text, banner image, and accent color for buttons/highlights

---

### 👗 Fashion 2 (Modern)
**Design**: 3-image hero layout with modern aesthetic

**Customizable Fields**:
- **Hero Section**:
  - Main Heading (e.g., "Build a fashion store that feels like a campaign")
  - Subtitle (e.g., "Push your key pieces first")
  - Button Text (e.g., "Shop Now")
  - Hero Banner Image

**What It Controls**: Three-image hero carousel text and the main banner image

---

### ✨ Fashion 3 (Dark Theme - Advanced)
**Design**: Premium fashion store with video hero, hotspots, lookbook, and seasonal banners

**Customizable Fields**:
- **Video Hero**:
  - Hero Video URL (mp4/webm)
  
- **Hotspot Configuration**:
  - Hotspot Image URL (the outfit image with clickable points)
  - Hotspot Points (JSON array with positions, labels, and prices)
    ```json
    [
      {"id":1,"x":"30%","y":"40%","label":"Oversized Coat","price":16000},
      {"id":2,"x":"60%","y":"65%","label":"Tapered Trousers","price":7800},
      {"id":3,"x":"80%","y":"70%","label":"Minimal Sneakers","price":9500}
    ]
    ```
  
- **Lookbook**:
  - Lookbook Images (one URL per line - displays outfit lookbook slider)
  
- **Seasonal Banner**:
  - Seasonal Drop Title (e.g., "Drop 01 · Night Shift")
  - Drop Description (e.g., "Oversized coat, cargos and sneakers — limited run.")

**What It Controls**: Video background, clickable hotspots on images, lookbook slider, top seasonal banner with yellow gradient

**Theme**: Dark gray background with yellow (#FFED4E) accents

---

### 🎮 Electronics
**Design**: Tech-focused store with product specs and featured items

**Customizable Fields**:
- **Hero Section**:
  - Main Heading (e.g., "Flagship performance for your entire tech store")
  - Subtitle (e.g., "Showcase phones, headphones, gaming gear...")
  - Hero Badge (e.g., "2024 Latest")
  
- **Featured Products**:
  - Main Hero Product ID (which product to highlight in hero)
  - Secondary Hero Product ID (for split hero section)
  - Best Sellers IDs (comma-separated, e.g., "1,2,3,4")
  - Deals IDs (comma-separated, e.g., "5,6,7")

**What It Controls**: Which products appear in featured sections, hero badges, featured product details

**Theme**: Dark with cyan/blue gradient accents

---

### 🍰 Food/Cafe
**Design**: Bakery/food store with category filters and tasting journey

**Customizable Fields**:
- **Hero Section**:
  - Main Heading (e.g., "Premium Food Selection")
  - Subtitle (e.g., "Authentic flavors from our kitchen")
  - Banner Image URL
  
- **Layout Settings**:
  - Products per Row (1-6)

**What It Controls**: Hero text, banner image, grid layout density

---

### 🛋️ Furniture
**Design**: Modern furniture megastore with mega menu, price filter, compare functionality

**Customizable Fields**:
- **Hero Section**:
  - Main Heading (e.g., "Furniture Collection")
  - Banner Image URL
  
- **Mega Menu Categories**:
  - Categories (JSON array, e.g., `["Living Room","Bedroom","Office","Dining"]`)
  
- **Price Range**:
  - Minimum Price (default: 0)
  - Maximum Price (default: 100000)

**What It Controls**: Mega menu dropdown options, price range slider defaults, hero text

**Theme**: Light gray with white accents

---

### 💍 Jewelry
**Design**: Luxury jewelry with "The Gold Edit" featured section and material filtering

**Customizable Fields**:
- **Hero Section**:
  - Main Heading (e.g., "Luxury Jewelry Collection")
  - Banner Image URL
  
- **Material Types**:
  - Materials (comma-separated, e.g., "Gold,Silver,Platinum,Rose Gold")
  
- **Gold Edit Section**:
  - Featured Product IDs (comma-separated, e.g., "1,2,3,4")

**What It Controls**: Available material filter options, featured collection items, hero text

---

### 🌸 Perfume
**Design**: Premium fragrance store with "Realms of Scent" concept (Noir, Gold, Dream)

**Customizable Fields**:
- **Hero Section**:
  - Main Heading (e.g., "The Realms of Scent")
  - Subtitle (e.g., "Discover scents that tell your story")
  
- **Realm Filters**:
  - Realms (comma-separated, e.g., "All,Noir,Gold,Dream")

**What It Controls**: Filter categories for scent realms, hero section text

**Theme**: Deep black with amber/gold accents

---

### 👶 Baby
**Design**: Baby products store with simple grid layout

**Customizable Fields**:
- **Hero Section**:
  - Main Heading (e.g., "Baby Products")
  - Banner Image URL
  
- **Layout Settings**:
  - Grid Columns (1-6, recommended: 4)

**What It Controls**: Hero text, banner image, product grid density

---

### 👜 Bags
**Design**: Luxury bags and accessories with material-based filtering

**Customizable Fields**:
- **Hero Section**:
  - Main Heading (e.g., "Bags & Accessories")
  - Banner Image URL
  
- **Filter Configuration**:
  - Materials (comma-separated, e.g., "Leather,Canvas,Nylon,Suede,Velvet")
  - Bag Types (comma-separated, e.g., "Tote,Crossbody,Clutch,Backpack")

**What It Controls**: Available filter options for materials and bag types, hero text

---

### 💄 Beauty
**Design**: Beauty/skincare store with shade finder color swatches

**Customizable Fields**:
- **Hero Section**:
  - Main Heading (e.g., "Find Your Perfect Shade")
  - Banner Image URL
  
- **Shade Colors**:
  - Shade Colors (JSON array of hex colors, e.g., `["#F5D5B8","#E8C4A0","#D4A574","#C9915C","#B8713F"]`)
  
- **Layout Settings**:
  - Products per Row (1-6, recommended: 4)

**What It Controls**: Shade finder color swatches, hero text, product grid density

**Theme**: Pink accents (#F5D5B8 to #B8713F gradient)

---

### ☕ Cafe/Bakery
**Design**: Artisan cafe/bakery with store info and categories

**Customizable Fields**:
- **Hero Section**:
  - Main Heading (e.g., "Artisan Bakery & Cafe")
  - Banner Image URL
  
- **Store Information**:
  - Since Year (e.g., 2021)
  - City/Location (e.g., "Algiers")

**What It Controls**: Hero text, banner image, "since" year display, location information

---

## JSON Configuration Examples

### Hotspots (Fashion3)
```json
[
  {
    "id": 1,
    "x": "30%",
    "y": "40%",
    "label": "Oversized Coat",
    "price": 16000,
    "productKey": "coat"
  },
  {
    "id": 2,
    "x": "60%",
    "y": "65%",
    "label": "Tapered Trousers",
    "price": 7800,
    "productKey": "trousers"
  }
]
```

### Shade Colors (Beauty)
```json
["#F5D5B8", "#E8C4A0", "#D4A574", "#C9915C", "#B8713F"]
```

### Mega Menu Categories (Furniture)
```json
["Living Room", "Bedroom", "Office", "Dining", "Outdoor"]
```

---

## Common Tasks

### How to change the hero banner image
1. Navigate to the template's settings page
2. Find the "Hero Section" or "Banner Image URL" field
3. Paste the full image URL (must start with http:// or https://)
4. Click "Save Changes"

### How to add featured products (Electronics)
1. Copy the product IDs you want to feature
2. Paste into "Best Sellers IDs" field (comma-separated)
3. Click "Save Changes"

### How to customize hotspots (Fashion3)
1. Get the outfit image URL
2. Paste into "Hotspot Image URL"
3. In "Hotspot Points", paste JSON with positions as percentages (x%, y%)
4. Click "Save Changes"

### How to change filter options (Bags, Jewelry, Perfume)
1. Find the appropriate filter field (Materials, Realms, etc.)
2. Edit the comma-separated list
3. Click "Save Changes"
4. The filter buttons will update automatically

---

## Tips & Best Practices

1. **Image URLs**: Always use full URLs starting with `https://`
2. **JSON Fields**: Use valid JSON format. Test with a JSON validator if unsure.
3. **Comma-separated values**: No spaces needed after commas, but spacing won't break it
4. **Color picker**: For hex colors, you can use the color picker or type hex codes manually
5. **Percentages in hotspots**: Use values like "30%" for x/y positions (% of image width/height)
6. **Preview**: Use the "Preview" button to see how settings affect your template
7. **Save before leaving**: Always click "Save Changes" before navigating away

---

## Field Validation

- **URLs**: Must be valid http(s) URLs
- **Numbers**: Must be numeric values (no text)
- **JSON**: Must be valid JSON syntax
- **Percentages**: Use format like "30%" not "0.3" or "30"
- **Hex Colors**: Use format like "#FFFFFF" or "#FFF"

---

## Template-Specific Colors

- **Fashion**: Accent color (user-defined)
- **Fashion3**: Yellow (#FFED4E) with gray-900
- **Electronics**: Cyan/Blue gradient (fixed)
- **Jewelry**: Gold accents (fixed)
- **Perfume**: Amber/Gold on black (fixed)
- **Beauty**: Pink gradient (fixed)
- **Furniture**: Light gray/white (fixed)
- **Cafe**: Warm beige/tan (fixed)

---

## What Happens When You Switch Templates?

1. Your settings are saved separately for each template
2. When you switch to a template you've already configured, your previous settings load
3. If you switch to a template for the first time, it uses default values
4. Your products remain the same - only the layout/display changes

---

## Troubleshooting

**Q: The form fields didn't change when I selected a new template**
- A: Refresh the page to reload settings for the new template

**Q: My hotspots aren't showing up (Fashion3)**
- A: Check that your JSON is valid and hotspot image URL is correct

**Q: Featured products aren't displaying (Electronics)**
- A: Verify the product IDs exist in your store and are entered correctly

**Q: Save button shows error**
- A: Check that all URL fields start with `https://` and all JSON is valid

---

## Next Steps

1. Select your desired template
2. Fill in all customizable fields
3. Use the Preview panel to see changes in real-time
4. Save when satisfied
5. Your store's appearance will update immediately!

