import type { MouseEvent } from 'react';

export type GoldEditorPick = {
  key: string;
  element: HTMLElement;
};

// Gold editor selection model:
// - The preview template marks editable elements using `data-gold-edit-key="some_setting_key"`.
// - When the user clicks the preview, we resolve the nearest marked element and return its key.

export function pickGoldEditorTargetFromEvent(event: MouseEvent<HTMLElement>): GoldEditorPick | null {
  const target = event.target as HTMLElement | null;
  if (!target) return null;

  const el = target.closest?.('[data-gold-edit-key]') as HTMLElement | null;
  if (!el) return null;

  const key = String(el.getAttribute('data-gold-edit-key') || '').trim();
  if (!key) return null;

  return { key, element: el };
}

export function goldEditorKeySelector(key: string): string {
  return `[data-gold-edit-key="${cssEscape(key)}"]`;
}

// Minimal CSS escape for attribute value usage.
function cssEscape(v: string): string {
  // Escape backslash and quotes for a CSS attribute selector.
  return String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
