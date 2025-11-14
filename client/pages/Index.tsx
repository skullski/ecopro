import { Button } from "@/components/ui/button";
import {
  Palette,
  ShoppingCart,
  CreditCard,
  Truck,
  Megaphone,
  BarChart3,
  Link2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { FloatingShapes, FloatingIcons } from "@/components/ui/floating-shapes";

export default function Index() {
  const { t } = useTranslation();

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <FloatingShapes variant="hero" colors="rainbow" />
        <FloatingIcons />
        
        <div className="container mx-auto px-4 py-20 sm:py-32 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 text-sm font-medium backdrop-blur-sm shadow-lg">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("hero.badge")}
              </span>
            </div>
            
            <h1 className="mt-8 text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-transparent">
                {t("hero.title")}
              </span>
            </h1>
            
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero.desc")}
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="#مزايا">
                <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all group">
                  <Zap className="w-5 h-5 ml-2 group-hover:animate-bounce" />
                  {t("cta.features")}
                </Button>
              </a>
              <a href="#الأسعار">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:scale-105 transition-all">
                  {t("cta.pricing")}
                </Button>
              </a>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">1000+</div>
                <div className="text-sm text-muted-foreground mt-1">متاجر نشطة</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">50K+</div>
                <div className="text-sm text-muted-foreground mt-1">منتج مُباع</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">99%</div>
                <div className="text-sm text-muted-foreground mt-1">رضا العملاء</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Features */}
      <section id="مزايا" className="container mx-auto px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("features.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("features.desc")}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<Palette className="text-primary" />} title="قوالب وتصميم مرن" desc="اختر ��ن قوالب حديثة قابلة للتعديل بالكامل مع دعم كامل للهواتف." />
          <Feature icon={<ShoppingCart className="text-primary" />} title="إدارة المنتجات والطلبات" desc="لوحة تحكم بديهية لإضافة المنتجات ومتابعة الطلبات والمخزون." />
          <Feature icon={<CreditCard className="text-primary" />} title="مدفوعات آمنة" desc="تكامل مع بوابات دفع موثوقة ودعم عملات متعددة." />
          <Feature icon={<Truck className="text-primary" />} title="الشحن وتتبع الطلبات" desc="إدارة شركات الشحن وتتبع الشحنات تلقائيًا لعملائك." />
          <Feature icon={<Megaphone className="text-primary" />} title="التسويق والأتمتة" desc="كوبونات، رسائل بريدية، حملات إعلانية وربط منصات التواصل." />
          <Feature icon={<BarChart3 className="text-primary" />} title="تقارير وتحليلات" desc="لوحات تقارير فورية لقياس الأداء والمبيعات ونِسب التحويل." />
        </div>
      </section>

      {/* Architecture */}
      <section id="البنية" className="container mx-auto px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("architecture.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("features.desc")}</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-5">
          <Arch title="واجهة المتجر" desc="واجهة سريعة الاستجابة وقابلة للتخصيص بتجربة شراء سلسة." />
          <Arch title="لوحة التحكم" desc="إدارة مركزية للمحتوى والطلبات والعملاء والمنتجات." />
          <Arch title="واجهات API" desc="تكاملات موثوقة عبر REST/Webhooks لربط الخدمات الخارجية." />
          <Arch title="التكاملات" desc="بوابات دفع، شركات شحن، أدوات تحليلات وتسويق." />
          <Arch title="البيانات" desc="تخزين آمن ونسخ احتياطي وتشفير لحماية معلوماتك." />
        </div>
        <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-3 text-sm text-muted-foreground">
          <Link2 className="h-4 w-4 inline-block" />
          <span>كل الو��دات تعمل بتناغم لرحلة عميل مثالية من الاكتشاف حتى الدفع.</span>
        </div>
      </section>

      {/* Pricing */}
      <section id="الأسعار" className="container mx-auto px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("pricing.title")}</h2>
          <p className="mt-3 text-muted-foreground">ابدأ مجانًا ثم اختر الخطة التي تناسب نمو متجرك.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          <Plan
            name="مجاني"
            price="0"
            features={[
              "قالب أساسي",
              "حتى 50 منتجًا",
              "تقارير مختصرة",
            ]}
            cta="جرّب الآن"
          />
          <Plan
            highlight
            name="احترافي"
            price="29"
            features={[
              "كل الميزات الأساسية",
              "قوالب مميزة",
              "خصومات وأكواد",
              "تكاملات دفع وشحن متقدمة",
              "تقارير وتحليل��ت كاملة",
            ]}
            cta="ابدأ مجانًا"
          />
        </div>
        <div className="mt-10 text-center text-sm text-muted-foreground">
          لا توجد رسوم خفية. يمكنك الترقية أو الإلغاء في أي وقت.
        </div>
      </section>

      {/* FAQ (short) */}
      <section id="الأسئلة" className="container mx-auto px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <h3 className="text-2xl font-bold">{t("faq.title")}</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Faq q="هل أحتاج لتنصيب برامج؟" a="لا. walidstore يعمل بالكامل كسحابة SaaS من المتصفح فقط." />
            <Faq q="هل يدعم اللغة العربية؟" a="نعم، المنصة تدعم العربية بشكل كامل مع اتجاه RTL." />
            <Faq q="هل أستطيع ربط بوابة الدفع الخاصة بي؟" a="بالطبع، ندعم أشهر بوابات الدفع والتكامل عبر API." />
            <Faq q="هل هناك باقة مؤسسات؟" a="نعم، تواصل معنا لخطط مخصصة حسب احتياجك." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_400px_at_50%_-10%,hsl(var(--primary)/0.25),transparent)]" />
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 text-center shadow-sm">
            <h3 className="text-2xl font-extrabold tracking-tight">ابدأ رحلتك اليوم مع walidstore</h3>
            <p className="mt-2 text-muted-foreground">أنشئ متجرًا احترافيًا خلال دقائق، وابدأ البيع بثقة.</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <a href="/app">
                <Button className="px-6">{t("cta.start")}</Button>
              </a>
              <a href="#مزايا">
                <Button variant="outline" className="px-6">{t("cta.features")}</Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary/15">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold leading-6">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, gradient, iconBg }: { icon: React.ReactNode; title: string; desc: string; gradient: string; iconBg: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-transparent hover:border-primary/20 bg-card p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
      
      {/* Decorative corner */}
      <div className={`absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full`}></div>
      
      <div className="relative z-10">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${iconBg} mb-6 group-hover:scale-110 transition-transform`}>
          <div className={`bg-gradient-to-br ${gradient} bg-clip-text text-transparent text-3xl`}>
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold leading-7 mb-3">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Arch({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 text-center shadow-sm">
      <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-primary/70" />
      <h4 className="font-bold">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Plan({ name, price, features, cta, highlight }: { name: string; price: string; features: string[]; cta: string; highlight?: boolean }) {
  return (
    <div className={`relative rounded-2xl border bg-card p-6 shadow-sm ${highlight ? "ring-2 ring-primary" : ""}`}>
      {highlight && (
        <span className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">الأكثر شعبية</span>
      )}
      <div className="flex items-baseline justify-between">
        <h4 className="text-xl font-bold">{name}</h4>
        <div className="text-3xl font-extrabold">${price}<span className="text-sm font-medium text-muted-foreground">/شهريًا</span></div>
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-1 h-3 w-3 rounded-full bg-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <a href="/app">
          <Button className="w-full">{cta}</Button>
        </a>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h4 className="font-bold">{q}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{a}</p>
    </div>
  );
}
