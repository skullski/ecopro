import { Button } from "@/components/ui/button";
import {
  Store,
  TrendingUp,
  Users,
  Shield,
  Rocket,
  Star,
  ArrowRight,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

export default function Index() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen">
      {/* Modern Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bS0yIDJoLTJ2Mmgydi0yek0zMiAzOGgtMnYyaDJ2LTJ6bS0yLTJoLTJ2Mmgydi0yek0yOCAzNGgtMnYyaDJ2LTJ6bS02IDB2LTJoLTJ2Mmgyem0tMiAydi0ySDR2Mmgyem0tMiAydi0ySDR2MmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium">{t("home.liveGrowing")}</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-tight">
                {t("home.heroYour")}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                  {t("home.heroMarketplace")}
                </span>
                {t("home.heroTitle")}
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg">
                {t("home.heroDescription")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/vendor/signup">
                  <Button size="lg" className="group bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl px-8 h-14 text-lg">
                    {t("home.startSelling")}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/store">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 hover:border-indigo-600 hover:text-indigo-600">
                    {t("home.exploreMarketplace")}
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t("home.reviews")}</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              {/* Floating Cards */}
              <div className="relative h-[500px]">
                {/* Card 1 */}
                <div className="absolute top-0 right-0 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 animate-float">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                      <TrendingUp />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t("home.salesToday")}</p>
                      <p className="text-2xl font-bold">$12,450</p>
                    </div>
                  </div>
                  <div className="h-20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg"></div>
                </div>

                {/* Card 2 */}
                <div className="absolute top-32 left-0 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 animate-float" style={{animationDelay: '0.5s'}}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">{t("home.newProducts")}</h3>
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-medium">+24</span>
                  </div>
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 3 */}
                <div className="absolute bottom-0 right-8 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 animate-float" style={{animationDelay: '1s'}}>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-medium">{t("home.activeVendors")}</p>
                  </div>
                  <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">1,247</p>
                  <p className="text-xs text-gray-500 mt-2">{t("home.thisWeek")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              {t("home.featuresTitle")}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                {t("home.featuresSubtitle")}
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t("home.featuresDescription")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Store />}
              title={t("home.feature.storefront.title")}
              description={t("home.feature.storefront.desc")}
              color="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<TrendingUp />}
              title={t("home.feature.analytics.title")}
              description={t("home.feature.analytics.desc")}
              color="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Users />}
              title={t("home.feature.audience.title")}
              description={t("home.feature.audience.desc")}
              color="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<Shield />}
              title={t("home.feature.payments.title")}
              description={t("home.feature.payments.desc")}
              color="from-orange-500 to-red-500"
            />
            <FeatureCard
              icon={<Rocket />}
              title={t("home.feature.launch.title")}
              description={t("home.feature.launch.desc")}
              color="from-indigo-500 to-purple-500"
            />
            <FeatureCard
              icon={<Globe />}
              title={t("home.feature.global.title")}
              description={t("home.feature.global.desc")}
              color="from-cyan-500 to-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">{t("home.testimonials.title")}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">{t("home.testimonials.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: t("home.testimonial1.name"), role: t("home.testimonial1.role"), quote: t("home.testimonial1.quote"), avatar: "🎨" },
              { name: t("home.testimonial2.name"), role: t("home.testimonial2.role"), quote: t("home.testimonial2.quote"), avatar: "⚡" },
              { name: t("home.testimonial3.name"), role: t("home.testimonial3.role"), quote: t("home.testimonial3.quote"), avatar: "🌟" }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(j => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTJoMnYyaC0yem0wIDRoLTJ2Mmgydi0yem0tMiAyaC0ydjJoMnYtMnptLTItMmgtMnYyaDJ2LTJ6bS0yLTJoLTJ2Mmgydi0yem0tMi0yaC0ydjJoMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              {t("home.cta.title")}
            </h2>
            <p className="text-xl text-white/90 mb-10">
              {t("home.cta.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/vendor/signup">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 shadow-2xl px-8 h-14 text-lg font-bold">
                  {t("home.cta.startFree")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/store">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg">
                  {t("home.cta.browseMarketplace")}
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-white/80 text-sm">
              {t("home.cta.noFees")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  const { t } = useTranslation();
  
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity blur-2xl`}></div>
      
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${color} text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
        {icon}
      </div>
      
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
      
      <div className={`mt-6 inline-flex items-center text-sm font-medium bg-gradient-to-r ${color} bg-clip-text text-transparent group-hover:gap-2 transition-all`}>
        {t("home.learnMore")}
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
