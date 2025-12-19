# How to Test Template Image Uploads

## Quick Start

1. **Start the dev server** (if not already running):
   ```bash
   pnpm dev
   ```

2. **Navigate to Template Settings**:
   - Go to http://localhost:5174 (or 5173/5175)
   - Login as store owner
   - Go to "Store Settings" → "Customize Template"

3. **Select a Template** (e.g., "Fashion"):
   - You'll see the template selector at the top
   - Click "Fashion" template

4. **Upload a Hero Image**:
   - Scroll to "Fashion-Specific: Hero Section"
   - Click "Hero Banner Image" field
   - Upload a JPG or PNG file
   - You'll see a small preview thumbnail
   - Click "Save Changes"

5. **Check the Live Preview**:
   - The preview on the right should update with your uploaded image
   - The hero section should now show your custom image instead of placeholder

6. **Verify it Persists**:
   - Reload the page
   - Go back to Template Settings
   - The image should still be there in the preview

7. **Test on Storefront**:
   - Visit your storefront
   - The hero image should display in the actual store

## Test All Templates

### Fashion-based templates:
- **Fashion**: Upload to `banner_url` field
- **Fashion 2**: Upload to `banner_url` field  
- **Fashion 3**: Upload to multiple lookbook images + hotspot image

### Specialty templates:
- **Bags**: Upload `banner_url` (hero) + `template_bg_image` (background)
- **Jewelry/Beauty/Food/Furniture/Baby/Cafe**: Upload to `banner_url`
- **Electronics**: Upload to `banner_url` + enter product IDs

## Troubleshooting

**Image upload button not appearing?**
- Make sure migrations have run: Check database for new columns
- Restart server: `pnpm dev`

**Upload succeeds but image doesn't show in preview?**
- Save changes - preview may not update until saved
- Check browser console for errors
- Verify image URL is valid: Right-click image → "Copy Image Address"

**Image uploads but doesn't persist?**
- Check that database migration ran: 20251219_add_template_image_fields.sql
- Check that API response has correct URL format
- Verify `/api/upload` endpoint is working

**Live preview looks different than storefront?**
- This is expected if settings haven't been saved
- Always click "Save Changes" after uploading
- Storefront fetches fresh settings each visit

## Development Notes

### File Structure
```
client/pages/TemplateSettings.tsx
  - Template configuration with image fields
  - Image upload UI with preview
  - Live preview rendering

server/migrations/20251219_add_template_image_fields.sql
  - Database columns for all template images
  
client/components/templates/*.tsx
  - Each template consumes settings.banner_url, settings.template_bg_image, etc.
  - Uses settings values, falls back to placeholders
```

### Key Code Paths
1. **Upload**: TemplateSettings.tsx → uploadImage() → /api/upload
2. **Save**: handleSave() → /api/client/store/settings (POST)
3. **Preview**: templateComponents[template] receives settings object
4. **Display**: Each template component uses settings image URLs

### Database Schema
```sql
client_store_settings table columns:
- banner_url VARCHAR(500) -- Main hero image for most templates
- template_bg_image VARCHAR(500) -- Background image (Bags)
- template_lookbook_1/2/3 VARCHAR(500) -- Lookbook images (Fashion3)
- template_hotspot_image VARCHAR(500) -- Outfit hotspot image (Fashion3)
- template_video_url VARCHAR(500) -- Video URL (Fashion3)
- template_hero_bg_blur INTEGER -- Blur effect amount (Bags)
- ... and 30+ more template-specific fields
```

## Expected Behavior

✅ Upload image → See thumbnail in settings
✅ Click Save → Image saved to database
✅ Reload page → Image still there
✅ View storefront → Image displays in store
✅ Change image → New image takes precedence
✅ Empty field → Template shows placeholder (no image)

## Performance

- Image upload: < 1 second (upload to /uploads/)
- Settings save: < 1 second (store in database)
- Page load: No additional delay (images are URLs, not base64)
- Storefront load: Loads images lazily (better performance)
