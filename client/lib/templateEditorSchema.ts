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

export type TemplateEditorField = {
  key: string;
  label: string;
  type: TemplateEditorFieldType;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: string[];
};

export type TemplateEditorSection = {
  title: string;
  description?: string;
  fields: TemplateEditorField[];
};
