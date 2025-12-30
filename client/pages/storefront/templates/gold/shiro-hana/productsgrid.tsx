import React from "react";
import type { ProductNode } from "./schema-types";
import { ProductCard } from "./productscard";
import { resolveResponsiveNumber, type Breakpoint } from './responsive';

type Props = {
  items: ProductNode[];
  columns?: any;
  gap?: any;
  paddingY?: any;
  paddingX?: any;
  backgroundColor?: string;
  card?: {
    radius?: number;
    shadow?: 'none' | 'sm' | 'md';
    imageHeight?: any;
  };
  onSelect: (path: string) => void;
  resolveAssetUrl?: (assetKey: string) => string;
  formatPrice?: (n: number) => string;
  ctaStyle?: React.CSSProperties;
  addLabel?: string;
  theme?: any;
  responsive?: { isSm?: boolean; isMd?: boolean; width?: number; breakpoint?: 'mobile' | 'tablet' | 'desktop' };
};

export function ProductGrid({ items, columns = 3, gap, paddingY, paddingX, backgroundColor, card, onSelect, resolveAssetUrl, formatPrice, ctaStyle, addLabel, theme, responsive }: Props) {
  const isSm = !!responsive?.isSm;
  const isMd = !!responsive?.isMd;
  const bp = (responsive?.breakpoint || (isMd ? 'desktop' : (isSm ? 'tablet' : 'mobile'))) as Breakpoint;
  const resolveNumber = (v: any): number | undefined => resolveResponsiveNumber(v, bp);

  const resolvedColumns = resolveNumber(columns);
  const mdCols = Math.min(6, Math.max(1, Number(resolvedColumns ?? columns) || 3));

  const gapPx = resolveNumber(gap);
  const padXPx = resolveNumber(paddingX);
  const padYPx = resolveNumber(paddingY);
  const colCount = isMd ? mdCols : (isSm ? Math.min(2, mdCols) : 1);

  return (
    <section
      className="py-12"
      style={{
        paddingTop: padYPx,
        paddingBottom: padYPx,
        backgroundColor: backgroundColor || undefined,
      }}
      data-edit-path="layout.featured"
      onClick={() => onSelect('layout.featured')}
    >
      <div
        className="container mx-auto px-6 grid"
        style={{
          gap: gapPx,
          paddingLeft: padXPx,
          paddingRight: padXPx,
          gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
        }}
      >
        {items.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onSelect={onSelect}
            resolveAssetUrl={resolveAssetUrl}
            formatPrice={formatPrice}
            ctaStyle={ctaStyle}
            addLabel={addLabel}
            theme={theme}
            card={card}
            responsive={responsive}
          />
        ))}
      </div>
    </section>
  );
}
