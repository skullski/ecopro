export type SilverImageBlock = {
  id: string;
  url: string;
  alt?: string;
};

export const MAX_SILVER_BLOCKS = 3;

export function coerceSilverImageBlocks(input: unknown): SilverImageBlock[] {
  try {
    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (!trimmed) return [];
      return coerceSilverImageBlocks(JSON.parse(trimmed));
    }

    if (!input) return [];

    if (Array.isArray(input)) {
      return input
        .map((raw: any, idx: number) => {
          const id = typeof raw?.id === 'string' && raw.id.trim() ? raw.id : `blk_${idx}`;
          const url = typeof raw?.url === 'string' ? raw.url : '';
          const alt = typeof raw?.alt === 'string' ? raw.alt : undefined;
          return { id, url, alt } as SilverImageBlock;
        })
        .filter((b) => typeof b.url === 'string')
        .slice(0, MAX_SILVER_BLOCKS);
    }

    if (typeof input === 'object') {
      // Accept legacy object-shape values by taking its values.
      const values = Object.values(input as any);
      if (Array.isArray(values)) return coerceSilverImageBlocks(values);
    }
  } catch {
    // fall through
  }

  return [];
}
