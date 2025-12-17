// Template Registry - Central place to register all available templates

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  preview?: string;
  component: any;
  settingsComponent: any;
}

// Import templates here as they're created
// import TemplateMinimalist from './templates/TemplateMinimalist';
// import MinimalistSettings from './pages/admin/TemplateSettings/MinimalistSettings';

export const TEMPLATES: TemplateMetadata[] = [
  // Add templates here as you copy them
  // {
  //   id: 'minimalist',
  //   name: 'Minimalist',
  //   description: 'Clean and simple product listing',
  //   preview: '/templates/minimalist-preview.png',
  //   component: TemplateMinimalist,
  //   settingsComponent: MinimalistSettings,
  // },
];

export const getTemplate = (templateId: string): TemplateMetadata | undefined => {
  return TEMPLATES.find(t => t.id === templateId);
};

export const getTemplateComponent = (templateId: string) => {
  const template = getTemplate(templateId);
  return template?.component;
};

export const getTemplateSettings = (templateId: string) => {
  const template = getTemplate(templateId);
  return template?.settingsComponent;
};
