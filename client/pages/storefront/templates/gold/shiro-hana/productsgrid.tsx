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
  const themeCols = parseInt(String((theme as any)?.gridColumns || ''), 10);
  const mdCols = Math.min(6, Math.max(1, Number(resolvedColumns ?? columns ?? themeCols) || themeCols || 5));

  const gapPx = resolveNumber(gap) ?? parseInt(String((theme as any)?.gridGap || ''), 10);
  const padXPx = resolveNumber(paddingX);
  const padYPx = resolveNumber(paddingY);
  // Desktop: 5 cols, Tablet: 3 cols, Mobile: 2 cols
  const colCount = isMd ? 5 : (isSm ? 3 : 2);

  const title = String((theme as any)?.featuredTitle || '').trim();
  const subtitle = String((theme as any)?.featuredSubtitle || '').trim();
  const sectionTitleSize = parseInt(String((theme as any)?.sectionTitleSize || ''), 10);

  return (
    <section
      className="py-12"
      style={{
        paddingTop: padYPx,
        paddingBottom: padYPx,
        backgroundColor: backgroundColor || undefined,
      }}
      data-edit-path="layout.featured"
      onClick={(e) => {
        if ((theme as any)?.canManage === false) return;
        e.preventDefault();
        e.stopPropagation();
        onSelect('layout.featured');
      }}
    >
      <div className="container mx-auto px-6" style={{ paddingLeft: padXPx, paddingRight: padXPx }}>
        {(title || subtitle) ? (
          <div className="mb-6">
            {title ? (
              <h2
                className="font-semibold"
                style={{
                  fontSize: Number.isFinite(sectionTitleSize) ? `${sectionTitleSize}px` : undefined,
                  color: (theme as any)?.sectionTitleColor || theme?.colors?.text || undefined,
                }}
                data-edit-path="layout.featured.title"
                onClick={(e) => {
                  if ((theme as any)?.canManage === false) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect('layout.featured.title');
                }}
              >
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p
                className="mt-2 text-sm"
                style={{ color: (theme as any)?.sectionSubtitleColor || theme?.colors?.muted || undefined }}
                data-edit-path="layout.featured.subtitle"
                onClick={(e) => {
                  if ((theme as any)?.canManage === false) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect('layout.featured.subtitle');
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <div
          className="grid"
          style={{
            gap: gapPx,
            gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
          }}
          data-edit-path="layout.grid"
          onClick={(e) => {
            if ((theme as any)?.canManage === false) return;
            e.preventDefault();
            e.stopPropagation();
            onSelect('layout.grid');
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
      </div>
    </section>
  );
}
