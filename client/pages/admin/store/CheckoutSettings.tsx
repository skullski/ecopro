import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Settings as SettingsIcon } from "lucide-react";

export default function CheckoutSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          إعدادات استمارة الطلب و سلة التسوّق
        </h1>
        <p className="text-muted-foreground mt-2">قم بتخصيص عملية الطلب والدفع</p>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            إعدادات سلة التسوق
          </CardTitle>
          <CardDescription>خيارات عرض وإدارة سلة التسوق</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">تفعيل سلة التسوق</p>
              <p className="text-sm text-muted-foreground">السماح للعملاء بإضافة منتجات متعددة</p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">حفظ السلة للزوار</p>
              <p className="text-sm text-muted-foreground">الاحتفاظ بالمنتجات عند إعادة الزيارة</p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">عرض توصيات المنتجات</p>
              <p className="text-sm text-muted-foreground">اقتراح منتجات مشابهة في السلة</p>
            </div>
            <input type="checkbox" className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent" />
            إعدادات استمارة الطلب
          </CardTitle>
          <CardDescription>الحقول المطلوبة في استمارة الطلب</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { field: "الاسم الكامل", required: true },
              { field: "رقم الهاتف", required: true },
              { field: "رقم هاتف إضافي", required: false },
              { field: "الولاية", required: true },
              { field: "البلدية", required: true },
              { field: "العنوان الكامل", required: true },
              { field: "ملاحظات الطلب", required: false },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <p className="font-medium">{item.field}</p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked={item.required} />
                    <span>مطلوب</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" defaultChecked />
                    <span>مفعل</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-purple-500" />
            إعدادات إضافية
          </CardTitle>
          <CardDescription>خيارات متقدمة للطلب</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">تفعيل رمز الخصم</p>
              <p className="text-sm text-muted-foreground">السماح باستخدام أكواد الخصم</p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">حد أدنى للطلب</p>
              <p className="text-sm text-muted-foreground">تعيين حد أدنى لقيمة الطلب</p>
            </div>
            <input type="number" className="w-24 px-3 py-2 border rounded-lg" placeholder="0" />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">شحن مجاني بعد</p>
              <p className="text-sm text-muted-foreground">قيمة الطلب للحصول على شحن مجاني</p>
            </div>
            <input type="number" className="w-24 px-3 py-2 border rounded-lg" placeholder="5000" />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full bg-gradient-to-r from-primary to-accent">
        حفظ الإعدادات
      </Button>
    </div>
  );
}
