// @vitest-environment jsdom
import React from 'react';
import { describe, expect, it, vi, beforeAll } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import type { TemplateProps, StoreProduct } from '../../types';

import BagsTemplate from '../bags/BagsTemplate';
import JewelryTemplate from '../jewelry/JewelryTemplate';

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
      template: 'pro',
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

function EditCaptureHarness({ children, onSelect }: { children: React.ReactNode; onSelect: (path: string) => void }) {
  const handleClickCapture = React.useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest('[data-edit-path]') as HTMLElement | null;
      if (!el) return;
      const path = el.getAttribute('data-edit-path');
      if (!path) return;
      onSelect(path);
    },
    [onSelect]
  );

  return (
    <div data-testid="harness" onClickCapture={handleClickCapture}>
      {children}
    </div>
  );
}

function pickClickTarget(node: HTMLElement): HTMLElement {
  // Prefer a descendant click target that still resolves to this node as the closest
  // [data-edit-path] ancestor. This simulates the real editor where the user
  // clicks inside a column/row (not necessarily the wrapper).
  const descendants = Array.from(node.querySelectorAll<HTMLElement>('*'));
  for (const el of descendants) {
    const closest = el.closest('[data-edit-path]');
    if (closest === node) return el;
  }
  return node;
}

function expectAllEditHooksClickable(Template: React.ComponentType<any>) {
  const onSelect = vi.fn();
  const props = { ...makeBaseProps(), onSelect, canManage: true };

  const { container } = render(
    <EditCaptureHarness onSelect={onSelect}>
      <Template {...props} />
    </EditCaptureHarness>
  );

  const editNodes = Array.from(container.querySelectorAll<HTMLElement>('[data-edit-path]'));
  expect(editNodes.length).toBeGreaterThan(0);

  // Verify "one by one" that every distinct edit path is reachable via clicking
  // inside (not just on) an element that declares that data-edit-path.
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
      const clickTarget = pickClickTarget(node);
      fireEvent.click(clickTarget);
      const calledPaths = onSelect.mock.calls.map((c) => String(c[0] ?? ''));
      if (calledPaths.includes(path)) {
        hit = true;
        break;
      }
    }
    if (!hit) missing.push(path);
  }

  expect(missing).toEqual([]);

  // Special case: nested edit targets (e.g., columns inside a row).
  // Clicking inside the inner target should select the inner path (closest match).
  const nested = editNodes
    .map((outer) => {
      const inner = outer.querySelector<HTMLElement>('[data-edit-path]');
      if (!inner) return null;
      const outerPath = outer.getAttribute('data-edit-path');
      const innerPath = inner.getAttribute('data-edit-path');
      if (!outerPath || !innerPath) return null;
      if (outerPath === innerPath) return null;
      return { outer, inner, outerPath, innerPath };
    })
    .filter(Boolean) as Array<{ outer: HTMLElement; inner: HTMLElement; outerPath: string; innerPath: string }>;

  if (nested.length > 0) {
    const { inner, innerPath } = nested[0];
    onSelect.mockClear();
    fireEvent.click(pickClickTarget(inner));
    const calledPaths = onSelect.mock.calls.map((c) => String(c[0] ?? ''));
    expect(calledPaths.includes(innerPath)).toBe(true);
  }
}

describe('Templates: edit hooks', () => {
  it('Bags: clicking each data-edit-path triggers onSelect(path)', () => {
    expectAllEditHooksClickable(BagsTemplate);
  });

  it('Jewelry: clicking each data-edit-path triggers onSelect(path)', () => {
    expectAllEditHooksClickable(JewelryTemplate);
  });
});
