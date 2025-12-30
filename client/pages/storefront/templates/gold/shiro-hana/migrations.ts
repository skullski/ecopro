export const SHIRO_HANA_SCHEMA_VERSION = 2 as const;

type AnyRecord = Record<string, any>;

function isObject(v: unknown): v is AnyRecord {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function deepClone<T>(v: T): T {
  // Stored docs are JSON; this is a safe and simple clone.
  return JSON.parse(JSON.stringify(v));
}

export function migrateShiroHanaDoc(input: any): { doc: any; migrated: boolean; fromVersion: number; toVersion: number } {
  if (!isObject(input)) {
    return { doc: input, migrated: false, fromVersion: SHIRO_HANA_SCHEMA_VERSION, toVersion: SHIRO_HANA_SCHEMA_VERSION };
  }

  const originalVersion = typeof input.version === 'number' ? input.version : 1;
  let working = input;
  let migrated = false;

  // v1 -> v2: consolidate hero image heights into responsive `imageHeight`.
  if (originalVersion < 2) {
    working = deepClone(working);

    const hero = working?.layout?.hero;
    if (isObject(hero)) {
      const imageHeight = hero.imageHeight;
      const imageHeightMd = hero.imageHeightMd;

      const hasResponsive = isObject(imageHeight);
      if (!hasResponsive && typeof imageHeight === 'number' && typeof imageHeightMd === 'number') {
        hero.imageHeight = { mobile: imageHeight, desktop: imageHeightMd };
        migrated = true;
      }
    }

    working.version = 2;
    migrated = true;
  }

  // Always stamp current version (no-op if already correct).
  if (!isObject(working)) {
    return { doc: input, migrated: false, fromVersion: originalVersion, toVersion: SHIRO_HANA_SCHEMA_VERSION };
  }

  if (typeof working.version !== 'number' || working.version !== SHIRO_HANA_SCHEMA_VERSION) {
    if (!migrated) working = deepClone(working);
    working.version = SHIRO_HANA_SCHEMA_VERSION;
    migrated = true;
  }

  return { doc: working, migrated, fromVersion: originalVersion, toVersion: SHIRO_HANA_SCHEMA_VERSION };
}
