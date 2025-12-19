# Bags Template Testing Guide

## Pre-Test Checklist

### Environment Setup
- [ ] Development server running: `pnpm dev`
- [ ] Port 5173 accessible: `http://localhost:5173`
- [ ] Database connected and populated with test data
- [ ] Test store created with at least 5 products
- [ ] Browser: Chrome/Firefox/Safari with DevTools open

### Code Status
- [ ] Bags template wired: `/client/components/templates/bags.tsx` ✅
- [ ] No TypeScript errors: `pnpm typecheck` passed ✅
- [ ] ESLint clean: ready to check
- [ ] Hot reload working (save a file → page auto-updates)

## Testing Scenarios

### Test 1: Logo Display (5 min)

**Setup**:
1. Go to Template Settings → Bags Template → Branding section
2. Upload logo from file (or use: `https://via.placeholder.com/150x50?text=LOGO`)
3. Set logo_width to 200px
4. Save settings

**Expected Result**:
- Logo appears at top of Bags storefront
- Logo dimensions respect 200px width setting
- Logo has hover effect (opacity change)

**Test Commands**:
```javascript
// In browser console, verify logo element exists:
document.querySelector('[alt="Store Logo"]')

// Should return an <img> element
```

---

### Test 2: Color Customization (10 min)

**Setup**:
1. Go to Template Settings → Bags Template → Colors section
2. Set colors:
   - Primary Color: `#FF0000` (Red)
   - Secondary Color: `#FFFFCC` (Yellow)
   - Text Color: `#330000` (Dark Red)
   - Secondary Text Color: `#666666` (Gray)

3. Save settings
4. View Bags storefront

**Expected Results**:
- Headings and h1/h2 are red (#FF0000)
- "Buy Now" buttons are red
- Product cards have yellow backgrounds
- Body text is dark red
- Secondary text (categories, prices) is gray

**Test Commands**:
```javascript
// Verify primary color applied to heading:
const h1 = document.querySelector('h1');
const color = window.getComputedStyle(h1).color;
console.log(color); // Should be red

// Verify button color:
const btn = document.querySelector('button[class*="Buy"]');
const bgColor = window.getComputedStyle(btn).backgroundColor;
console.log(bgColor);
```

---

### Test 3: Dark Mode Toggle (10 min)

**Setup**:
1. Go to Template Settings → Bags Template → Theme section
2. Toggle `Enable Dark Mode` ON
3. Save settings
4. View Bags storefront

**Expected Results**:
- Background turns dark (near black)
- Text turns light (near white)
- Product cards have dark background
- Still readable
- All elements have high contrast

**Test Results**:
- Background color: Should be `#0a0a0a` or similar dark
- Text color: Should be light
- Verify on all sections: header, hero, filters, products, footer

**Step 2**: Toggle OFF
- Background returns to light
- Text returns to dark

---

### Test 4: Typography Size Scaling (10 min)

**Setup**:
1. Go to Template Settings → Bags Template → Typography section
2. Set `Heading Size Multiplier` to "Small"
3. Save and view Bags storefront
4. Measure/observe heading sizes

**Expected Results**:
- h1 size: 28px (smaller)
- h2 size: 18px (smaller)
- Still readable but more compact

**Test Step 2**:
1. Change to "Medium"
2. h1 size: 36px
3. h2 size: 22px
4. Moderate size

**Test Step 3**:
1. Change to "Large"
2. h1 size: 42px
3. h2 size: 26px
4. Prominent and attention-grabbing

**Verification**:
```javascript
// Check h1 size:
const h1 = document.querySelector('h1');
const fontSize = window.getComputedStyle(h1).fontSize;
console.log(fontSize); // Should be "28px", "36px", or "42px"
```

---

### Test 5: Layout & Spacing (10 min)

**Setup**:
1. Go to Template Settings → Bags Template → Layout section
2. Set `Section Padding` to 80px (maximum)
3. Save and view Bags storefront

**Expected Results**:
- Generous spacing between sections
- Product cards have large gaps
- Page feels spacious
- No text crowding

**Test Step 2**:
1. Change to 20px (minimum)
2. Sections close together
3. Compact, dense layout
4. Still readable but tight

**Verification**:
```javascript
// Check computed padding:
const section = document.querySelector('section');
const padding = window.getComputedStyle(section).padding;
console.log(padding);
```

---

### Test 6: Border Radius (5 min)

**Setup**:
1. Go to Template Settings → Bags Template → Layout section
2. Set `Border Radius` to 20px
3. Save and view Bags storefront

**Expected Results**:
- Buttons are very rounded (nearly pill-shaped)
- Product cards have rounded corners
- Images have rounded corners

**Test Step 2**:
1. Change to 2px
2. Buttons nearly square
3. Sharp angular appearance

**Test Step 3**:
1. Change to 0px
2. Perfect square corners
3. Geometric, strict appearance

---

### Test 7: Animations On/Off (10 min)

**Setup**:
1. Go to Template Settings → Bags Template → Theme section
2. Toggle `Enable Animations` ON
3. Save and view Bags storefront
4. Hover over buttons, product cards, images

**Expected Results**:
- Smooth transitions on hover
- Buttons scale slightly on hover
- Products fade/scale on hover
- ~0.3s transition time

**Test Step 2**:
1. Go back to settings
2. Toggle `Enable Animations` OFF
3. View storefront again
4. Hover over buttons and products

**Expected Results**:
- Instant interactions (no transition)
- No animation, just direct state change
- Feels snappier/more responsive

**Verification**:
```javascript
// Check computed transition:
const btn = document.querySelector('button');
const transition = window.getComputedStyle(btn).transition;
console.log(transition);
// With animations: "all 0.3s ease"
// Without: "none"
```

---

### Test 8: Product Shadows On/Off (5 min)

**Setup**:
1. Go to Template Settings → Bags Template → Theme section
2. Toggle `Show Product Shadows` ON
3. Save and view Bags storefront

**Expected Results**:
- Product cards have visible shadow effect (depth)
- Dark shadow below and around cards

**Test Step 2**:
1. Go back to settings
2. Toggle `Show Product Shadows` OFF
3. View storefront again

**Expected Results**:
- Shadows disappear
- Products look flat
- Cleaner, minimal appearance

---

### Test 9: Testimonials Section (10 min)

**Setup**:
1. Go to Template Settings → Bags Template → Testimonials section
2. Toggle `Show Testimonials` ON
3. Add test testimonials (JSON format):
   ```json
   [
     {"rating": 5, "text": "Excellent bags!", "author": "John Doe"},
     {"rating": 4, "text": "Great quality", "author": "Jane Smith"},
     {"rating": 5, "text": "Love it!", "author": "Bob Wilson"}
   ]
   ```
4. Save and view Bags storefront

**Expected Results**:
- Testimonials section appears above footer
- 3 cards displayed (grid layout)
- Star ratings visible (★★★★★)
- Author names shown
- Colors match theme

**Test Step 2**:
1. Change `Show Testimonials` to OFF
2. Testimonials section disappears completely

---

### Test 10: FAQ Section (10 min)

**Setup**:
1. Go to Template Settings → Bags Template → FAQ section
2. Toggle `Show FAQ` ON
3. Add test FAQs (JSON format):
   ```json
   [
     {"question": "What's your return policy?", "answer": "30-day returns for unused items."},
     {"question": "Do you ship internationally?", "answer": "Yes, we ship to most countries."},
     {"question": "How long does shipping take?", "answer": "3-5 business days."}
   ]
   ```
4. Save and view Bags storefront

**Expected Results**:
- FAQ section appears before footer
- Questions visible as collapsible items
- Click question → expands to show answer
- Click again → collapses answer

**Test Step 2**:
1. Change `Show FAQ` to OFF
2. FAQ section disappears

---

### Test 11: Footer Content (10 min)

**Setup**:
1. Go to Template Settings → Bags Template → Footer section
2. Add footer content:
   - About: "We specialize in luxury leather bags..."
   - Contact: "Email: info@bagsos.com | Phone: +1-555-0123"
   - Social Links: `[{"name": "Instagram", "url": "https://instagram.com/bagsos"}, {"name": "Facebook", "url": "https://facebook.com/bagsos"}]`
3. Save and view Bags storefront

**Expected Results**:
- Footer displays all three sections
- About text visible
- Contact info displayed
- Social links clickable (opens in new window)
- Professional footer layout

---

### Test 12: Font Family (5 min)

**Setup**:
1. Go to Template Settings → Bags Template → Typography section
2. Change `Font Family` to "Georgia"
3. Save and view Bags storefront

**Expected Results**:
- All text displays in Georgia serif font
- Headings, body text, buttons all use Georgia

**Test Step 2**:
1. Change to "Courier New"
2. Monospace font appears everywhere

**Test Step 3**:
1. Change to "Trebuchet MS"
2. Sans-serif font displays

**Verification**:
```javascript
// Check font family:
const body = document.body;
const fontFamily = window.getComputedStyle(body).fontFamily;
console.log(fontFamily);
```

---

### Test 13: Responsive Design (15 min)

**Setup**:
1. View Bags storefront on full desktop (1366px+)
2. Open DevTools: F12
3. Toggle device toolbar: Ctrl+Shift+M

**Test Mobile (375px)**:
- [ ] Logo displays correctly
- [ ] Header text readable
- [ ] Products stack vertically (2-column grid)
- [ ] Buttons clickable and sized appropriately
- [ ] Footer readable
- [ ] No horizontal scroll

**Test Tablet (768px)**:
- [ ] 3-column grid for products
- [ ] Layout proportional
- [ ] All elements visible
- [ ] Text readable

**Test Desktop (1366px)**:
- [ ] 4-column grid for products
- [ ] Full width utilized
- [ ] Spacious, professional layout

---

### Test 14: End-to-End Settings Change (15 min)

**Setup**:
1. Go to Template Settings → Bags Template
2. Change MULTIPLE settings at once:
   - Primary Color: Blue
   - Secondary Color: Light Green
   - Enable Dark Mode: ON
   - Heading Size: Small
   - Section Padding: 60px
   - Show Testimonials: ON
   - Show FAQ: ON
   - Add logo, footer content, social links

3. Save settings
4. View Bags storefront

**Expected Results**:
- ALL changes apply simultaneously
- Blue headings and buttons
- Light green cards
- Dark background
- Smaller headings
- Generous spacing
- Testimonials visible
- FAQ visible
- Logo at top
- Footer with content
- Social links clickable

**This tests**: Integration of all settings together

---

### Test 15: Settings Persistence (10 min)

**Setup**:
1. Configure Bags template with custom settings (like Test 14)
2. Close browser tab
3. Navigate away from site
4. Wait 5 minutes
5. Return to Bags storefront

**Expected Results**:
- All custom settings still applied
- Settings persisted in database
- Same appearance as before

**This tests**: Settings are saved durably, not lost on page reload

---

### Test 16: Performance (10 min)

**Setup**:
1. View Bags storefront
2. Open DevTools → Performance tab
3. Record 10 seconds of activity (scrolling, hovering)
4. Stop recording

**Expected Results**:
- No major performance issues
- Smooth 60fps (or close)
- No jank or stuttering
- CSS animations smooth

**Check**:
- [ ] First Contentful Paint < 3s
- [ ] Largest Contentful Paint < 4s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Frame rate consistent

---

## Defect Categories

### Critical (Must Fix Before Deploy)
- Colors don't apply
- Dark mode breaks layout
- Testimonials/FAQ don't render
- Page doesn't load
- TypeScript errors

### High (Should Fix Before Deploy)
- Settings don't persist
- Responsive layout broken
- Animations cause performance issues
- Text unreadable

### Medium (Consider Fixing)
- Minor styling inconsistencies
- Non-critical animations missing
- Footer alignment off
- Social links don't open

### Low (Can Fix Later)
- Hover effects missing
- Spacing slightly off
- Font rendering not perfect
- Minor color differences

---

## Test Report Template

```
Test Date: [DATE]
Tester: [NAME]
Environment: [DEV/STAGING/PROD]
Browser: [CHROME/FIREFOX/SAFARI]
Screen Size: [1366x768 / 768x1024 / 375x667]

Test Results:
- Test 1 (Logo): ✅ PASS / ⚠️ FAIL / ⏭️ SKIP
- Test 2 (Colors): ✅ PASS / ⚠️ FAIL / ⏭️ SKIP
- ... (continue for all 16 tests)

Issues Found:
1. [Description]
   - Impact: [Critical/High/Medium/Low]
   - Severity: [Blocks feature/Degrades UX/Minor/Cosmetic]

Recommendations:
- [Action item]

Sign-off:
- [Tester name]
- [Date]
```

---

## Success Criteria

✅ **All Tests Pass**: Bags template ready for production
⚠️ **Minor Issues**: Fix and re-test
❌ **Critical Issues**: Fix and full regression test

---

## Next Steps After Testing

1. ✅ Bags template passes all tests
2. → Wire Fashion template (use same pattern)
3. → Wire other 10 templates
4. → Full platform regression testing
5. → Deploy database migration to production
6. → Deploy templates to production
7. → Train store owners
8. → Monitor for issues

---

**Testing Start Date**: [TBD]
**Testing End Date**: [TBD]
**Status**: Ready to begin

🚀 Let's test!
