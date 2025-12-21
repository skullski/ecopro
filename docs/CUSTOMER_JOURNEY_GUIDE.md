# Customer Journey & Order Flow Guide

## Overview
This guide explains how customers browse, view products, purchase items, and how sellers manage orders in the system.

---

## 1. PRODUCT VIEWING & DETAILS 📸

### What Customers See When They Click a Product

When a customer clicks "Like" or selects a product from any template, they are taken to the **Enhanced Product Detail Page** which now includes:

#### **Image Gallery**
- ✅ **Main large image** - Full-size product photo
- ✅ **Thumbnail gallery** - Multiple product images (if available)
- ✅ **Image selection** - Click any thumbnail to view details
- Location: `client/pages/ProductDetail.tsx`

#### **Product Information**
- **Product Title** - Large, clear heading
- **Category** - Product category/type
- **Stock Status** - Shows if product is in stock
- **Price** - Prominent display with currency
- **Description** - Full detailed description with line breaks
- **Reviews Count** - Number of customer reviews
- **Likes Count** - How many people liked this product

#### **Customer Reviews & Ratings**
- ⭐ **Star ratings** - 1-5 star visual display
- **Review text** - Customer comments and feedback
- **Review date** - When the review was posted
- **Review form** - Customers can submit their own reviews with rating

#### **Action Buttons**
1. **"Buy Now"** - Direct checkout for this product
2. **"Add to Cart"** - Add to shopping cart (single quantity)
3. **"❤️ Like"** - Save product as favorite
4. **"💬 Chat"** - Message the seller with questions

---

## 2. CHECKOUT & CUSTOMER INFORMATION FORM 🛒

### When Customer Clicks "Buy Now"

Customer is taken to the **Checkout Page** where they fill in:

#### **Customer Information Fields**
```
✓ Full Name (required)
✓ Email (optional)
✓ Phone Number
✓ Address Line 1 (required)
✓ Address Line 2 (apartment, suite, etc. - optional)
✓ City (required)
✓ State/Region (optional)
✓ Postal Code (required)
✓ Country (required)
```

#### **Order Summary Display**
- Product image & title
- Product price
- Subtotal
- Shipping cost (currently "Free")
- **Final Total**

#### **Buyer Protection Notice**
- Assures customers their information is secure
- Seller will only receive shipping info

#### **Form Validation**
- ✅ All required fields marked with *
- ✅ Phone and email formats validated
- ✅ Error messages if fields are incomplete
- ✅ Submit button disabled until form is valid

---

## 3. ORDER CREATION & CONFIRMATION ✅

### When Customer Submits Order

The system:

1. **Validates all required fields**
   - Name, Address Line 1, City, Postal Code, Country
   - Phone and email validated if provided

2. **Compiles customer information into address string**
   - Combines: Line1, Line2, City, State, Postal Code, Country
   - Example: "123 Main St, Apt 5, New York, NY, 10001, USA"

3. **Sends order data to server**
   ```javascript
   {
     product_id: "123",
     quantity: 1,
     total_price: 99.99,
     customer_name: "John Doe",
     customer_email: "john@example.com",
     customer_phone: "+1-555-0000",
     customer_address: "123 Main St, Apt 5, New York, NY, 10001, USA",
     store_slug: (if from private store)
   }
   ```

4. **Returns confirmation**
   - Order ID generated: `ORD-001`, `ORD-002`, etc.
   - Success message displayed
   - Information automatically saved

---

## 4. SELLER ORDERS DASHBOARD 📋

### Where Seller Sees All Customer Orders

**Location:** `/dashboard/orders`
**Access:** Seller login → Dashboard → Orders tab

### Order Statistics Cards
- 📊 **Total Orders** - All orders received
- ✅ **Confirmed Orders** - Orders seller has confirmed
- 💰 **Revenue** - Total money from all confirmed orders

### Order List Display

Each order shows:
| Field | Value |
|-------|-------|
| **Order Number** | ORD-001 |
| **Customer Name** | John Doe |
| **Amount** | 99.99 دج |
| **Status** | Pending/Confirmed/Failed/Follow-up |
| **Time** | Posted 2 hours ago |

### Expandable Order Details

When seller clicks on an order, they see ALL customer information:

```
═══════════════════════════════════════
ORDER DETAILS (EXPANDABLE)
═══════════════════════════════════════

📍 Order Number:     ORD-001
👤 Customer Name:    John Doe
📞 Phone Number:     +1-555-0000
📧 Email:            john@example.com
🏠 Address:          123 Main St, Apt 5, New York, NY, 10001, USA
📦 Product:          Blue T-Shirt
💵 Total Price:      99.99 دج

[✓ Confirm Order] [✕ Cancel Order] [◯ Follow-up]
═══════════════════════════════════════
```

### Order Status Management

Seller can change order status:
- **Confirm** (Green) - Accept order and prepare for shipment
- **Cancel** (Red) - Decline order, customer gets notified
- **Follow-up** (Blue) - Mark for later action/contact

### Order Filtering & Actions

- 🔄 **Refresh** - Reload orders (auto-refreshes every 5 seconds)
- ➕ **Add Order** - Manually create order for phone/in-person sales
- 📥 **Download** - Export orders to CSV/Excel
- 🔍 **Filter** - Filter by status, date, amount, etc.

### Auto-Refresh Feature
- Orders update automatically every 5 seconds
- No need to manually refresh
- Real-time customer information display

---

## 5. INFORMATION FLOW DIAGRAM

```
CUSTOMER SIDE                          SELLER SIDE
═══════════════════════════════════════════════════════════════

1. Browse Store
   ↓
2. Click Product/Like
   ↓
3. View Product Details
   - Images gallery
   - Description
   - Reviews
   - Price
   ↓
4. Click "Buy Now"
   ↓
5. Fill Checkout Form              6. Seller Dashboard
   - Name                           - Views Orders Page
   - Email                          - Sees all customer info
   - Phone                          ↓
   - Address                        7. Seller Takes Action
   ↓                                - Confirm Order
6. Submit Order                     - Cancel Order
   ↓                                - Follow-up
7. Order Confirmation
   ↓
   (Customer info saved and visible to seller)
```

---

## 6. DATA STORED IN ORDER

When an order is created, the system automatically stores:

✅ **Automatically Captured:**
- Product ID & Title
- Customer Name
- Customer Email
- Customer Phone Number
- Complete Customer Address
- Order Total Price
- Order Date & Time
- Order Status (pending, confirmed, failed, followup)
- Quantity

✅ **Automatically Displayed to Seller:**
- All above fields shown in order details
- No manual entry needed by seller
- Data persists in database

---

## 7. ENHANCED PRODUCT DETAIL FEATURES

### Image Handling
```javascript
// If multiple images provided:
- Display main image
- Show thumbnail gallery below
- Click thumbnail to view full size
- Smooth image transitions

// If single image:
- Display product image
- No gallery shown
```

### Product Information Display
```javascript
// Category badge (if exists)
// Product title (large, bold)
// Stock status (green if available, red if out)
// Star rating with review count
// Like count from other customers
// Full formatted description
// Price in prominent display
```

### Reviews System
```javascript
// Show all customer reviews
// Display star ratings visually
// Show review date
// Submit new review form
// Rating selector (1-5 stars)
// Text area for review content
```

---

## 8. KEY FEATURES IMPLEMENTED ✨

### ✅ **For Customers**
- 📸 View multiple product images
- ⭐ Read and submit reviews with star ratings
- ❤️ Like products for saves
- 💬 Chat with sellers
- 📋 Easy checkout form with validation
- ✅ Order confirmation with ID

### ✅ **For Sellers**
- 📊 View all orders in one dashboard
- 👁️ See complete customer information automatically
- 📞 Have phone number for follow-up
- 📧 Have email for communication
- 🏠 Have full shipping address
- ⚡ Real-time order updates (auto-refresh every 5s)
- 🔧 Manage order status (confirm/cancel/follow-up)
- 📈 View revenue and order statistics
- 💾 Data persists in database

---

## 9. TROUBLESHOOTING

### Question: "Why don't I see customer phone number?"
**Answer:** Phone number is optional in checkout. Customers can skip it. You'll see "غير متوفر" (Not available) if they don't enter it.

### Question: "How often do orders refresh?"
**Answer:** Automatically every 5 seconds. No manual refresh needed!

### Question: "What if customer doesn't fill all fields?"
**Answer:** Form won't submit. Error message shows which fields are required.

### Question: "Where is customer address shown?"
**Answer:** Click on any order to expand it. Address appears in the details section.

### Question: "Can I manually add orders?"
**Answer:** Yes! Click "+ Add Order" button in orders dashboard to create orders from phone/in-person sales.

---

## 10. WORKFLOW SUMMARY

```
┌─────────────────────────────────────────────────────┐
│            COMPLETE CUSTOMER JOURNEY               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Customer Browses Store                            │
│         ↓                                           │
│  Clicks Product/Likes It                          │
│         ↓                                           │
│  Sees Enhanced Detail Page with:                  │
│    • Image Gallery (multiple photos)               │
│    • Full Product Info                             │
│    • Reviews & Ratings                             │
│    • Price & Stock Status                          │
│         ↓                                           │
│  Clicks "Buy Now"                                 │
│         ↓                                           │
│  Fills Checkout Form with:                        │
│    • Name, Email, Phone                            │
│    • Complete Address                              │
│    • Validates all required fields                 │
│         ↓                                           │
│  Submits Order                                    │
│         ↓                                           │
│  Gets Order Confirmation (ORD-XXX)                │
│         ↓                                           │
│  SELLER AUTOMATICALLY SEES:                        │
│    • Customer Name & Contact Info                  │
│    • Complete Shipping Address                     │
│    • Order Details & Total Price                   │
│    • Can Confirm/Cancel/Follow-up                  │
│         ↓                                           │
│  Order Data Persists in Database                  │
│  For Future Reference                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 11. API ENDPOINTS INVOLVED

### Customer Flow
- `GET /api/products/{id}` - Fetch product details
- `GET /api/products/{id}/reviews` - Get reviews
- `POST /api/products/{id}/reviews` - Submit review
- `POST /api/products/{id}/like` - Like product
- `POST /api/storefront/{storeSlug}/orders` - Create order
- `POST /api/orders/create` - Alternative order endpoint

### Seller Flow
- `GET /api/client/orders` - Fetch all orders
- `PATCH /api/client/orders/{id}/status` - Update order status
- `POST /api/orders/create` - Create manual order
- `GET /api/client/orders` - Real-time polling

---

**Last Updated:** December 17, 2025
**Version:** 1.0 - Full Product & Order Flow Implementation
