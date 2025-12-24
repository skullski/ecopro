export function setWindowTemplateSettings(settings: unknown) {
  (window as any).TEMPLATE_SETTINGS = settings;
  window.dispatchEvent(new Event('template-settings-updated'));
}

export function setWindowTemplateData(data: unknown) {
  (window as any).TEMPLATE_DATA = data;
  window.dispatchEvent(new Event('template-data-updated'));
}
