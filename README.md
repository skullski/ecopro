# EcoPro - Multi-Vendor Marketplace

A modern, full-stack multi-vendor e-commerce platform built with React, TypeScript, Express, and Vite.

## Features

- 🛍️ **Multi-Vendor Marketplace** - Multiple sellers with individual storefronts
- 🏪 **Personal Vendor Stores** - Each vendor gets their own branded store page
- 📦 **Product Management** - Easy product addition, editing, and export controls
- 💎 **VIP System** - Premium subscription tiers for vendors
- 🌐 **Dual Visibility** - Products can be private or exported to main marketplace
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Dark Mode** - Full dark mode support
- 🌍 **RTL Support** - Arabic language interface

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS 3, Radix UI
- **Backend**: Express, Node.js
- **State Management**: React Hooks
- **Routing**: React Router 6
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ecopro

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:8080`

## Project Structure

```
ecopro/
├── client/              # React frontend
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── lib/           # Utilities and API client
│   └── contexts/      # React contexts
├── server/             # Express backend
│   ├── routes/        # API routes
│   └── index.ts       # Server entry point
├── shared/            # Shared types between client/server
└── public/            # Static assets
```

## Deployment

### Render (Recommended - Single Service)

Deploy both frontend and backend together:

```bash
# See detailed guide
cat RENDER_DEPLOYMENT.md

# Quick steps:
1. Push to GitHub
2. Connect to Render
3. Build: pnpm install && pnpm run render:build
4. Start: pnpm start
```

[📖 Full Render Deployment Guide](./RENDER_DEPLOYMENT.md)

### Vercel (Alternative)

Deploy as serverless functions:

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect the settings
5. Click "Deploy"

### Environment Variables (Optional)

Add these in Vercel dashboard if needed:
- `PING_MESSAGE` - Custom API ping message

## API Endpoints

### Vendors
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `GET /api/vendors/slug/:slug` - Get vendor by store slug
- `POST /api/vendors` - Create new vendor
- `PUT /api/vendors/:id` - Update vendor

### Products
- `GET /api/products` - Get all products
- `GET /api/products/vendor/:vendorId` - Get vendor's products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Key Pages

- `/` - Homepage
- `/store` - Main marketplace (exported products only)
- `/store/:vendorSlug` - Individual vendor storefront (all products)
- `/vendor/signup` - Vendor registration
- `/vendor/:id/dashboard` - Vendor dashboard
- `/vendor/upgrade` - VIP subscription page
- `/admin/preview` - Vendor store preview

## Development Commands

```bash
pnpm dev          # Start dev server (client + server)
pnpm build        # Production build
pnpm start        # Start production server
pnpm typecheck    # TypeScript validation
pnpm test         # Run tests
```

## Features Overview

### For Vendors
- Create free account instantly
- Add unlimited products
- Toggle product visibility (private vs marketplace)
- Access personal storefront with unique URL
- View sales statistics
- Upgrade to VIP for premium features

### For Customers
- Browse marketplace with all exported products
- Search and filter by category
- Add to cart and wishlist
- Visit individual vendor stores
- View vendor ratings and profiles

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For support, email your-email@example.com or open an issue on GitHub.
# eco-merce
# eco
# aconew
# ecopro
