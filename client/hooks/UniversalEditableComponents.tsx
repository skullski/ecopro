/**
 * Universal Editable Components
 * 
 * These components automatically add data-edit-path attributes for the editor.
 * Use these instead of raw HTML elements to make your template universally editable.
 * 
 * Example:
 *   Before: <h1>{settings.template_hero_heading}</h1>
 *   After:  <HeroTitle data={universalData}>Custom rendering here</HeroTitle>
 * 
 * Or simply:
 *   <HeroTitle data={universalData} />
 */

import React from 'react';
import { UniversalTemplateData, getEditPath, UniversalField } from './useUniversalTemplateData';

// ============================================================================
// BASE EDITABLE COMPONENT
// ============================================================================

interface EditableProps {
  field: UniversalField;
  data: UniversalTemplateData;
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

/**
 * Generic editable component - wraps any HTML element with data-edit-path
 */
export function Editable({ 
  field, 
  data, 
  as: Component = 'span', 
  children, 
  className,
  style,
  ...props 
}: EditableProps) {
  const value = data[field as keyof UniversalTemplateData];
  const editPath = getEditPath(field);
  
  return (
    <Component 
      data-edit-path={editPath}
      className={className}
      style={style}
      {...props}
    >
      {children ?? (typeof value === 'string' ? value : null)}
    </Component>
  );
}

// ============================================================================
// HERO COMPONENTS
// ============================================================================

interface HeroComponentProps {
  data: UniversalTemplateData;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function HeroKicker({ data, children, ...props }: HeroComponentProps) {
  return (
    <span data-edit-path={getEditPath('heroKicker')} {...props}>
      {children ?? data.heroKicker}
    </span>
  );
}

export function HeroTitle({ data, children, ...props }: HeroComponentProps) {
  return (
    <h1 data-edit-path={getEditPath('heroTitle')} {...props}>
      {children ?? data.heroTitle}
    </h1>
  );
}

export function HeroSubtitle({ data, children, ...props }: HeroComponentProps) {
  return (
    <p data-edit-path={getEditPath('heroSubtitle')} {...props}>
      {children ?? data.heroSubtitle}
    </p>
  );
}

interface HeroImageProps extends HeroComponentProps {
  alt?: string;
}

export function HeroImage({ data, alt, className, style, ...props }: HeroImageProps) {
  if (!data.heroImage) return null;
  
  const imageStyle: React.CSSProperties = {
    ...style,
    transform: `scale(${data.heroImageScale || 1})`,
    objectPosition: `${(data.heroImagePositionX || 0.5) * 100}% ${(data.heroImagePositionY || 0.5) * 100}%`,
  };
  
  return (
    <img
      src={data.heroImage}
      alt={alt ?? data.heroImageAlt ?? 'Hero image'}
      data-edit-path={getEditPath('heroImage')}
      className={className}
      style={imageStyle}
      {...props}
    />
  );
}

export function HeroVideo({ data, className, style, ...props }: HeroComponentProps) {
  if (!data.heroVideo) return null;
  
  return (
    <video
      src={data.heroVideo}
      autoPlay={data.heroVideoAutoplay}
      loop={data.heroVideoLoop}
      muted
      playsInline
      data-edit-path={getEditPath('heroVideo')}
      className={className}
      style={style}
      {...props}
    />
  );
}

export function HeroCta({ data, children, className, onClick, ...props }: HeroComponentProps & { onClick?: () => void }) {
  return (
    <button
      data-edit-path={getEditPath('heroCtaText')}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children ?? data.heroCtaText}
    </button>
  );
}

export function HeroSecondaryCta({ data, children, className, onClick, ...props }: HeroComponentProps & { onClick?: () => void }) {
  return (
    <button
      data-edit-path={getEditPath('heroSecondaryCtaText')}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children ?? data.heroSecondaryCtaText}
    </button>
  );
}

// ============================================================================
// STORE COMPONENTS
// ============================================================================

export function StoreName({ data, children, ...props }: HeroComponentProps) {
  return (
    <span data-edit-path={getEditPath('storeName')} {...props}>
      {children ?? data.storeName}
    </span>
  );
}

export function StoreDescription({ data, children, ...props }: HeroComponentProps) {
  return (
    <p data-edit-path={getEditPath('storeDescription')} {...props}>
      {children ?? data.storeDescription}
    </p>
  );
}

export function StoreLogo({ data, alt, className, style, ...props }: HeroImageProps) {
  if (!data.storeLogo) return null;
  
  return (
    <img
      src={data.storeLogo}
      alt={alt ?? `${data.storeName} logo`}
      data-edit-path={getEditPath('storeLogo')}
      className={className}
      style={style}
      {...props}
    />
  );
}

// ============================================================================
// HEADER COMPONENTS
// ============================================================================

export function HeaderTagline({ data, children, ...props }: HeroComponentProps) {
  return (
    <span data-edit-path={getEditPath('headerTagline')} {...props}>
      {children ?? data.headerTagline}
    </span>
  );
}

// ============================================================================
// FEATURED SECTION COMPONENTS
// ============================================================================

export function FeaturedTitle({ data, children, ...props }: HeroComponentProps) {
  return (
    <h2 data-edit-path={getEditPath('featuredTitle')} {...props}>
      {children ?? data.featuredTitle}
    </h2>
  );
}

export function FeaturedSubtitle({ data, children, ...props }: HeroComponentProps) {
  return (
    <p data-edit-path={getEditPath('featuredSubtitle')} {...props}>
      {children ?? data.featuredSubtitle}
    </p>
  );
}

// ============================================================================
// TESTIMONIALS COMPONENTS
// ============================================================================

export function TestimonialsTitle({ data, children, ...props }: HeroComponentProps) {
  return (
    <h2 data-edit-path={getEditPath('testimonialsTitle')} {...props}>
      {children ?? data.testimonialsTitle}
    </h2>
  );
}

// ============================================================================
// FOOTER COMPONENTS
// ============================================================================

export function FooterAbout({ data, children, ...props }: HeroComponentProps) {
  return (
    <p data-edit-path={getEditPath('footerAbout')} {...props}>
      {children ?? data.footerAbout}
    </p>
  );
}

export function FooterCopyright({ data, children, ...props }: HeroComponentProps) {
  return (
    <span data-edit-path={getEditPath('footerCopyright')} {...props}>
      {children ?? data.footerCopyright}
    </span>
  );
}

// ============================================================================
// BUTTON TEXT COMPONENTS
// ============================================================================

export function BuyButton({ data, children, className, onClick, ...props }: HeroComponentProps & { onClick?: () => void }) {
  return (
    <button
      data-edit-path={getEditPath('buyButtonText')}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children ?? data.buyButtonText}
    </button>
  );
}

export function AddToCartButton({ data, children, className, onClick, ...props }: HeroComponentProps & { onClick?: () => void }) {
  return (
    <button
      data-edit-path={getEditPath('addToCartText')}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children ?? data.addToCartText}
    </button>
  );
}
