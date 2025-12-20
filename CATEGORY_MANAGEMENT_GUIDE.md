# Store Category Management - Complete Implementation Guide

## Overview
Store owners can now create and manage custom categories within their template settings. Categories appear as filters in the storefront and can have custom names and colors.

## Features

### 1. **Category Management UI**
- Located in **Template Settings** → **Categories** section
- Simple interface to add/remove categories
- Each category has:
  - **Name**: The display name for the category
  - **Color**: A custom color for visual distinction

### 2. **How It Works**

#### For Store Owners:
1. Go to **Store Settings** → **Template Settings**
2. Scroll to the **📂 Categories** section
3. Click **Add** to create new categories
4. Enter category name + choose a color
5. Click **Save** to apply changes
6. Categories immediately appear as filters in your storefront

#### For Customers:
- Categories appear as colored filter buttons
- Click to filter products by category
- Works alongside product category field (if no custom categories, falls back to product categories)

### 3. **Data Format**
Categories are stored as JSON in the database:
```json
[
  {
    "name": "Electronics",
    "color": "#3B82F6"
  },
  {
    "name": "Clothing", 
    "color": "#8B5CF6"
  },
  {
    "name": "Home Decor",
    "color": "#EC4899"
  }
]
```

### 4. **Template Support**
Categories are supported in:
- ✅ **Cafe/Bakery** - Browse by category (Makroud, Kalb el louz, etc.)
- ✅ **Jewelry** - Collections (Gold, Silver, Pearl, etc.)
- ✅ **Perfume** - Realms (Noir, Gold, Dream, etc.)
- ✅ **All other templates** - Can be extended easily

### 5. **API Integration**

#### Fetch Settings (includes categories):
```
GET /api/client/store/settings
Authorization: Bearer {token}

Response:
{
  "template_categories": "[{\"name\":\"Electronics\",\"color\":\"#3B82F6\"}]",
  ...other settings
}
```

#### Update Categories:
```
PUT /api/client/store/settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "template_categories": "[{\"name\":\"New Category\",\"color\":\"#FF0000\"}]"
}
```

### 6. **Database Schema**
```sql
-- Added column to client_store_settings table
template_categories TEXT DEFAULT '[]'
-- Example: '[{"name":"Category1","color":"#FF0000"}]'
```

### 7. **Frontend Components**

#### CategoryManager Component
Location: `/client/pages/TemplateSettings.tsx`

Features:
- Add categories with instant visual feedback
- Remove categories with delete button
- Color picker for custom styling
- Shows all current categories with their colors
- Automatically converts between JSON string and array format

Usage:
```jsx
<CategoryManager 
  categories={settings.template_categories} 
  onChange={(cats) => handleChange('template_categories', cats)}
  isDarkMode={isDarkMode}
/>
```

### 8. **Template Implementation**

#### How Templates Use Categories:

**Cafe Template Example:**
```typescript
// Parse custom categories from settings
const customCategories = useMemo(() => {
  try {
    const cats = (settings as any).template_categories;
    if (typeof cats === 'string') {
      return JSON.parse(cats);
    }
    return Array.isArray(cats) ? cats : null;
  } catch {
    return null;
  }
}, [settings]);

// Use custom categories OR fall back to product categories
let categoryList: any[] = [];
if (customCategories && customCategories.length > 0) {
  categoryList = ['all', ...customCategories.map((c: any) => c.name || c)];
} else {
  categoryList = ['all', ...new Set(products.map((p: any) => p.category || 'Menu'))];
}

// Apply custom colors to category buttons
{categoryList.map((cat) => {
  const customCat = customCategories?.find((c: any) => (c.name || c) === cat);
  const catColor = customCat?.color || primary_color;
  
  return (
    <button style={{ borderColor: catColor, backgroundColor: activeCategory === cat ? catColor : '...' }}>
      {cat}
    </button>
  );
})}
```

### 9. **Priority Logic**
1. If **custom categories** defined in template settings → use them
2. Else if **product categories** exist → use product categories
3. Else → show default "All" filter only

### 10. **User Journey**

```
Store Owner:
  1. Creates store
  2. Uploads products with categories
  3. (Optional) Goes to Template Settings
  4. Creates custom categories: "Makroud", "Zlabia", "Kalb el louz"
  5. Assigns colors to each category
  6. Saves settings

Customer:
  1. Visits storefront
  2. Sees category filters: "All", "Makroud", "Zlabia", "Kalb el louz"
  3. Clicks category to filter products
  4. Products filtered by selected category
```

### 11. **Benefits**
- ✨ **Fully customizable** - Store owners control category names
- 🎨 **Branded colors** - Match store branding with category colors
- 🔄 **Flexible fallback** - Works with or without custom categories
- 📱 **Responsive** - Works on all devices
- 🚀 **Easy to use** - Simple UI, no JSON required
- 💾 **Persistent** - Categories saved in database

### 12. **Future Enhancements**
- Drag-to-reorder categories
- Category icons/emojis
- Multi-level sub-categories
- Category-specific product limits
- Category analytics and performance tracking

### 13. **Files Modified**
1. `/client/pages/TemplateSettings.tsx` - Added CategoryManager component and UI
2. `/client/components/templates/cafe.tsx` - Integrated custom categories
3. `/client/components/templates/jewelry.tsx` - Integrated custom categories
4. `/client/components/templates/perfume.tsx` - Integrated custom categories
5. `/server/migrations/20251220_add_template_categories.sql` - Database schema

### 14. **Testing Checklist**
- [ ] Add new categories in Template Settings
- [ ] Verify categories appear in storefront
- [ ] Test category filtering works
- [ ] Check custom colors apply to buttons
- [ ] Verify categories save on refresh
- [ ] Test fallback to product categories (if no custom categories)
- [ ] Test on mobile devices
- [ ] Test dark mode compatibility
