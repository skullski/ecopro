# Template-Specific Settings - Quick Reference

## 🎯 What Changed?

Your TemplateSettings page now shows **different form fields for each template**. This means:

- **Fashion**: Shows hero heading/subtitle, banner URL, accent color
- **Fashion3**: Shows video URL, hotspot config, lookbook images, seasonal banner
- **Electronics**: Shows featured product IDs, best sellers, deals
- **Furniture**: Shows mega menu categories, price range
- **Perfume**: Shows realm filters (Noir, Gold, Dream)
- **Beauty**: Shows shade colors, layout settings
- **...and 6 more templates with their own unique fields**

---

## 🚀 How to Use

### Step 1: Select a Template
Click on any template button (Fashion, Fashion2, Fashion3, etc.) at the top of the settings page.

### Step 2: Form Updates Automatically
The settings form below will change to show only the fields that template needs.

### Step 3: Fill in Your Settings
- Expand collapsible sections (each has helpful descriptions)
- Fill in the text/URL/JSON fields
- Use the color picker for colors
- Check the preview on the right to see changes

### Step 4: Save
Click the "Save Changes" button. Your settings are saved immediately!

---

## 📝 Field Types

### Text Input
Simple text fields for titles, headings, labels
```
Example: "Premium Fashion Store"
```

### URL Input
Links to images, videos, etc.
```
Example: https://images.unsplash.com/photo-xxx?auto=format&fit=crop
```

### Number Input
Integers for IDs, quantities, columns
```
Example: 3 (for 3 columns in grid)
```

### Textarea (for JSON)
Complex configurations in JSON format
```
Example: [{"id":1,"x":"30%","y":"40%","label":"Product","price":1000}]
```

### Color Picker
Visual color selector with hex code input
```
Example: #FF5733
```

### Comma-Separated List
Multiple values separated by commas
```
Example: 1,2,3,4,5
```

---

## 🎨 Template-Specific Examples

### Fashion3: Adding Video Hero + Hotspots

**What to fill in:**
1. **Hero Video URL**: Your video file (mp4/webm)
2. **Hotspot Image URL**: The outfit image to show hotspots on
3. **Hotspot Points**: JSON with positions:
```json
[
  {"id":1,"x":"30%","y":"40%","label":"Coat","price":16000},
  {"id":2,"x":"60%","y":"65%","label":"Pants","price":8000}
]
```
4. **Lookbook Images**: One image URL per line (for the lookbook slider)
5. **Seasonal Banner Title & Subtitle**: For the drop banner at top

**Result**: Beautiful video hero with clickable hotspots!

---

### Electronics: Featuring Products

**What to fill in:**
1. **Main Hero Product ID**: Product ID to feature prominently
2. **Secondary Hero Product ID**: Secondary featured product
3. **Best Sellers IDs**: Comma-separated, e.g., `1,2,3,4`
4. **Deals IDs**: Comma-separated, e.g., `5,6,7`
5. **Hero Badge**: Text like "2024 Latest"

**Result**: Products automatically appear in featured sections!

---

### Furniture: Mega Menu Setup

**What to fill in:**
1. **Categories (JSON)**: `["Living Room","Bedroom","Office","Dining"]`
2. **Price Range**: Min and max for slider

**Result**: Dropdown menu with room categories, price filter works!

---

### Beauty: Shade Finder Setup

**What to fill in:**
1. **Shade Colors (JSON)**: `["#F5D5B8","#E8C4A0","#D4A574","#C9915C","#B8713F"]`
2. **Products per Row**: 4 (usually)

**Result**: Color swatches in hero section for shade finding!

---

## ✨ Key Features

✅ **Dynamic Forms** - Only show fields relevant to each template

✅ **Helpful Descriptions** - Each section explains what it controls

✅ **Real-time Preview** - See changes instantly (on supported templates)

✅ **Flexible Configs** - Support text, URLs, JSON, colors, numbers

✅ **Independent Templates** - Each template can have different settings

✅ **Template Switching** - Switch between templates without losing settings

✅ **Auto-save** - All changes persist to database

---

## 🔗 All 12 Templates

1. **Fashion** - Minimal fashion store
2. **Fashion 2** - Modern 3-image hero fashion
3. **Fashion 3** - Premium dark theme with video & hotspots
4. **Electronics** - Tech store with specs
5. **Food/Cafe** - Bakery/restaurant/cafe
6. **Furniture** - Modern furniture with mega menu
7. **Jewelry** - Luxury jewelry with materials
8. **Perfume** - Fragrance with realms
9. **Baby** - Baby products
10. **Bags** - Luxury bags & accessories
11. **Beauty** - Beauty/skincare with shade finder
12. **Cafe/Bakery** - Artisan cafe

---

## 📚 Full Documentation

See these files for complete details:

- **TEMPLATE_SETTINGS_GUIDE.md** - Detailed guide for each template
- **TEMPLATE_SETTINGS_IMPLEMENTATION.md** - Technical implementation details

---

## ⚡ Quick Tips

✅ **Always use HTTPS URLs** - Images and videos must be HTTPS

✅ **Test JSON** - Use a JSON validator if your config doesn't work

✅ **Percentages in hotspots** - Use "30%" not "0.3"

✅ **Hex colors** - Use "#FFFFFF" format

✅ **Save before leaving** - Click save to persist changes

✅ **Preview your changes** - Use the preview panel to verify

---

## 🎓 Common Tasks

### Change the banner image
1. Go to "Hero Section"
2. Paste new image URL in "Banner Image URL"
3. Save

### Add featured products (Electronics)
1. Find product IDs you want to feature
2. Paste into "Best Sellers IDs" (comma-separated)
3. Save

### Set up shade colors (Beauty)
1. Format colors as JSON: `["#color1","#color2",...]`
2. Paste into "Shade Colors"
3. Save

### Configure mega menu (Furniture)
1. Format categories as JSON: `["Room1","Room2",...]`
2. Paste into "Mega Menu Categories"
3. Save

---

## 💡 Pro Tips

- Use a color picker tool to get hex codes
- Use an image hosting service (Unsplash, Cloudinary) for images
- Keep JSON files simple - test in a JSON validator first
- Document your URLs somewhere safe in case you need to reuse them
- Take screenshots of your final configuration as backup

---

## ❓ Troubleshooting

**Form fields didn't change?**
→ Refresh the page to reload template settings

**Save button shows error?**
→ Check URLs start with "https://" and JSON is valid

**Settings disappeared?**
→ They're saved! Just reload the page and select the template again

**Preview not updating?**
→ Some templates don't support live preview. Still saves correctly though!

---

## 🎉 You're All Set!

Your store now has professional, template-aware settings. Each template can be configured independently with its own unique options!

**Next**: Start customizing each template with your store's branding, products, and colors!

