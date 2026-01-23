// @vitest-environment jsdom
import React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import type { TemplateProps, StoreProduct } from '../../types';
import { TEMPLATE_EDITS_CONTRACT } from '../../../../../../shared/template-edits-contract';

import BagsTemplate from '../bags/BagsTemplate';
import BooksTemplate from '../books/BooksTemplate';
import WeddingTemplate from '../wedding/WeddingTemplate';
import ToolsTemplate from '../tools/ToolsTemplate';
import ProAtelierTemplate from '../pro-atelier/ProAtelierTemplate';
import ProStudioTemplate from '../pro-studio/ProStudioTemplate';
import AmberStoreTemplate from '../amber-store/AmberStoreTemplate';
import RoseCatalogTemplate from '../rose-catalog/RoseCatalogTemplate';
import LimeDirectTemplate from '../lime-direct/LimeDirectTemplate';
import UrgencyMaxTemplate from '../urgency-max/UrgencyMaxTemplate';
import PapercraftTemplate from '../papercraft/PapercraftTemplate';
import MinimalTemplate from '../minimal/MinimalTemplate';

beforeAll(() => {
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
      store_description: 'Test description',
      store_logo: '',
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

const READY_TEMPLATES: Array<{ id: string; Template: React.ComponentType<any> }> = [
  { id: 'bags', Template: BagsTemplate },
  { id: 'books', Template: BooksTemplate },
  { id: 'wedding', Template: WeddingTemplate },
  { id: 'tools', Template: ToolsTemplate },
  { id: 'pro-atelier', Template: ProAtelierTemplate },
  { id: 'pro-studio', Template: ProStudioTemplate },
  { id: 'amber-store', Template: AmberStoreTemplate },
  { id: 'rose-catalog', Template: RoseCatalogTemplate },
  { id: 'lime-direct', Template: LimeDirectTemplate },
  { id: 'urgency-max', Template: UrgencyMaxTemplate },
  { id: 'papercraft', Template: PapercraftTemplate },
  { id: 'minimal', Template: MinimalTemplate },
];

function expectTemplateMeetsEditContract(Template: React.ComponentType<any>) {
  const props = { ...makeBaseProps(), onSelect: () => {} };
  const { container } = render(<Template {...props} />);

  const missing = TEMPLATE_EDITS_CONTRACT.editPaths.filter((p) => !container.querySelector(`[data-edit-path="${p}"]`));
  expect(missing).toEqual([]);
}

describe('Templates: ready templates meet edit contract', () => {
  for (const t of READY_TEMPLATES) {
    it(`${t.id} includes all TEMPLATE_EDITS_CONTRACT paths`, () => {
      expectTemplateMeetsEditContract(t.Template);
    });
  }
});
