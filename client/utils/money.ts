export type MoneyFormatOptions = {
  locale?: string;
  /** Override fraction digits (rare). If not provided, inferred from currency, except DZD forced to 0. */
  fractionDigits?: number;
  /** When Intl currency formatting fails, this suffix is appended (e.g. "DZD"). */
  fallbackCurrencyLabel?: string;
};

function normalizeCurrencyCode(code: unknown): string {
  const c = String(code || '').trim().toUpperCase();
  return c || 'DZD';
}

export function getCurrencyFractionDigits(currencyCode: unknown): number {
  const code = normalizeCurrencyCode(currencyCode);

  // Algeria: no cents in UI
  if (code === 'DZD' || code === 'DA') return 0;

  try {
    const resolved = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
    }).resolvedOptions();

    if (typeof resolved.maximumFractionDigits === 'number') {
      return resolved.maximumFractionDigits;
    }
  } catch {
    // ignore
  }

  // Safe default
  return 2;
}

/**
 * Formats an amount as a currency string using Intl when possible.
 * - DZD/DA are forced to 0 decimals.
 * - Other currencies use their Intl-resolved fraction digits by default.
 */
export function formatMoney(amount: unknown, currencyCode?: unknown, opts: MoneyFormatOptions = {}): string {
  const code = normalizeCurrencyCode(currencyCode);
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const fractionDigits = typeof opts.fractionDigits === 'number'
    ? Math.max(0, Math.min(6, Math.floor(opts.fractionDigits)))
    : getCurrencyFractionDigits(code);

  try {
    return new Intl.NumberFormat(opts.locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(safe);
  } catch {
    const label = opts.fallbackCurrencyLabel || code;
    return `${formatMoneyAmount(safe, code, opts)} ${label}`;
  }
}

/**
 * Formats just the numeric part (no symbol/code), respecting currency fraction digits.
 * Useful when the UI hardcodes a prefix like '$'.
 */
export function formatMoneyAmount(amount: unknown, currencyCode?: unknown, opts: MoneyFormatOptions = {}): string {
  const code = normalizeCurrencyCode(currencyCode);
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const fractionDigits = typeof opts.fractionDigits === 'number'
    ? Math.max(0, Math.min(6, Math.floor(opts.fractionDigits)))
    : getCurrencyFractionDigits(code);

  try {
    return new Intl.NumberFormat(opts.locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(safe);
  } catch {
    // fallback: enforce digits via rounding
    if (fractionDigits <= 0) return String(Math.round(safe));
    const factor = Math.pow(10, fractionDigits);
    return String(Math.round(safe * factor) / factor);
  }
}
