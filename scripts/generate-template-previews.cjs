const fs = require('fs');
const path = require('path');

const templates = [
  { id: 'sports', name: 'Sports', bg: '#0f172a', accent: '#22c55e' },
  { id: 'books', name: 'Bookstore', bg: '#1c1917', accent: '#d97706' },
  { id: 'pets', name: 'Pet Supplies', bg: '#fef3c7', accent: '#f59e0b', textColor: '#78350f' },
  { id: 'toys', name: 'Toys & Games', bg: '#fdf4ff', accent: '#d946ef', textColor: '#86198f' },
  { id: 'garden', name: 'Garden', bg: '#f0fdf4', accent: '#22c55e', textColor: '#166534' },
  { id: 'art', name: 'Art Gallery', bg: '#fafafa', accent: '#18181b', textColor: '#18181b' },
  { id: 'music', name: 'Music', bg: '#18181b', accent: '#a855f7' },
  { id: 'health', name: 'Health', bg: '#ecfdf5', accent: '#10b981', textColor: '#065f46' },
  { id: 'watches', name: 'Watches', bg: '#0c0a09', accent: '#d4af37' },
  { id: 'shoes', name: 'Shoes', bg: '#fafaf9', accent: '#ea580c', textColor: '#1c1917' },
  { id: 'gaming', name: 'Gaming', bg: '#0f0f23', accent: '#06b6d4' },
  { id: 'automotive', name: 'Automotive', bg: '#1a1a1a', accent: '#dc2626' },
  { id: 'crafts', name: 'Handmade', bg: '#fffbeb', accent: '#f59e0b', textColor: '#78350f' },
  { id: 'outdoor', name: 'Outdoor', bg: '#14532d', accent: '#4ade80' },
  { id: 'vintage', name: 'Vintage', bg: '#faf5f0', accent: '#92400e', textColor: '#78350f' },
  { id: 'tech', name: 'Tech', bg: '#0f172a', accent: '#06b6d4' },
  { id: 'organic', name: 'Organic', bg: '#f0fdf4', accent: '#16a34a', textColor: '#166534' },
  { id: 'luxury', name: 'Luxury', bg: '#0a0a0a', accent: '#d4af37' },
  { id: 'kids', name: 'Kids', bg: '#fdf2f8', accent: '#ec4899', textColor: '#9d174d' },
  { id: 'travel', name: 'Travel', bg: '#0f766e', accent: '#5eead4' },
  { id: 'photography', name: 'Photography', bg: '#171717', accent: '#ffffff' },
  { id: 'wedding', name: 'Wedding', bg: '#fdf2f8', accent: '#ec4899', textColor: '#831843' },
  { id: 'fitness', name: 'Fitness', bg: '#18181b', accent: '#f97316' },
  { id: 'gifts', name: 'Gift Shop', bg: '#fef2f2', accent: '#dc2626', textColor: '#991b1b' },
  { id: 'candles', name: 'Candles', bg: '#1c1917', accent: '#f59e0b' },
  { id: 'skincare', name: 'Skincare', bg: '#faf5ff', accent: '#a855f7', textColor: '#6b21a8' },
  { id: 'supplements', name: 'Supplements', bg: '#ecfdf5', accent: '#10b981', textColor: '#065f46' },
  { id: 'phone-accessories', name: 'Phone Acc.', bg: '#0f172a', accent: '#3b82f6' },
  { id: 'tools', name: 'Tools', bg: '#292524', accent: '#ea580c' },
  { id: 'office', name: 'Office', bg: '#f8fafc', accent: '#2563eb', textColor: '#1e40af' },
  { id: 'stationery', name: 'Stationery', bg: '#fefce8', accent: '#eab308', textColor: '#854d0e' },
  { id: 'neon', name: 'Neon', bg: '#0a0a0a', accent: '#ec4899' },
  { id: 'pastel', name: 'Pastel', bg: '#fdf2f8', accent: '#a78bfa', textColor: '#7c3aed' },
  { id: 'monochrome', name: 'Monochrome', bg: '#ffffff', accent: '#000000', textColor: '#000000' },
  { id: 'gradient', name: 'Gradient', bg: '#4f46e5', accent: '#ec4899' },
  { id: 'florist', name: 'Florist', bg: '#fdf2f8', accent: '#db2777', textColor: '#9d174d' },
  { id: 'eyewear', name: 'Eyewear', bg: '#f5f5f4', accent: '#78716c', textColor: '#292524' },
  { id: 'lingerie', name: 'Lingerie', bg: '#1a1a1a', accent: '#f472b6' },
  { id: 'swimwear', name: 'Swimwear', bg: '#06b6d4', accent: '#ffffff' },
  { id: 'streetwear', name: 'Streetwear', bg: '#18181b', accent: '#facc15' },
  { id: 'wine', name: 'Wine', bg: '#1c1917', accent: '#991b1b' },
  { id: 'chocolate', name: 'Chocolate', bg: '#292524', accent: '#d97706' },
  { id: 'tea', name: 'Tea & Coffee', bg: '#f0fdf4', accent: '#166534', textColor: '#14532d' },
];

const outputDir = path.join(__dirname, '../public/template-previews');

templates.forEach(t => {
  const textColor = t.textColor || '#ffffff';
  const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${t.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${t.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${t.accent};stop-opacity:0.3" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#grad-${t.id})"/>
  <rect x="20" y="20" width="360" height="40" rx="4" fill="${t.accent}" opacity="0.2"/>
  <circle cx="45" cy="40" r="12" fill="${t.accent}"/>
  <rect x="70" y="32" width="80" height="16" rx="2" fill="${textColor}" opacity="0.8"/>
  <rect x="20" y="80" width="360" height="100" rx="8" fill="${t.accent}" opacity="0.15"/>
  <text x="200" y="125" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="${textColor}" text-anchor="middle" opacity="0.9">${t.name}</text>
  <text x="200" y="155" font-family="system-ui, sans-serif" font-size="12" fill="${textColor}" text-anchor="middle" opacity="0.6">Store Template</text>
  <rect x="20" y="200" width="110" height="80" rx="6" fill="${t.accent}" opacity="0.2"/>
  <rect x="145" y="200" width="110" height="80" rx="6" fill="${t.accent}" opacity="0.2"/>
  <rect x="270" y="200" width="110" height="80" rx="6" fill="${t.accent}" opacity="0.2"/>
  <rect x="30" y="210" width="90" height="45" rx="4" fill="${t.accent}" opacity="0.3"/>
  <rect x="155" y="210" width="90" height="45" rx="4" fill="${t.accent}" opacity="0.3"/>
  <rect x="280" y="210" width="90" height="45" rx="4" fill="${t.accent}" opacity="0.3"/>
  <rect x="30" y="262" width="60" height="8" rx="2" fill="${textColor}" opacity="0.5"/>
  <rect x="155" y="262" width="60" height="8" rx="2" fill="${textColor}" opacity="0.5"/>
  <rect x="280" y="262" width="60" height="8" rx="2" fill="${textColor}" opacity="0.5"/>
</svg>`;
  
  fs.writeFileSync(path.join(outputDir, `${t.id}.svg`), svg);
  console.log(`Created ${t.id}.svg`);
});

console.log('\\nAll template preview SVGs created!');
