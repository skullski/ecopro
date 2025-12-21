# Category Management - Quick Start Guide

## What's New?
Store owners can now **create custom categories** in their template settings with custom names and colors. These categories appear as filters in the storefront.

## How to Use (Store Owner Perspective)

### Step 1: Go to Template Settings
- Click **Store Settings** in dashboard
- Select **Template Settings**

### Step 2: Find Categories Section
- Scroll down to **📂 Categories** section
- Click to expand

### Step 3: Add Categories
```
Current Categories: [Shows existing categories as colored pills]

Add New Category:
┌─────────────────────────────────────────────────┐
│ Category name... │ [Color Picker] │ [Add Button] │
└─────────────────────────────────────────────────┘
```

### Step 4: Create Your Categories
Examples:
- **Makroud** (Golden color #D4AF37)
- **Zlabia** (Orange color #FF8C00)
- **Kalb el louz** (Brown color #8B4513)
- **Electronics** (Blue color #3B82F6)
- **Clothing** (Purple color #8B5CF6)

### Step 5: Save
Click **Save Settings** button - categories now appear in your storefront!

## How It Looks in Storefront

### Without Custom Categories:
```
Filter buttons: All | [Product Categories from Products]
```

### With Custom Categories:
```
Filter buttons: All | Makroud | Zlabia | Kalb el louz | Tcharek
```

Each button has:
- Custom color you chose
- Highlighted when selected
- Filters products by category

## Key Features

✅ **Simple UI** - No JSON needed, just name + color picker
✅ **Visual Feedback** - See categories appear as colored pills
✅ **One-Click Delete** - Remove categories with X button
✅ **Smart Fallback** - If no custom categories, uses product categories
✅ **Persistent** - Categories saved in database
✅ **Mobile Friendly** - Works on all devices
✅ **Dark Mode** - Supports dark theme

## Examples by Template Type

### Cafe/Bakery Store
Suggested Categories:
- Makroud (Golden)
- Zlabia (Orange)
- Kalb el louz (Brown)
- Tcharek (Red)
- Ghribia (Yellow)
- Mixed Trays (Purple)

### Jewelry Store
Suggested Categories:
- Gold Collections (Gold #D4AF37)
- Silver Collections (Silver #C0C0C0)
- Pearl Pieces (White #F0F0F0)
- Diamond (Cyan #00FFFF)
- Mixed Materials (Purple #8B5CF6)

### Perfume Store
Suggested Categories:
- Noir Extrait (Dark #2D3436)
- Golden Luxe (Gold #D4AF37)
- Dreamscape (Blue #87CEEB)
- Limited Edition (Red #FF0000)
- New Arrivals (Green #00FF00)

### Fashion Store
Suggested Categories:
- Men (Blue #3B82F6)
- Women (Pink #EC4899)
- Kids (Green #10B981)
- Accessories (Orange #F97316)
- Sale (Red #EF4444)

## Technical Details

### Database
Categories stored in `client_store_settings.template_categories` as JSON:
```json
[
  {"name": "Electronics", "color": "#3B82F6"},
  {"name": "Clothing", "color": "#8B5CF6"}
]
```

### API
- **GET** `/api/client/store/settings` - Fetch categories
- **PUT** `/api/client/store/settings` - Update categories

### Supported in Templates
✅ Cafe/Bakery
✅ Jewelry  
✅ Perfume
✅ All others (easy to add)

## Troubleshooting

**Q: Categories not showing?**
- A: Make sure you saved settings (click Save button)
- A: Check browser console for errors

**Q: Can I use product categories instead?**
- A: Yes! If no custom categories defined, template uses product categories

**Q: How many categories can I add?**
- A: Unlimited! But 5-8 works best for UX

**Q: Can I change category colors later?**
- A: Yes, just remove and re-add with new color

**Q: Does it affect existing products?**
- A: No, categories are just filters. Products keep their category field.

## Support
For questions or issues, check CATEGORY_MANAGEMENT_GUIDE.md for detailed documentation.
