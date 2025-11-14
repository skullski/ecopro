import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import {
  Check,
  Crown,
  Store,
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  Users,
  Globe,
  Package,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const VIP_FEATURES = [
  { icon: Store, title: "متجرك الخاص", description: "صفحة متجر مخصصة برابط فريد" },
  { icon: TrendingUp, title: "تصدير للسوق الكبير", description: "اعرض منتجاتك لآلاف الزوار" },
  { icon: BarChart3, title: "لوحة تحكم متقدمة", description: "إحصائيات مبيعات وتحليلات شاملة" },
  { icon: Shield, title: "شارة التحقق", description: "شارة VIP تزيد ثقة المشترين" },
  { icon: Package, title: "منتجات غير محدودة", description: "أضف عدد غير محدود من المنتجات" },
  { icon: Users, title: "دعم أولوية", description: "دعم فني سريع على مدار الساعة" },
  { icon: Globe, title: "أدوات التسويق", description: "أدوات ترويجية متقدمة" },
  { icon: Sparkles, title: "منتجات مميزة", description: "إبراز منتجاتك في الصفحة الرئيسية" },
];

const PRICING_PLANS = [
  {
    name: "شهري",
    price: "29",
    duration: "شهر",
    badge: "الأكثر مرونة",
    popular: false,
  },
  {
    name: "ربع سنوي",
    price: "69",
    originalPrice: "87",
    duration: "3 أشهر",
    badge: "وفر 20%",
    popular: true,
  },
  {
    name: "سنوي",
    price: "199",
    originalPrice: "348",
    duration: "سنة",
    badge: "أفضل قيمة - وفر 43%",
    popular: false,
  },
];

export default function VendorUpgrade() {
  // Check if user is logged in as vendor
  const currentVendor = JSON.parse(localStorage.getItem("currentVendor") || "null");

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      <FloatingShapes variant="section" colors="rainbow" />

      {/* Hero Section */}
      <div className="relative z-10 bg-gradient-to-br from-primary via-accent to-orange-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-white/20 text-white border-white/30 mb-4 text-lg px-6 py-2">
            <Crown className="h-5 w-5 mr-2" />
            ترقية VIP
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg">
            حول شغفك إلى مشروع
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            انضم إلى نخبة البائعين واحصل على متجرك الخاص مع أدوات احترافية للنجاح
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8 py-6 shadow-2xl"
            >
              <Crown className="h-6 w-6 mr-2" />
              ابدأ الآن - 7 أيام تجربة مجانية
            </Button>
            {currentVendor && (
              <Link to={`/vendor/${currentVendor.id}/dashboard`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                >
                  <Package className="h-6 w-6 mr-2" />
                  تخطي - اذهب للوحة التحكم
                </Button>
              </Link>
            )}
            {!currentVendor && (
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                شاهد عرض توضيحي
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4">
            لماذا <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">VIP</span>؟
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12">
            كل ما تحتاجه لإطلاق وتنمية متجرك الإلكتروني
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VIP_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className="p-6 hover:shadow-xl transition-all hover:-translate-y-1 border-2"
                >
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4">
            اختر خطتك المناسبة
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12">
            جميع الخطط تشمل جميع الميزات - اختر المدة التي تناسبك
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan, idx) => (
              <Card
                key={idx}
                className={`p-8 relative ${
                  plan.popular
                    ? "border-4 border-primary shadow-2xl scale-105"
                    : "border-2"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white px-4 py-1">
                    الأكثر شعبية
                  </Badge>
                )}
                <div className="text-center mb-6">
                  <Badge variant="outline" className="mb-4">
                    {plan.badge}
                  </Badge>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {plan.originalPrice && (
                      <span className="text-2xl text-muted-foreground line-through">
                        ${plan.originalPrice}
                      </span>
                    )}
                    <div>
                      <span className="text-5xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ${plan.price}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">/ {plan.duration}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {VIP_FEATURES.slice(0, 5).map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature.title}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">وجميع الميزات الأخرى</span>
                  </li>
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                      : ""
                  }`}
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.popular && <Zap className="h-5 w-5 mr-2" />}
                  ابدأ الآن
                  <ArrowRight className="h-5 w-5 mr-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison: Free vs VIP */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">
            مقارنة الحسابات
          </h2>
          <Card className="overflow-hidden">
            <div className="grid grid-cols-3 bg-gradient-to-r from-primary/10 to-accent/10 p-4 font-bold">
              <div>الميزة</div>
              <div className="text-center">زائر عادي</div>
              <div className="text-center">
                <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                  <Crown className="h-4 w-4 mr-1" />
                  VIP
                </Badge>
              </div>
            </div>
            {[
              { feature: "التصفح والشراء", free: true, vip: true },
              { feature: "بيع المنتجات", free: false, vip: true },
              { feature: "متجر خاص", free: false, vip: true },
              { feature: "لوحة تحكم", free: false, vip: true },
              { feature: "تصدير للسوق الكبير", free: false, vip: true },
              { feature: "شارة التحقق", free: false, vip: true },
              { feature: "إحصائيات متقدمة", free: false, vip: true },
              { feature: "دعم أولوية", free: false, vip: true },
            ].map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 p-4 border-t items-center"
              >
                <div className="text-sm">{row.feature}</div>
                <div className="text-center">
                  {row.free ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground text-2xl">—</span>
                  )}
                </div>
                <div className="text-center">
                  {row.vip && (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-orange-500/10 border-2 border-primary/20">
          <Crown className="h-20 w-20 mx-auto mb-6 text-primary" />
          <h2 className="text-4xl font-bold mb-4">
            جاهز لبدء رحلتك؟
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            انضم إلى مئات البائعين الناجحين اليوم
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent text-white text-lg px-10 py-6 shadow-xl"
            >
              <Crown className="h-6 w-6 mr-2" />
              ترقية لـ VIP الآن
            </Button>
            <Link to="/store">
              <Button size="lg" variant="outline" className="text-lg px-10 py-6">
                تصفح المتجر
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            تجربة مجانية لمدة 7 أيام • إلغاء في أي وقت • بدون بطاقة ائتمان
          </p>
        </div>
      </div>
    </section>
  );
}
