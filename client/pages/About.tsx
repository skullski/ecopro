import { Users, Heart, Target, Sparkles, Shield, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function About() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bS0yIDJoLTJ2Mmgydi0yek0zMiAzOGgtMnYyaDJ2LTJ6bS0yLTJoLTJ2Mmgydi0yek0yOCAzNGgtMnYyaDJ2LTJ6bS02IDB2LTJoLTJ2Mmgyem0tMiAydi0ySDR2Mmgyem0tMiAydi0ySDR2MmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 max-w-6xl">
          {/* Hero Content */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-lg mb-6">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">{t('about.badge') || 'Built with passion'}</span>
            </div>
            
            <h1 className="text-xl md:text-2xl md:text-2xl md:text-xl md:text-2xl lg:text-xl md:text-2xl md:text-2xl md:text-xl md:text-2xl xl:text-6xl font-black mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                {t('about.title') || 'Our Mission'}
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('about.subtitle') || 'Empowering sellers, connecting buyers, and helping online businesses grow.'}
            </p>
          </div>

          {/* Story Section */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3 md:p-4 border border-indigo-100 dark:border-indigo-900">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-xl md:text-2xl font-bold mb-2">{t('about.storyTitle') || 'Our Story'}</h2>
                </div>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t('about.storyDesc') || 'We created this marketplace to remove barriers and bring communities together.'}
              </p>
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <Shield className="w-5 h-5 text-indigo-600" />
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  {t('about.unique') || 'What makes us unique? Openness, fairness, and real support—for everyone.'}
                </p>
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-4 md:gap-3 md:gap-4 mb-6 md:mb-4 md:mb-6 md:mb-16">
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
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Team Section */}
          <div className="text-center max-w-3xl mx-auto mb-6 md:mb-4 md:mb-6">
            <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-lg p-4 md:p-6 border border-indigo-100 dark:border-indigo-800">
              <h2 className="text-2xl font-bold mb-4">{t('about.teamTitle') || 'Meet the Team'}</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                {t('about.teamDesc') || 'Founded by Walid and friends—builders passionate about making a difference.'}
              </p>
              <Link to="/contact">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-xl">
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
