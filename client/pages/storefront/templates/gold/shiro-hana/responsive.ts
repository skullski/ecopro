export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function isObject(value: unknown): value is Record<string, any> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function resolveResponsiveNumber(value: any, bp: Breakpoint): number | undefined {
  if (typeof value === 'number') return value;
  if (!isObject(value)) return undefined;
  const byBp = value?.[bp];
  if (typeof byBp === 'number') return byBp;
  const fallback = value?.desktop;
  return typeof fallback === 'number' ? fallback : undefined;
}

export function resolveResponsiveStyle(style: any, bp: Breakpoint): any {
  if (!isObject(style)) return style;

  let changed = false;
  const out: Record<string, any> = { ...style };
  for (const key of Object.keys(out)) {
    const raw = out[key];
    const resolved = resolveResponsiveNumber(raw, bp);
    if (typeof resolved === 'number') {
      out[key] = resolved;
      changed = true;
    }
  }

  return changed ? out : style;
}
