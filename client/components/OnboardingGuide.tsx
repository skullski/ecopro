import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, Package, ShoppingCart, Palette, Settings, Rocket,
  CheckCircle, ChevronRight, X, Sparkles, ArrowRight
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { dismissOnboarding, getOnboardingProgress } from '@/lib/onboarding';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  link: string;
  isComplete: boolean;
}

interface OnboardingGuideProps {
  hasProducts: boolean;
  hasStoreBasics: boolean;
  hasBranding: boolean;
  hasOrders: boolean;
  hasTemplateSwitched: boolean;
  hasStoreLinkCopied: boolean;
  onDismiss?: () => void;
}

export default function OnboardingGuide({ 
  hasProducts, 
  hasStoreBasics,
  hasBranding,
  hasOrders,
  hasTemplateSwitched,
  hasStoreLinkCopied,
  onDismiss 
}: OnboardingGuideProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(() => getOnboardingProgress().dismissed);

  // Show onboarding for both new users and existing accounts that are still empty.
  // Rule: Only show if they have no products, no orders, and haven't switched templates yet.
  const shouldShow = !(dismissed || hasProducts || hasOrders || hasTemplateSwitched);

  const handleDismiss = () => {
    dismissOnboarding();
    setDismissed(true);
    onDismiss?.();
  };

  const openBranding = '/dashboard/preview?onboarding=1&openSettings=1&tab=branding';
  const openTemplates = '/dashboard/preview?onboarding=1&openSettings=1&tab=templates';
  const openCreateProduct = '/dashboard/preview?onboarding=1&action=create-product';
  const openShare = '/dashboard/preview?onboarding=1&openSettings=1&tab=storeUrl';

  const steps: OnboardingStep[] = [
    {
      id: 'store',
      title: t('onboarding.setupStore') || 'Set Up Your Store',
      description: t('onboarding.setupStoreDesc') || 'Add store name, logo, and description',
      icon: <Store className="w-5 h-5" />,
      link: openBranding,
      isComplete: hasStoreBasics && hasBranding,
    },
    {
      id: 'template',
      title: t('onboarding.chooseTemplate') || 'Choose a Template',
      description: t('onboarding.chooseTemplateDesc') || 'Pick a storefront design that fits your niche',
      icon: <Palette className="w-5 h-5" />,
      link: openTemplates,
      isComplete: hasTemplateSwitched,
    },
    {
      id: 'products',
      title: t('onboarding.addProducts') || 'Create Your First Product',
      description: t('onboarding.addProductsDesc') || 'Upload photos, price, stock, and variants',
      icon: <Package className="w-5 h-5" />,
      link: openCreateProduct,
      isComplete: hasProducts,
    },
    {
      id: 'share',
      title: t('onboarding.shareStore') || 'Share Your Store Link',
      description: t('onboarding.shareStoreDesc') || 'Copy your store link and start selling',
      icon: <Rocket className="w-5 h-5" />,
      link: openShare,
      isComplete: hasStoreLinkCopied,
    },
  ];

  if (!shouldShow) {
    return null;
  }

  const completedCount = steps.filter(s => s.isComplete).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 dark:from-primary/10 dark:via-accent/10 dark:to-primary/10 rounded-2xl border-2 border-primary/20 dark:border-primary/30 p-5 mb-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {t('onboarding.title') || "Let's Get Started! 🚀"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('onboarding.subtitle') || 'Complete these steps to launch your store'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-slate-600 dark:text-slate-400">
              {completedCount} {t('onboarding.of') || 'of'} {steps.length} {t('onboarding.completed') || 'completed'}
            </span>
            <span className="font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {steps.map((step, index) => (
            <Link
              key={step.id}
              to={step.link}
              className={`group flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${
                step.isComplete
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-lg'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                step.isComplete
                  ? 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
              }`}>
                {step.isComplete ? <CheckCircle className="w-5 h-5" /> : step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    step.isComplete 
                      ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {index + 1}
                  </span>
                  <h4 className={`font-semibold text-sm truncate ${
                    step.isComplete 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-slate-800 dark:text-white'
                  }`}>
                    {step.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {step.description}
                </p>
              </div>
              {!step.isComplete && (
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              )}
            </Link>
          ))}
        </div>

        {/* Quick action */}
        {!hasProducts && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Link
              to="/dashboard/preview?onboarding=1&action=create-product"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <Package className="w-4 h-4" />
              {t('onboarding.addFirstProduct') || 'Add Your First Product'}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
