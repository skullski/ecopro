import { Users, Heart, Target, Sparkles, Shield, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function About() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bS0yIDJoLTJ2Mmgydi0yek0zMiAzOGgtMnYyaDJ2LTJ6bS0yLTJoLTJ2Mmgydi0yek0yOCAzNGgtMnYyaDJ2LTJ6bS02IDB2LTJoLTJ2Mmgyem0tMiAydi0ySDR2Mmgyem0tMiAydi0ySDR2MmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 max-w-5xl">
          {/* Hero Content */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-lg mb-4">
              <Heart className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-medium">{t('about.badge') || 'Built with passion'}</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                {t('about.title') || 'Our Mission'}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {t('about.subtitle') || 'Empowering sellers, connecting buyers, and helping online businesses grow.'}
            </p>
          </div>

          {/* Story Section */}
          <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 border border-indigo-100 dark:border-indigo-900">
              <div className="flex items-start gap-2.5 mb-3">
                <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold mb-1">{t('about.storyTitle') || 'Our Story'}</h2>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {t('about.storyDesc') || 'We created this marketplace to remove barriers and bring communities together.'}
              </p>
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <Shield className="w-4 h-4 text-indigo-600" />
                <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('about.unique') || 'What makes us unique? Openness, fairness, and real support—for everyone.'}
                </p>
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            {[
              {
                icon: Target,
                title: t('about.visionTitle') || 'Our Vision',
                description: t('about.visionDesc') || 'To become the most accessible and trusted marketplace.'
              },
              {
                icon: Users,
                title: t('about.communityTitle') || 'Community First',
                description: t('about.communityDesc') || 'We build trust and transparency between sellers and buyers.'
              },
              {
                icon: Globe,
                title: t('about.globalTitle') || 'Global Reach',
                description: t('about.globalDesc') || 'We support growth from local businesses to international sellers.'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center mb-3">
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-bold mb-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Team Section */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-lg p-4 sm:p-5 border border-indigo-100 dark:border-indigo-800">
              <h2 className="text-base sm:text-lg font-bold mb-2">{t('about.teamTitle') || 'Meet the Team'}</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {t('about.teamDesc') || 'Founded by Walid and friends—builders passionate about making a difference.'}
              </p>
              <Link to="/contact">
                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg text-sm">
                  {t('about.teamCta') || 'Get in Touch'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
