import { describe, expect, it } from 'vitest';

import { migrateShiroHanaDoc, SHIRO_HANA_SCHEMA_VERSION } from '../migrations';
import { resolveResponsiveNumber, resolveResponsiveStyle } from '../responsive';

describe('shiro-hana migrations', () => {
  it('migrates v1 hero imageHeight + imageHeightMd into responsive imageHeight', () => {
    const input = {
      version: 1,
      layout: {
        hero: {
          imageHeight: 220,
          imageHeightMd: 420,
        },
      },
    };

    const { doc, migrated, fromVersion, toVersion } = migrateShiroHanaDoc(input);
    expect(migrated).toBe(true);
    expect(fromVersion).toBe(1);
    expect(toVersion).toBe(SHIRO_HANA_SCHEMA_VERSION);
    expect(doc.version).toBe(SHIRO_HANA_SCHEMA_VERSION);
    expect(doc.layout.hero.imageHeight).toEqual({ mobile: 220, desktop: 420 });
  });

  it('does not overwrite existing responsive hero imageHeight', () => {
    const input = {
      version: 1,
      layout: {
        hero: {
          imageHeight: { mobile: 200, desktop: 400 },
          imageHeightMd: 999,
        },
      },
    };

    const { doc } = migrateShiroHanaDoc(input);
    expect(doc.layout.hero.imageHeight).toEqual({ mobile: 200, desktop: 400 });
  });
});

describe('shiro-hana responsive helpers', () => {
  it('resolves responsive numbers with desktop fallback', () => {
    expect(resolveResponsiveNumber({ mobile: 1, desktop: 3 }, 'mobile')).toBe(1);
    expect(resolveResponsiveNumber({ mobile: 1, desktop: 3 }, 'tablet')).toBe(3);
    expect(resolveResponsiveNumber({ desktop: 3 }, 'tablet')).toBe(3);
    expect(resolveResponsiveNumber(7, 'desktop')).toBe(7);
  });

  it('resolves responsive style values per breakpoint', () => {
    const style = {
      fontSize: { mobile: 12, desktop: 20 },
      lineHeight: { mobile: 1.2, desktop: 1.4 },
      color: '#111111',
    };

    expect(resolveResponsiveStyle(style, 'mobile')).toEqual({
      fontSize: 12,
      lineHeight: 1.2,
      color: '#111111',
    });

    expect(resolveResponsiveStyle(style, 'tablet')).toEqual({
      fontSize: 20,
      lineHeight: 1.4,
      color: '#111111',
    });
  });
});
