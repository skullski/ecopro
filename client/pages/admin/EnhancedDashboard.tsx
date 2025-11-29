import { Clock, Download, Eye, ShoppingCart, Tag, DollarSign, Check, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function EnhancedDashboard() {
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 22,
    minutes: 36,
    seconds: 32
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    { 
      title: "الزيارات", 
      value: "1", 
      icon: <Eye className="w-6 h-6" />, 
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-500/20",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      title: "الأرباح", 
      value: "0 دج", 
      icon: <DollarSign className="w-6 h-6" />, 
      gradient: "from-green-500 to-emerald-500",
      iconBg: "bg-green-500/20",
      textColor: "text-green-600 dark:text-green-400"
    },
    { 
      title: "المنتجات المتاحة", 
      value: "0", 
      icon: <Tag className="w-6 h-6" />, 
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-500/20",
      textColor: "text-purple-600 dark:text-purple-400"
    },
    { 
      title: "الطلبات الجديدة", 
      value: "0", 
      icon: <ShoppingCart className="w-6 h-6" />, 
      gradient: "from-orange-500 to-red-500",
      iconBg: "bg-orange-500/20",
      textColor: "text-orange-600 dark:text-orange-400"
    },
  ];

  const quickStats = [
    { label: "الطلبات", value: "15 / 0", status: "success" },
    { label: "البيكسلات", value: "1 / 0", status: "success" },
    { label: "كاتالوغات الإعلانات", value: "0 / 0", status: "error" },
    { label: "دومينات مخصصة", value: "0 / 0", status: "error" },
    { label: "غُشّال المتجر", value: "1 / 1", status: "error" },
  ];

  const setupSteps = [
    { title: "أضف شعار المتجر", completed: true },
    { title: "أضف منتجات", completed: false },
    { title: "حدد أسعار وولايات التوصيل", completed: false },
    { title: "اربط حسابك على Telegram لتلقي إشعارات الطلبات الجديدة", completed: false },
    { title: "أضف وسائل الاتصال لزبائنك", completed: false },
  ];

  const completedSteps = setupSteps.filter(s => s.completed).length;
  const totalSteps = setupSteps.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Unique diagonal split design */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background via-primary/5 to-accent/10 border-2 border-primary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(var(--primary),0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(var(--accent),0.1),transparent_50%)]"></div>
        
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium">متصل الآن</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-l from-primary via-accent to-purple-600 bg-clip-text text-transparent">
                  أهلاً وسهلاً، Walid
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">جاهز لتحقيق مبيعات اليوم؟</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg">
                <Tag className="w-4 h-4 ml-2" />
                إضافة منتج جديد
              </Button>
              <Button variant="outline" className="border-2">
                <Eye className="w-4 h-4 ml-2" />
                معاينة المتجر
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Unique card design with diagonal accent */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div 
            key={idx}
            className="group relative overflow-hidden rounded-2xl bg-card border-2 border-border hover:border-primary/50 transition-all duration-300"
          >
            {/* Diagonal accent line */}
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.gradient}`}></div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                  <div className={stat.textColor}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  اليوم
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.title}
                </div>
                <div className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Subscription & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Card */}
          <div className="relative rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8 text-center overflow-hidden shadow-lg">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-purple-500/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4">
                <span className="text-2xl">⏰</span>
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">فترة تجريبية</span>
              </div>
              <h3 className="font-bold text-xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">إستهلاكك الإشتراك</h3>
            <p className="text-sm text-muted-foreground mb-6">
              الشهر الحالي: 06 نوفمبر 2025 15:52 - 08 نوفمبر 2025 15:52
            </p>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-xl p-4 min-w-[80px]">
                    <div className="text-3xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
                    <div className="text-xs font-medium mt-1">يوم</div>
                  </div>
                </div>
                <span className="text-3xl font-bold text-muted-foreground">:</span>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl p-4 min-w-[80px]">
                    <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-xs font-medium mt-1">ساعة</div>
                  </div>
                </div>
                <span className="text-3xl font-bold text-muted-foreground">:</span>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-4 min-w-[80px]">
                    <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-xs font-medium mt-1">دقيقة</div>
                  </div>
                </div>
                <span className="text-3xl font-bold text-muted-foreground">:</span>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl p-4 min-w-[80px]">
                    <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-xs font-medium mt-1">ثانية</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-red-500 font-medium mb-6 flex items-center justify-center gap-2">
              <span className="text-xl">⚠️</span>
              الفترة التجريبية المجانية الخاصة بك تنتهي بعد:
            </p>

            <Button size="lg" className="w-full max-w-md bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all">
              <span className="text-lg">✨</span>
              اخبر اشتراكك الآن
            </Button>
            </div>

            {/* Details Link */}
            <button className="flex items-center justify-center gap-2 w-full mt-4 text-sm text-primary hover:underline">
              <ChevronLeft className="w-4 h-4" />
              الإطلاع على التفاصيل
            </button>
          </div>

          {/* Overview Stats */}
          <div>
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              نظرة عامة
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="group relative rounded-2xl bg-card border-2 border-transparent hover:border-primary/20 p-6 text-center overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${stat.iconBg} mb-3 ${stat.textColor} group-hover:scale-110 transition-transform`}>
                      {stat.icon}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">{stat.title}</div>
                    <div className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</div>
                  </div>
                  
                  {/* Decorative corner */}
                  <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-full`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl border-2 border-primary/10 bg-gradient-to-br from-card to-primary/5 p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">📈</span>
              إحصائيات سريعة
            </h3>
            <div className="space-y-2">
              {quickStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-4 rounded-xl bg-background/50 hover:bg-background transition-colors">
                  <div className="flex items-center gap-3">
                    {stat.status === "success" ? (
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                        <span className="text-red-500 font-bold">—</span>
                      </div>
                    )}
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                  <span className="font-bold text-lg">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Setup & App */}
        <div className="space-y-6">
          {/* Setup Checklist */}
          <div className="rounded-2xl border-2 border-accent/20 bg-gradient-to-br from-card to-accent/5 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="text-xl">✅</span>
                أكمل تحضير متجرك
              </h3>
              <div className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold">
                {completedSteps}/{totalSteps}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mb-4 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent to-green-500 transition-all duration-500"
                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              ></div>
            </div>
            
            <div className="space-y-2">
              {setupSteps.map((step, index) => (
                <div key={index} className={`flex items-start gap-3 p-4 rounded-xl transition-all ${
                  step.completed 
                    ? 'bg-green-500/10 border-2 border-green-500/20' 
                    : 'bg-background/50 border-2 border-transparent hover:border-primary/20'
                }`}>
                  <button className="mt-0.5 hover:scale-110 transition-transform">
                    <ChevronLeft className="w-5 h-5 text-primary" />
                  </button>
                  <div className="flex-1 text-right">
                    <div className={`text-sm font-medium ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {step.title}
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    step.completed 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/50' 
                      : 'bg-muted border-2 border-muted-foreground/20'
                  }`}>
                    {step.completed && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* App Promotion */}
          <div className="relative rounded-2xl border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 p-8 text-center overflow-hidden shadow-xl">
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="text-4xl mb-3 animate-bounce">📱</div>
              <h3 className="font-bold text-lg mb-3 flex items-center justify-center gap-2">
                <span className="text-xl">🚀</span>
                تطبيقاتنا
              </h3>
              <div className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                CALL VERIFICATION
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
                <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SCAN APP
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                امسح وتتبع منتجاتك بسهولة
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all group">
                <Download className="w-4 h-4 ml-2 group-hover:animate-bounce" />
                حمّل التطبيق الآن
              </Button>
              
              {/* App features */}
              <div className="mt-6 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span>متوفر على Android و iOS</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>مجاني 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
