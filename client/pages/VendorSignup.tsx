import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DarkModeInput } from "@/components/ui/dark-mode-input";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Store, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield
} from "lucide-react";
import type { Vendor } from "@shared/types";
import * as api from "@/lib/api";

export default function VendorSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    description: "",
    city: "",
    country: "",
    honeypot: "",
  });
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Generate URL-friendly store slug from business name
    const storeSlug = formData.businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove duplicate hyphens
      .trim() + `-${Date.now()}`; // Add timestamp for uniqueness
    
    // Create new vendor
    const vendor: Vendor = {
      id: `vendor_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      businessName: formData.businessName,
      storeSlug: storeSlug,
      description: formData.description,
      rating: 0,
      totalSales: 0,
      totalProducts: 0,
      verified: false,
      isVIP: false, // Default to free account
      subscriptionStatus: 'free',
      joinedAt: Date.now(),
      location: {
        city: formData.city,
        country: formData.country,
      },
    };

    try {
  // Save to API (shared across all users). Include honeypot field from form state.
  const payload = { ...vendor, honeypot: (formData as any).honeypot } as any;
  const savedVendor = await api.createVendor(payload);
  // Show success message
  toast({ title: "تم إنشاء المتجر", description: "تم إنشاء حسابك كبائع بنجاح" });
      
      // Also save to localStorage for offline access
      const vendors = JSON.parse(localStorage.getItem("vendors") || "[]");
      vendors.push(savedVendor);
      localStorage.setItem("vendors", JSON.stringify(vendors));
      
      // Set current vendor session
      localStorage.setItem("currentVendor", JSON.stringify(savedVendor));

      // Redirect directly to dashboard so they can start selling
      navigate(`/vendor/${savedVendor.id}/dashboard`);
    } catch (error) {
      console.error("Failed to create vendor:", error);
  // Friendly failure notification
  toast({ title: "خطأ", description: "فشل التسجيل. حاول مرة أخرى.", variant: "destructive" });
    }
  }

  return (
    <section className="relative min-h-screen py-12 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <FloatingShapes variant="section" colors="rainbow" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 mb-4">
              <Store className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">انضم كبائع</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
              ابدأ البيع اليوم
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              انضم إلى آلاف البائعين واعرض منتجاتك لملايين المشترين
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Benefits Section */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-card border-2 border-border shadow-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-accent" />
                  لماذا تبيع معنا؟
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">مجاني تماماً</h3>
                      <p className="text-sm text-muted-foreground">
                        سجل وابدأ البيع بدون أي رسوم اشتراك
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">ملايين المشترين</h3>
                      <p className="text-sm text-muted-foreground">
                        وصول فوري لقاعدة عملاء ضخمة
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">إدارة سهلة</h3>
                      <p className="text-sm text-muted-foreground">
                        لوحة تحكم بسيطة لإدارة منتجاتك وطلباتك
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">دعم متواصل</h3>
                      <p className="text-sm text-muted-foreground">
                        فريق دعم جاهز لمساعدتك على مدار الساعة
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  إحصائيات المنصة
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      10K+
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">بائع نشط</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      500K+
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">منتج</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      2M+
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">زائر شهرياً</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="p-8 rounded-2xl bg-card border-2 border-border shadow-xl">
              <h2 className="text-2xl font-bold mb-6">معلومات التسجيل</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Personal Info */}
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-primary" />
                    الاسم الكامل *
                  </Label>
                  <DarkModeInput
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-primary" />
                    البريد الإلكتروني *
                  </Label>
                  <DarkModeInput
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-primary" />
                    رقم الهاتف *
                  </Label>
                  <DarkModeInput
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+213 555 123 456"
                  />
                </div>

                {/* Business Info */}
                <div className="pt-4 border-t-2 border-border">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-accent" />
                    معلومات المتجر
                  </h3>
                </div>

                <div>
                  <Label htmlFor="businessName" className="flex items-center gap-2 mb-2">
                    <Store className="h-4 w-4 text-primary" />
                    اسم المتجر *
                  </Label>
                  <DarkModeInput
                    id="businessName"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="اسم متجرك التجاري"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="mb-2 block">
                    وصف المتجر
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="أخبر المشترين عن متجرك ومنتجاتك..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      المدينة *
                    </Label>
                    <DarkModeInput
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="مدينتك"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="mb-2 block">
                      البلد *
                    </Label>
                    <DarkModeInput
                      id="country"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="بلدك"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
                >
                  إنشاء حساب بائع
                  <ArrowRight className="h-5 w-5 mr-2" />
                </Button>

                {/* Honeypot hidden field to detect bots (should be empty) */}
                <input
                  type="text"
                  name="honeypot"
                  value={(formData as any).honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <p className="text-sm text-muted-foreground text-center">
                  لديك حساب بالفعل؟{" "}
                  <Link to="/vendor/login" className="text-primary hover:underline font-medium">
                    تسجيل الدخول
                  </Link>
                </p>
              </form>
            </div>
          </div>

          {/* Trust Section */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-500/20">
            <div className="flex items-center justify-center gap-3 text-center">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-bold text-lg">منصة آمنة وموثوقة</h3>
                <p className="text-sm text-muted-foreground">
                  معلوماتك محمية بأعلى معايير الأمان والخصوصية
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
