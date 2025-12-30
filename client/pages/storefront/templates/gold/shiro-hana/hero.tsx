import React from "react";
import type { HeroNode } from "./schema-types";
import { resolveResponsiveNumber, resolveResponsiveStyle, type Breakpoint } from './responsive';

type Props = {
  node: HeroNode;
  onSelect: (path: string) => void;
  resolveAssetUrl?: (assetKey: string) => string;
  ctaStyle?: React.CSSProperties;
  theme?: any;
  responsive?: { isSm?: boolean; isMd?: boolean; width?: number; breakpoint?: 'mobile' | 'tablet' | 'desktop' };
  videoUrl?: string | null;
};

export function Hero({ node, onSelect, resolveAssetUrl, ctaStyle, theme, responsive, videoUrl }: Props) {
  const title = node.title.value;
  const subtitle = node.subtitle?.value;
  const img = node.image;
  const layout = node.layout || "left-text";

  const imgSrc = img?.assetKey
    ? (resolveAssetUrl ? resolveAssetUrl(img.assetKey) : `/assets/${img.assetKey}`)
    : "";

  const effectiveVideoUrl = typeof videoUrl === 'string' && videoUrl.trim() ? videoUrl.trim() : '';

  const bp = (responsive?.breakpoint || (responsive?.isMd ? 'desktop' : (responsive?.isSm ? 'tablet' : 'mobile'))) as Breakpoint;
  const resolveNumber = (v: any): number | undefined => resolveResponsiveNumber(v, bp);

  const sectionPadY = resolveNumber((node as any)?.paddingY);
  const sectionPadX = resolveNumber((node as any)?.paddingX);
  const sectionGap = resolveNumber((node as any)?.gap);
  const imageHeight = resolveNumber((node as any)?.imageHeight);
  const imageHeightMd = typeof (node as any)?.imageHeightMd === 'number' ? (node as any).imageHeightMd : undefined;

  const imgPosXRaw = resolveNumber((img as any)?.posX);
  const imgPosYRaw = resolveNumber((img as any)?.posY);
  const imgSize = resolveNumber((img as any)?.size);
  const imgScaleXRaw = resolveNumber((img as any)?.scaleX);
  const imgScaleYRaw = resolveNumber((img as any)?.scaleY);

  const posX = typeof imgPosXRaw === 'number' ? Math.max(0, Math.min(1, imgPosXRaw)) : 0.5;
  const posY = typeof imgPosYRaw === 'number' ? Math.max(0, Math.min(1, imgPosYRaw)) : 0.5;
  const scaleX = typeof imgScaleXRaw === 'number' ? imgScaleXRaw : (typeof imgSize === 'number' ? imgSize : 1);
  const scaleY = typeof imgScaleYRaw === 'number' ? imgScaleYRaw : (typeof imgSize === 'number' ? imgSize : 1);

  const isMd = !!responsive?.isMd;
  const effectiveImageHeight = imageHeight ?? (isMd ? imageHeightMd : undefined);

  return (
    <section
      className={`w-full ${layout === "left-text" && isMd ? "flex items-center" : ""}`}
      style={{
        paddingTop: sectionPadY,
        paddingBottom: sectionPadY,
      }}
      data-edit-path="layout.hero"
      onClick={() => onSelect('layout.hero')}
    >
      <div
        className={`container mx-auto ${isMd ? 'flex' : ''}`}
        style={{
          paddingLeft: sectionPadX,
          paddingRight: sectionPadX,
          gap: sectionGap,
        }}
      >
        <div className={isMd ? 'w-1/2' : 'w-full'}>
          <h1
            className={`text-4xl ${isMd ? 'text-5xl' : ''} font-serif`}
            style={{
              fontFamily: theme?.fonts?.heading || undefined,
              color: theme?.colors?.text || undefined,
              ...(resolveResponsiveStyle((node.title as any)?.style, bp) || {}),
            }}
            data-edit-path="layout.hero.title"
            onClick={() => onSelect("layout.hero.title")}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="mt-4 text-lg"
              style={{
                color: theme?.colors?.muted || undefined,
                ...(resolveResponsiveStyle((node.subtitle as any)?.style, bp) || {}),
              }}
              data-edit-path="layout.hero.subtitle"
              onClick={() => onSelect('layout.hero.subtitle')}
            >
              {subtitle}
            </p>
          )}
          {node.cta?.length > 0 && (
            <div className="mt-6 flex gap-3">
              {node.cta.map((c, i) => (
                <a
                  key={i}
                  href={c.action}
                  className="px-4 py-2 text-white rounded"
                  style={ctaStyle}
                  data-edit-path={`layout.hero.cta.${i}.label`}
                  onClick={() => onSelect(`layout.hero.cta.${i}.label`)}
                >
                  <span style={resolveResponsiveStyle(c?.label?.style, bp) || undefined}>{c?.label?.value}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className={`${isMd ? 'w-1/2' : 'w-full'} mt-8 ${isMd ? 'mt-0' : ''}`}
        >
          <div
            className="relative rounded-lg overflow-hidden"
            data-edit-path="layout.hero.image"
            onClick={() => onSelect("layout.hero.image")}
          >
            {effectiveVideoUrl ? (
              <video
                src={effectiveVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full object-cover"
                style={{
                  objectFit: 'cover',
                  height: effectiveImageHeight,
                }}
              />
            ) : (
              <img
                src={imgSrc}
                alt={img?.alt || ""}
                style={{
                  objectFit: img?.fit || 'cover',
                  objectPosition: `${Math.round(posX * 100)}% ${Math.round(posY * 100)}%`,
                  transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
                  height: effectiveImageHeight,
                }}
                className="w-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
