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
  canManage?: boolean;
};

export function Hero({ node, onSelect, resolveAssetUrl, ctaStyle, theme, responsive, videoUrl, canManage }: Props) {
  const title = node.title.value;
  const subtitle = node.subtitle?.value;
  const img = node.image;
  const layout = node.layout || "left-text";

  const kicker = String((theme as any)?.heroKickerText || (node as any)?.kicker?.value || '').trim();
  const badgeTitle = String((theme as any)?.heroBadgeTitle || '').trim();
  const badgeSubtitle = String((theme as any)?.heroBadgeSubtitle || '').trim();

  const heroTitleColor = (theme as any)?.heroTitleColor || theme?.colors?.text;
  const heroSubtitleColor = (theme as any)?.heroSubtitleColor || theme?.colors?.muted;
  const heroTitleSize = parseInt(String((theme as any)?.heroTitleSize || ''), 10);
  const heroSubtitleSize = parseInt(String((theme as any)?.heroSubtitleSize || ''), 10);
  const button2Border = (theme as any)?.button2Border || (theme as any)?.border || undefined;

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
      onClick={(e) => {
        if (canManage === false) return;
        e.preventDefault();
        e.stopPropagation();
        onSelect('layout.hero');
      }}
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
          {kicker ? (
            <div
              className="text-xs tracking-widest uppercase"
              style={{
                color: (theme as any)?.heroKickerColor || theme?.colors?.muted || undefined,
                marginBottom: '10px',
              }}
              data-edit-path="layout.hero.kicker"
              onClick={(e) => {
                if (canManage === false) return;
                e.preventDefault();
                e.stopPropagation();
                onSelect('layout.hero.kicker');
              }}
            >
              {kicker}
            </div>
          ) : null}
          <h1
            className={`text-4xl ${isMd ? 'text-5xl' : ''} font-serif`}
            style={{
              fontFamily: theme?.fonts?.heading || undefined,
              color: heroTitleColor || undefined,
              fontSize: Number.isFinite(heroTitleSize) ? `${heroTitleSize}px` : undefined,
              ...(resolveResponsiveStyle((node.title as any)?.style, bp) || {}),
            }}
            data-edit-path="layout.hero.title"
            onClick={(e) => {
              if (canManage === false) return;
              e.preventDefault();
              e.stopPropagation();
              onSelect('layout.hero.title');
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="mt-4 text-lg"
              style={{
                color: heroSubtitleColor || undefined,
                fontSize: Number.isFinite(heroSubtitleSize) ? `${heroSubtitleSize}px` : undefined,
                ...(resolveResponsiveStyle((node.subtitle as any)?.style, bp) || {}),
              }}
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => {
                if (canManage === false) return;
                e.preventDefault();
                e.stopPropagation();
                onSelect('layout.hero.subtitle');
              }}
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
                  className={`px-4 py-2 rounded ${i === 0 ? 'text-white' : ''}`}
                  style={
                    i === 0
                      ? ctaStyle
                      : {
                          backgroundColor: 'transparent',
                          color: theme?.colors?.text || undefined,
                          border: button2Border ? `1px solid ${button2Border}` : undefined,
                        }
                  }
                  data-edit-path={`layout.hero.cta.${i}.label`}
                  onClick={(e) => {
                    if (canManage === false) return;
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect(`layout.hero.cta.${i}.label`);
                  }}
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
            onClick={(e) => {
              if (canManage === false) return;
              e.preventDefault();
              e.stopPropagation();
              onSelect('layout.hero.image');
            }}
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

            {(badgeTitle || badgeSubtitle) ? (
              <div
                className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-2 rounded"
                style={{
                  border: `1px solid ${(theme as any)?.borderLight || 'rgba(0,0,0,0.08)'}`,
                }}
                data-edit-path="layout.hero.badge"
                onClick={(e) => {
                  if (canManage === false) return;
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect('layout.hero.badge');
                }}
              >
                {badgeTitle ? <div className="text-sm font-semibold">{badgeTitle}</div> : null}
                {badgeSubtitle ? <div className="text-xs opacity-80">{badgeSubtitle}</div> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
