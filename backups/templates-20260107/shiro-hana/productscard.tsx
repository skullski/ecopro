import React from "react";
import type { ProductNode } from "./schema-types";
import { resolveResponsiveNumber, resolveResponsiveStyle, type Breakpoint } from './responsive';

type Props = {
  product: ProductNode & { slug?: string };
  onSelect: (path: string) => void;
  resolveAssetUrl?: (assetKey: string) => string;
  formatPrice?: (n: number) => string;
  ctaStyle?: React.CSSProperties;
  addLabel?: string;
  theme?: any;
  card?: {
    radius?: number;
    shadow?: 'none' | 'sm' | 'md';
    imageHeight?: any;
  };
  responsive?: { isSm?: boolean; isMd?: boolean; width?: number; breakpoint?: 'mobile' | 'tablet' | 'desktop' };
  navigate?: (to: string | number) => void;
};

export function ProductCard({ product, onSelect, resolveAssetUrl, formatPrice, ctaStyle, addLabel, theme, card, responsive, navigate }: Props) {
    const shadow = card?.shadow || 'sm';
    const boxShadow =
      shadow === 'none'
        ? 'none'
        : shadow === 'md'
          ? '0 10px 25px rgba(0,0,0,0.10)'
          : '0 1px 2px rgba(0,0,0,0.08)';

    const bp = (responsive?.breakpoint || (responsive?.isMd ? 'desktop' : (responsive?.isSm ? 'tablet' : 'mobile'))) as Breakpoint;
    const resolveNumber = (v: any): number | undefined => resolveResponsiveNumber(v, bp);

    const radius = resolveNumber(card?.radius);
    const imageHeight = resolveNumber(card?.imageHeight);
  const imgSrc = product.image?.assetKey
    ? (resolveAssetUrl ? resolveAssetUrl(product.image.assetKey) : `/assets/${product.image.assetKey}`)
    : '';

  const posXRaw = resolveNumber((product.image as any)?.posX);
  const posYRaw = resolveNumber((product.image as any)?.posY);
  const size = resolveNumber((product.image as any)?.size);
  const scaleXRaw = resolveNumber((product.image as any)?.scaleX);
  const scaleYRaw = resolveNumber((product.image as any)?.scaleY);

  const posX = typeof posXRaw === 'number' ? Math.max(0, Math.min(1, posXRaw)) : 0.5;
  const posY = typeof posYRaw === 'number' ? Math.max(0, Math.min(1, posYRaw)) : 0.5;
  const scaleX = typeof scaleXRaw === 'number' ? scaleXRaw : (typeof size === 'number' ? size : 1);
  const scaleY = typeof scaleYRaw === 'number' ? scaleYRaw : (typeof size === 'number' ? size : 1);
  const fit = (product.image as any)?.fit === 'contain' ? 'contain' : 'cover';
  const canManage = (theme as any)?.canManage !== false;

  // Navigate to product checkout when customer clicks
  const handleProductClick = (e: React.MouseEvent) => {
    if (!canManage && product.slug && navigate) {
      navigate(product.slug);
    } else if (canManage) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(`layout.featured.items.${product.id}`);
    }
  };

  return (
    <article
      className="rounded-lg shadow-sm overflow-hidden"
      data-edit-path={`layout.featured.items.${product.id}`}
      onClick={handleProductClick}
      style={{
        backgroundColor: (theme as any)?.cardBg || theme?.colors?.surface || undefined,
        color: (theme as any)?.text || theme?.colors?.text || undefined,
        borderRadius: radius,
        boxShadow,
        cursor: canManage ? 'default' : 'pointer',
      }}
    >
      <div
        className="w-full overflow-hidden"
        style={{ height: imageHeight }}
        onClick={(e) => {
          if (!canManage) return;
          e.preventDefault();
          e.stopPropagation();
          onSelect(`layout.featured.items.${product.id}.image`);
        }}
        data-edit-path={`layout.featured.items.${product.id}.image`}
      >
        <img
          src={imgSrc}
          alt={product.image.alt || ''}
          className="w-full h-full"
          style={{
            objectFit: fit,
            objectPosition: `${Math.round(posX * 100)}% ${Math.round(posY * 100)}%`,
            transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
          }}
        />
      </div>
      <div className="p-4">
        <h3
          className="font-medium text-lg"
          style={{ ...resolveResponsiveStyle((product.title as any)?.style, bp) || undefined, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          onClick={(e) => {
            if (!canManage) return;
            e.preventDefault();
            e.stopPropagation();
            onSelect(`layout.featured.items.${product.id}.title`);
          }}
          data-edit-path={`layout.featured.items.${product.id}.title`}
        >
          {product.title.value}
        </h3>
        <p
          className="text-sm mt-1"
          style={{
            color: (theme as any)?.muted || theme?.colors?.muted || undefined,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            ...(resolveResponsiveStyle((product.description as any)?.style, bp) || {}),
          }}
          data-edit-path={`layout.featured.items.${product.id}.description`}
          onClick={(e) => {
            if (!canManage) return;
            e.preventDefault();
            e.stopPropagation();
            onSelect(`layout.featured.items.${product.id}.description`);
          }}
        >
          {product.description?.value}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span
            className="font-semibold"
            data-edit-path={`layout.featured.items.${product.id}.price`}
            style={{ color: (theme as any)?.productPriceColor || theme?.colors?.text || undefined, whiteSpace: 'nowrap' }}
            onClick={(e) => {
              if (!canManage) return;
              e.preventDefault();
              e.stopPropagation();
              onSelect(`layout.featured.items.${product.id}.price`);
            }}
          >
            {formatPrice ? formatPrice(product.price) : String(product.price)}
          </span>
          <button
            className="px-3 py-1 text-white rounded"
            style={{ ...ctaStyle, whiteSpace: 'nowrap', minWidth: 'fit-content' }}
            data-edit-path="layout.featured.addLabel"
            onClick={(e) => {
              if (!canManage) return;
              e.preventDefault();
              e.stopPropagation();
              onSelect('layout.featured.addLabel');
            }}
          >
            {String(addLabel || 'Add')}
          </button>
        </div>
      </div>
    </article>
  );
}
