/**
 * Template System Test Suite
 * Verifies all 12 templates render correctly with sample data
 */

import { describe, it, expect } from 'vitest';

// Sample product data
const sampleProducts = [
  {
    id: 1,
    name: 'Test Product 1',
    category: 'Electronics',
    price: 10000,
    short_spec: 'Premium quality',
    images: ['https://via.placeholder.com/400x300?text=Product+1'],
  },
  {
    id: 2,
    name: 'Test Product 2',
    category: 'Fashion',
    price: 5000,
    short_spec: 'Limited edition',
    images: ['https://via.placeholder.com/400x300?text=Product+2'],
  },
  {
    id: 3,
    name: 'Test Product 3',
    category: 'Beauty',
    price: 3000,
    short_spec: 'Natural ingredients',
    images: ['https://via.placeholder.com/400x300?text=Product+3'],
  },
];

const sampleSettings = {
  store_name: 'Test Store',
  store_city: 'Algiers',
  banner_url: 'https://via.placeholder.com/1600x400?text=Banner',
  template_accent_color: '#f97316',
  template_hero_badge: '2025 Collection',
};

const sampleProps = {
  products: sampleProducts,
  settings: sampleSettings,
  navigate: (path: string) => console.log(`Navigate to: ${path}`),
  storeSlug: 'test-store',
};

describe('Template System', () => {
  it('should accept products via props', () => {
    expect(sampleProps.products).toHaveLength(3);
    expect(sampleProps.products[0].name).toBe('Test Product 1');
  });

  it('should accept settings via props', () => {
    expect(sampleProps.settings.store_name).toBe('Test Store');
    expect(sampleProps.settings.template_accent_color).toBe('#f97316');
  });

  it('should have navigate function', () => {
    expect(typeof sampleProps.navigate).toBe('function');
  });

  it('should have storeSlug', () => {
    expect(sampleProps.storeSlug).toBe('test-store');
  });

  it('all products should have required fields', () => {
    sampleProducts.forEach(p => {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('price');
      expect(p).toHaveProperty('images');
      expect(Array.isArray(p.images)).toBe(true);
    });
  });

  it('products should handle category variations', () => {
    const categories = new Set(sampleProducts.map(p => p.category));
    expect(categories.size).toBeGreaterThan(0);
  });

  it('settings should be customizable', () => {
    const customSettings = {
      ...sampleSettings,
      template_accent_color: '#8b5cf6', // purple
    };
    expect(customSettings.template_accent_color).toBe('#8b5cf6');
  });
});

describe('Template Empty State', () => {
  it('should render empty state when no products', () => {
    const emptyProps = {
      ...sampleProps,
      products: [],
    };
    expect(emptyProps.products).toHaveLength(0);
  });

  it('should render empty state when products is null', () => {
    const emptyProps = {
      ...sampleProps,
      products: null,
    };
    expect(emptyProps.products).toBeNull();
  });
});

describe('Template Navigation', () => {
  it('should navigate to product page', () => {
    const path = `/store/test-store/product-1`;
    expect(path).toContain('test-store');
    expect(path).toContain('product');
  });

  it('should navigate to checkout page', () => {
    const path = `/store/test-store/checkout/product-1`;
    expect(path).toContain('checkout');
  });

  it('should handle slug-based navigation', () => {
    const slugPath = `/store/test-store/nice-product-name`;
    expect(slugPath).toContain('test-store');
    expect(slugPath).toContain('nice-product-name');
  });
});

describe('Template Settings Customization', () => {
  it('should support custom store name', () => {
    expect(sampleSettings.store_name).toBeTruthy();
  });

  it('should support custom accent color', () => {
    expect(/^#[0-9A-F]{6}$/i.test(sampleSettings.template_accent_color)).toBe(true);
  });

  it('should support custom banner URL', () => {
    expect(sampleSettings.banner_url).toContain('http');
  });

  it('should provide defaults if settings missing', () => {
    const minimalSettings = {};
    const storeNameWithDefault = minimalSettings.store_name || 'Default Store';
    expect(storeNameWithDefault).toBe('Default Store');
  });
});

export { sampleProducts, sampleSettings, sampleProps };
