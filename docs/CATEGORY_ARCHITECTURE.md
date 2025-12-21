# Category Management - Architecture & Implementation

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORE OWNER DASHBOARD                        │
│                  Template Settings Page                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📂 Categories Section                                          │
│  ├─ CategoryManager Component (React)                          │
│  │  ├─ Display current categories (colored pills)             │
│  │  ├─ Add new category (name + color picker)               │
│  │  └─ Remove category (X button)                           │
│  │                                                           │
│  └─ Save Button                                             │
│     └─ PUT /api/client/store/settings                      │
│        └─ Save to DB                                       │
│                                                            │
└───────────────────────────────────────────────────────────────┘
                              ↓
                    [Database Updated]
                              ↓
┌───────────────────────────────────────────────────────────────┐
│              CLIENT STOREFRONT (Public)                        │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Template (Cafe/Jewelry/Perfume)                             │
│  ├─ Fetch settings: GET /api/client/store/settings          │
│  ├─ Parse template_categories JSON                          │
│  ├─ Display category filters                               │
│  └─ Apply custom colors to buttons                         │
│                                                             │
│  Category Filters:                                          │
│  [All] [Makroud] [Zlabia] [Kalb el louz]                 │
│    ↓        ↓          ↓         ↓                        │
│  Show all  Filter by  Filter by Filter by               │
│  products  Makroud    Zlabia    Kalb el louz            │
│                                                          │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Creating Categories
```
User Input (UI)
    ↓
CategoryManager Component
    ├─ Parse input: name + color
    ├─ Convert to JSON: [{name: "X", color: "#YYY"}]
    └─ Update local state
    ↓
Save Button
    ↓
PUT /api/client/store/settings
{
  "template_categories": "[{\"name\":\"Electronics\",\"color\":\"#3B82F6\"}]"
}
    ↓
Database (client_store_settings.template_categories)
    ↓
Success Response
    ↓
User sees: "Settings saved successfully!"
```

### 2. Displaying Categories (Frontend)
```
Template Component Mounts
    ↓
useTemplateUniversalSettings() Hook
    ↓
Fetch settings from DB
    ↓
useMemo() - Parse template_categories
    {
      const customCategories = JSON.parse(settings.template_categories);
      // Returns: [{name: "Electronics", color: "#3B82F6"}, ...]
    }
    ↓
Build category list
    {
      if (customCategories.length > 0)
        use customCategories
      else
        use product.category field
    }
    ↓
Render category buttons with custom colors
    {
      customCategories.map(cat => 
        <button style={{ color: cat.color }}>
          {cat.name}
        </button>
      )
    }
    ↓
Customer clicks category → Filter products
```

### 3. Filtering Logic
```
Customer clicks category button
    ↓
setActiveCategory(categoryName)
    ↓
Filter products array
    {
      products.filter(p => 
        p.category === activeCategory
      )
    }
    ↓
Re-render with filtered products
    ↓
Customer sees only products in that category
```

## Component Architecture

### CategoryManager Component
**Location:** `/client/pages/TemplateSettings.tsx`

```typescript
interface CategoryManagerProps {
  categories: string | any[];  // JSON string or array
  onChange: (cats: string) => void;  // Callback to parent
  isDarkMode: boolean;  // Theme support
}

State:
- cats: Category[]  // Array of {name, color}
- newCategoryName: string  // Input for new category
- newCategoryColor: string  // Color picker value

Methods:
- handleAddCategory()  // Add new category to list
- handleRemoveCategory(index)  // Remove category from list
- onChange()  // Notify parent of changes
```

### Template Integration

Each template that supports categories:

```typescript
// 1. Parse settings
const customCategories = useMemo(() => {
  try {
    const cats = settings.template_categories;
    if (typeof cats === 'string') {
      return JSON.parse(cats);
    }
    return Array.isArray(cats) ? cats : null;
  } catch {
    return null;
  }
}, [settings]);

// 2. Build category list (with fallback)
let categoryList = [];
if (customCategories?.length > 0) {
  categoryList = ['all', ...customCategories.map(c => c.name)];
} else {
  categoryList = ['all', ...products.map(p => p.category)];
}

// 3. Use in render
{categoryList.map(cat => (
  <button 
    onClick={() => setActiveCategory(cat)}
    style={{ color: getCategoryColor(cat) }}
  >
    {cat}
  </button>
))}
```

## Database Schema

### Table: client_store_settings
```sql
Column: template_categories
Type: TEXT
Default: '[]'
Format: JSON string

Example:
'[
  {
    "name": "Electronics",
    "color": "#3B82F6"
  },
  {
    "name": "Clothing",
    "color": "#8B5CF6"
  }
]'
```

### Migration
**File:** `/server/migrations/20251220_add_template_categories.sql`
- Adds column if not exists
- Sets default to empty array
- Creates index for performance
- Adds column comment for documentation

## API Endpoints

### Fetch Settings (includes categories)
```
GET /api/client/store/settings
Headers: Authorization: Bearer {token}

Response:
{
  "id": 1,
  "client_id": 123,
  "store_name": "My Store",
  "template_categories": "[{\"name\":\"Cat1\",\"color\":\"#FFF\"}]",
  ...other fields
}
```

### Update Settings (update categories)
```
PUT /api/client/store/settings
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "template_categories": "[{\"name\":\"Electronics\",\"color\":\"#3B82F6\"}]"
}

Response:
{
  "success": true,
  "message": "Settings updated"
}
```

## File Structure

```
/client
├── pages
│   └── TemplateSettings.tsx
│       ├── CategoryManager component (NEW)
│       └── Template settings form
│
└── components/templates
    ├── cafe.tsx (UPDATED)
    ├── jewelry.tsx (UPDATED)
    ├── perfume.tsx (UPDATED)
    └── [other templates]

/server
└── migrations
    └── 20251220_add_template_categories.sql (NEW)
```

## Error Handling

### Frontend
```typescript
try {
  const cats = JSON.parse(settings.template_categories);
  return cats;
} catch (error) {
  console.error('Failed to parse categories');
  return null;  // Fallback to product categories
}
```

### Fallback Logic
1. If custom categories parsed successfully → use them
2. Else if product categories exist → use them
3. Else → show "All" filter only

## Performance Considerations

### Optimization 1: Memoization
```typescript
const customCategories = useMemo(() => {
  // Parse categories only when settings change
  // Prevents unnecessary re-renders
}, [settings]);
```

### Optimization 2: Minimal JSON
- Store as compact JSON string
- Categories are simple objects: {name, color}
- No nested structures

### Optimization 3: Database Index
```sql
CREATE INDEX idx_client_store_settings_client_id 
ON client_store_settings(client_id);
```

## Security Considerations

### Input Validation
- Category names: String validation
- Colors: Must be valid hex (#RRGGBB)
- Not exposed to customers (read-only access)

### Access Control
- Only authenticated store owners can modify
- Authorization checks in API endpoint
- User can only modify their own settings

## Testing Checklist

### Unit Tests
- [ ] CategoryManager adds category correctly
- [ ] CategoryManager removes category correctly
- [ ] Color picker updates correctly
- [ ] JSON parsing handles invalid input

### Integration Tests
- [ ] Categories save to database
- [ ] Categories load from database
- [ ] Settings endpoint returns categories
- [ ] Templates use categories correctly

### E2E Tests
- [ ] Store owner can create categories
- [ ] Categories appear in storefront
- [ ] Filtering works with categories
- [ ] Colors apply correctly
- [ ] Works on mobile devices

### Fallback Tests
- [ ] Falls back to product categories if no custom categories
- [ ] Handles empty category list
- [ ] Handles malformed JSON gracefully

## Supported Templates

### Current
- ✅ Cafe/Bakery
- ✅ Jewelry
- ✅ Perfume

### Easy to Add (Follow Same Pattern)
- Fashion
- Fashion 2
- Fashion 3
- Electronics
- Furniture
- Food
- Beauty
- Bags
- Baby

### How to Add to Any Template
1. Add custom categories parsing (like Cafe template)
2. Update category list building logic
3. Use custom colors in render
4. Test thoroughly

## Future Enhancements

### Phase 2
- [ ] Drag-to-reorder categories
- [ ] Category icons/emojis
- [ ] Category descriptions
- [ ] Category analytics (clicks, conversions)

### Phase 3
- [ ] Sub-categories (two-level hierarchy)
- [ ] Category-specific promotions
- [ ] Auto-categorization based on product names
- [ ] Category-level inventory management

### Phase 4
- [ ] Category page templates
- [ ] Category-specific landing pages
- [ ] SEO optimization per category
- [ ] Category performance dashboard
