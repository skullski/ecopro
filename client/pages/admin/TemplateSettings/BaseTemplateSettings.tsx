import { useState } from 'react';
import { Palette, Layout, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BaseTemplateSettingsProps {
  templateName: string;
  onSave: (settings: any) => void;
  loading?: boolean;
  children?: React.ReactNode;
}

export default function BaseTemplateSettings({
  templateName,
  onSave,
  loading = false,
  children,
}: BaseTemplateSettingsProps) {
  const [isDirty, setIsDirty] = useState(false);

  const handleSave = () => {
    // Override in child components
    onSave({});
    setIsDirty(false);
  };

  return (
    <div className="space-y-3 md:space-y-4 dark:bg-black">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{templateName} Settings</h2>
        </div>
        <Button
          onClick={handleSave}
          disabled={loading || !isDirty}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Settings Content */}
      <div className="space-y-3 md:space-y-4">
        {children ? (
          children
        ) : (
          <Card className="p-6 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400">No settings available for this template yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
