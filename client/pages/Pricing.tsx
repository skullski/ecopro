import { Button } from "@/components/ui/button";
import { Check, Zap, Rocket, Gift, MessageCircle, Store, Package, BarChart3, Users, Palette, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

export default function Pricing() {
  const { t } = useTranslation();
  
  const features = [
    { icon: Package, text: 'منتجات غير محدودة' },
    { icon: Store, text: 'متجر مخصص' },
    { icon: Palette, text: '12 قالب احترافي' },
    { icon: BarChart3, text: 'لوحة تحليلات' },
    { icon: MessageCircle, text: 'بوت واتساب، تيليغرام، فايبر' },
    { icon: Users, text: 'إدارة الموظفين' },
    { icon: Shield, text: 'إدارة الطلبات' },
    { icon: Check, text: 'بدون عمولات' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center">
      <section className="relative py-8 sm:py-10 w-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bS0yIDJoLTJ2Mmgydi0yek0zMiAzOGgtMnYyaDJ2LTJ6bS0yLTJoLTJ2Mmgydi0yek0yOCAzNGgtMnYyaDJ2LTJ6bS02IDB2LTJoLTJ2Mmgyem0tMiAydi0ySDR2Mmgyem0tMiAydi0ySDR2MmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-sm mb-3">
              <Gift className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">30 يوم تجربة مجانية</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold mb-1.5">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                أسعار بسيطة وشفافة
              </span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              بدون رسوم مخفية. بدون عمولات. احتفظ بـ 100% من أرباحك.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-indigo-100 dark:border-indigo-900 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-cyan-600 to-purple-600"></div>
              
              {/* Free Trial Badge */}
              <div className="absolute top-3 right-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                  30 يوم مجاناً
                </div>
              </div>
              
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold">الخطة الاحترافية</h2>
                    <p className="text-xs text-gray-500">كل ما تحتاجه لإدارة متجرك</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                      2,500 دج
                    </div>
                    <div className="text-xs text-gray-500">
                      أو <span className="font-semibold text-indigo-600">$10</span> / شهرياً
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/50 dark:to-cyan-900/50 flex items-center justify-center">
                        <feature.icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link to="/signup">
                  <Button size="default" className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow h-10 text-sm font-bold">
                    <Rocket className="w-4 h-4 mr-2" />
                    ابدأ تجربتك المجانية
                  </Button>
                </Link>
                
                <p className="text-center text-xs text-gray-500 mt-2">
                  لا يلزم بطاقة ائتمان للتجربة
                </p>
              </div>
            </div>
          </div>

          {/* No Commission Banner */}
          <div className="mt-5 max-w-2xl mx-auto">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 border border-green-200 dark:border-green-800 text-center">
              <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">
                <Shield className="w-3.5 h-3.5 inline-block mr-1.5 mb-0.5" />
                بدون عمولات على المبيعات - احتفظ بـ 100% من أرباحك
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center mt-5">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              هل لديك أسئلة؟{" "}
              <Link to="/contact" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
                تواصل معنا
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
