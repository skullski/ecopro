import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  ExternalLink, 
  Eye, 
  Package,
  TrendingUp,
  Copy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Vendor } from "@shared/types";

export default function StorePreview() {
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get current logged-in vendor
    const vendorData = localStorage.getItem("currentVendor");
    if (vendorData) {
      setCurrentVendor(JSON.parse(vendorData));
    }
  }, []);

  const copyStoreLink = () => {
    if (currentVendor) {
      const storeUrl = `${window.location.origin}/store/${currentVendor.storeSlug}`;
      navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!currentVendor) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">لم يتم العثور على متجر</h2>
          <p className="text-muted-foreground mb-6">
            يجب أن تكون مسجلاً كبائع لرؤية متجرك
          </p>
          <Link to="/vendor/signup">
            <Button>سجل كبائع</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const storeUrl = `${window.location.origin}/store/${currentVendor.storeSlug}`;
  const marketplaceUrl = `${window.location.origin}/store`;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Store className="h-8 w-8 text-primary" />
          معاينة المتجر
        </h1>
        <p className="text-muted-foreground">
          شاهد كيف يبدو متجرك للزوار
        </p>
      </div>

      {/* Store Info Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{currentVendor.businessName}</h2>
            <p className="text-muted-foreground">{currentVendor.description}</p>
              <div className="flex gap-2 mt-3">
              {currentVendor.verified && (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  ✓ موثق
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">عدد المنتجات</div>
            <div className="text-3xl font-bold text-primary">{currentVendor.totalProducts}</div>
          </div>
        </div>

        {/* Store URLs */}
        <div className="space-y-4">
          {/* Personal Store Link */}
          <div className="p-4 rounded-lg bg-muted/50 border-2 border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <span className="font-semibold">رابط متجرك الخاص</span>
              </div>
              <Badge variant="outline">
                <Package className="h-3 w-3 mr-1" />
                جميع منتجاتك
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <code className="flex-1 px-3 py-2 bg-background rounded text-sm">
                {storeUrl}
              </code>
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyStoreLink}
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              هذا الرابط يعرض جميع منتجاتك (المصدرة والخاصة)
            </p>
            <div className="flex gap-2">
              <Link to={`/store/${currentVendor.storeSlug}`} target="_blank">
                <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white">
                  <Eye className="h-4 w-4 mr-2" />
                  معاينة متجرك
                </Button>
              </Link>
              <Link to={`/vendor/${currentVendor.id}/dashboard`}>
                <Button size="sm" variant="outline">
                  <Package className="h-4 w-4 mr-2" />
                  إدارة المنتجات
                </Button>
              </Link>
            </div>
          </div>

          {/* Marketplace Link */}
          <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-semibold">السوق الكبير</span>
              </div>
              <Badge className="bg-primary/10 text-primary">
                <ExternalLink className="h-3 w-3 mr-1" />
                المنتجات المصدرة فقط
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <code className="flex-1 px-3 py-2 bg-background rounded text-sm">
                {marketplaceUrl}
              </code>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              تظهر هنا فقط المنتجات التي قمت بتصديرها للسوق الكبير
            </p>
            <Link to="/store" target="_blank">
                <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                معاينة المتجر العام
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">التقييم</div>
          <div className="text-2xl font-bold">⭐ {currentVendor.rating.toFixed(1)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">إجمالي المبيعات</div>
          <div className="text-2xl font-bold text-green-500">{currentVendor.totalSales}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">المنتجات</div>
          <div className="text-2xl font-bold text-primary">{currentVendor.totalProducts}</div>
        </Card>
      </div>

      {/* Tips */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          نصائح لزيادة المبيعات
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>شارك رابط متجرك الخاص على وسائل التواصل الاجتماعي</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>صدّر منتجاتك المميزة للسوق الكبير لزيادة الوصول</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>أضف صور واضحة ووصف تفصيلي لكل منتج</span>
          </li>
          {/* VIP removed - platform is 100% free */}
        </ul>
      </Card>
    </div>
  );
}
