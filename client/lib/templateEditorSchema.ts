export type TemplateEditorFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'color'
  | 'image'
  | 'url'
  | 'select'
  | 'json';

/**
 * Editor mode determines which fields are shown:
 * - basic: Simple edits (text, images, colors, visibility)
 * - advanced: Full control (layout, spacing, effects, custom CSS)
 */
export type EditorMode = 'basic' | 'advanced';

/** @deprecated Use EditorMode instead */
export type TemplateEditorMinTier = 'bronze' | 'silver' | 'gold';

/**
 * Maps old tiers to new exposure system:
 * - bronze -> basic
 * - silver -> basic  
 * - gold -> advanced
 */
export function tierToExposure(tier?: TemplateEditorMinTier): EditorMode {
  if (tier === 'gold') return 'advanced';
  return 'basic';
}

export type TemplateEditorField = {
  key: string;
  label: string;
  type: TemplateEditorFieldType;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: string[];
  defaultValue?: unknown;
  /** Which editor mode shows this field */
  exposure?: EditorMode;
  /** @deprecated Use exposure instead */
  minTier?: TemplateEditorMinTier;
};

export type TemplateEditorSection = {
  title: string;
  description?: string;
  fields: TemplateEditorField[];
  /** Which editor mode shows this section */
  exposure?: EditorMode;
  /** @deprecated Use exposure instead */
  minTier?: TemplateEditorMinTier;
};
