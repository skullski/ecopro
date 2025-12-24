import type { TemplateEditorSection } from './templateEditorSchema';

type MaybeModule = {
  TEMPLATE_EDITOR_SECTIONS?: TemplateEditorSection[];
};

// Eagerly import template modules so we can read optional exports.
// This keeps the system scalable: templates can opt-in by exporting TEMPLATE_EDITOR_SECTIONS.
const modules = import.meta.glob<MaybeModule>('@/components/templates/*.tsx', { eager: true });

function fileNameToTemplateId(filePath: string): string {
  const parts = filePath.split('/');
  const file = parts[parts.length - 1] || '';
  return file.replace(/\.tsx$/i, '');
}

const sectionsByTemplateId: Record<string, TemplateEditorSection[]> = Object.entries(modules).reduce(
  (acc, [filePath, mod]) => {
    const templateId = fileNameToTemplateId(filePath);
    const sections = (mod as any)?.TEMPLATE_EDITOR_SECTIONS;
    if (Array.isArray(sections) && sections.length) {
      acc[templateId] = sections;
    }
    return acc;
  },
  {} as Record<string, TemplateEditorSection[]>
);

export function getTemplateEditorSections(templateId: string): TemplateEditorSection[] {
  return sectionsByTemplateId[templateId] || [];
}
