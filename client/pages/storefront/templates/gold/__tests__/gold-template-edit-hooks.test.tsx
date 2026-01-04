// @vitest-environment jsdom
import React from 'react';
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import type { TemplateProps, StoreProduct } from '../../types';

import BagsTemplate from '../bags/BagsTemplate';
import JewelryTemplate from '../jewelry/JewelryTemplate';
import BabyosTemplate from '../babyos/BabyosTemplate';
import ShiroHanaTemplate from '../shiro-hana/ShiroHanaTemplate';

beforeAll(() => {
  // Some templates use ResizeObserver to compute container-width breakpoints.
  // jsdom doesn't ship it by default.
  if (typeof (globalThis as any).ResizeObserver === 'undefined') {
    (globalThis as any).ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'undefined') {
    (window as any).matchMedia = () => ({
      matches: false,
      media: '',
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    });
  }
});

const makeProducts = (): StoreProduct[] => [
  {
    id: 1,
    title: 'Test Product',
    description: 'A product used for template tests.',
    price: 1999,
    stock_quantity: 10,
    is_featured: true,
    slug: 'test-product',
    views: 0,
    images: ['/placeholder.png'],
    category: 'Test',
  },
];

const makeBaseProps = (): TemplateProps => {
  const products = makeProducts();

  return {
    storeSlug: 'test-store',
    products,
    filtered: products,
    settings: {
      store_name: 'Test Store',
      template: 'gold',
    },
    categories: ['Test'],
    searchQuery: '',
    setSearchQuery: () => {},
    categoryFilter: 'All',
    setCategoryFilter: () => {},
    sortOption: 'featured',
    setSortOption: () => {},
    viewMode: 'grid',
    setViewMode: () => {},
    formatPrice: (n) => String(n),
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    bannerUrl: null,
    navigate: () => {},
    canManage: true,
  };
};

function expectAllEditHooksClickable(Template: React.ComponentType<any>) {
  const onSelect = vi.fn();
  const props = { ...makeBaseProps(), onSelect, canManage: true };

  const { container } = render(<Template {...props} />);

  const editNodes = Array.from(container.querySelectorAll<HTMLElement>('[data-edit-path]'));
  expect(editNodes.length).toBeGreaterThan(0);

  // Verify "one by one" that every distinct edit path is reachable via clicking
  // at least one element that declares that data-edit-path.
  const nodesByPath = new Map<string, HTMLElement[]>();
  for (const node of editNodes) {
    const path = node.getAttribute('data-edit-path');
    if (!path) continue;
    const list = nodesByPath.get(path);
    if (list) list.push(node);
    else nodesByPath.set(path, [node]);
  }

  const missing: string[] = [];
  for (const [path, nodes] of nodesByPath) {
    onSelect.mockClear();
    let hit = false;
    for (const node of nodes) {
      fireEvent.click(node);
      const calledPaths = onSelect.mock.calls.map((c) => String(c[0] ?? ''));
      if (calledPaths.includes(path)) {
        hit = true;
        break;
      }
    }
    if (!hit) missing.push(path);
  }

  expect(missing).toEqual([]);
}

describe('Gold templates: edit hooks', () => {
  it('Bags: clicking each data-edit-path triggers onSelect(path)', () => {
    expectAllEditHooksClickable(BagsTemplate);
  });

  it('Jewelry: clicking each data-edit-path triggers onSelect(path)', () => {
    expectAllEditHooksClickable(JewelryTemplate);
  });

  it('Babyos: clicking each data-edit-path triggers onSelect(path)', () => {
    expectAllEditHooksClickable(BabyosTemplate);
  });

  it('Shiro Hana: clicking each data-edit-path triggers onSelect(path)', () => {
    expectAllEditHooksClickable(ShiroHanaTemplate);
  });
});
