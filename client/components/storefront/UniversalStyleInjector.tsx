import React, { useMemo } from 'react';
import { getUniversalDynamicStyles, useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function UniversalStyleInjector() {
  const universal = useTemplateUniversalSettings();

  const css = useMemo(() => {
    if (!universal) return '';
    return getUniversalDynamicStyles(universal);
  }, [universal]);

  if (!css) return null;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
