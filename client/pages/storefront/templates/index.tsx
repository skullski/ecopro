import { TemplateProps } from './types';
import BaseTemplate from './Base';
import EditorialTemplate from './Editorial';
import MaximizeTemplate from './Maximize';
import MercuryTemplate from './Mercury.tsx';

export type TemplateId = 'classic' | 'supreme' | 'maximize' | 'fullframe' | 'stockist' | 'walidstore' | 'minimal' | 'catalog' | 'mercury';

export function RenderStorefront(t: TemplateId, props: TemplateProps) {
  switch (t) {
    case 'supreme':
      return <EditorialTemplate {...props} mode="supreme" />;
    case 'fullframe':
      return <EditorialTemplate {...props} mode="fullframe" />;
    case 'maximize':
      return <MaximizeTemplate {...props} />;
    case 'stockist':
      return <BaseTemplate {...props} variant="stockist" />;
    case 'walidstore':
      return <BaseTemplate {...props} variant="walidstore" />;
    case 'minimal':
      return <BaseTemplate {...props} variant="minimal" />;
    case 'catalog':
      return <BaseTemplate {...props} variant="catalog" />;
    case 'mercury':
      return <MercuryTemplate {...props} />;
    case 'classic':
    default:
      return <BaseTemplate {...props} variant="classic" />;
  }
}
