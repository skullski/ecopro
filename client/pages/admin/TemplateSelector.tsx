import { useState, useEffect } from 'react';
import { Layout, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TEMPLATES } from '@/components/TemplateRegistry';

interface TemplateSelectorProps {
  currentTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onSave?: () => void;
  loading?: boolean;
}

export default function TemplateSelector({
  currentTemplate,
  onTemplateSelect,
  onSave,
  loading = false,
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);

  useEffect(() => {
    setSelectedTemplate(currentTemplate);
  }, [currentTemplate]);

  const handleSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    onTemplateSelect(templateId);
  };

  return (
    <div className="space-y-3 md:space-y-4 dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layout className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Store Templates</h2>
        </div>
        {onSave && (
          <Button
            onClick={onSave}
            disabled={loading || selectedTemplate === currentTemplate}
            className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Template'}
          </Button>
        )}
      </div>

      {/* Templates Grid */}
      {TEMPLATES.length === 0 ? (
        <div className="text-center py-6 md:py-4 md:py-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400">No templates available yet.</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Templates will appear here as they are added.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => handleSelect(template.id)}
              className={`relative group rounded-2xl overflow-hidden transition-all duration-300 ${
                selectedTemplate === template.id
                  ? 'ring-2 ring-indigo-500 dark:ring-indigo-400'
                  : 'hover:ring-2 hover:ring-indigo-300 dark:hover:ring-indigo-600'
              }`}
            >
              {/* Preview Image */}
              <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                {template.preview ? (
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layout className="w-12 h-12 text-slate-400 dark:text-slate-600" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />

                {/* Selected Badge */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-3 right-3 bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Selected
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">{template.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{template.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
