import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export default function StoreLogo() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          شعار المتجر
        </h1>
        <p className="text-muted-foreground mt-2">قم برفع وإدارة شعار متجرك</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              رفع الشعار
            </CardTitle>
            <CardDescription>اختر صورة شعار متجرك (PNG, JPG, SVG)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="logo-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-2">انقر لاختيار صورة</p>
                <p className="text-xs text-muted-foreground">الحد الأقصى: 5 ميجابايت</p>
              </label>
            </div>

            <Button className="w-full bg-gradient-to-r from-primary to-accent">
              حفظ الشعار
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-accent" />
              معاينة الشعار
            </CardTitle>
            <CardDescription>كيف سيظهر شعارك في المتجر</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-12 flex items-center justify-center min-h-[200px] border border-primary/10">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-[200px] object-contain" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">لم يتم رفع شعار بعد</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-purple-500/20">
        <CardHeader>
          <CardTitle>إعدادات إضافية</CardTitle>
          <CardDescription>خيارات عرض الشعار</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">عرض الشعار في الهيدر</p>
              <p className="text-sm text-muted-foreground">إظهار الشعار في أعلى الصفحة</p>
            </div>
            <input type="checkbox" className="w-5 h-5" defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">عرض الشعار في الفوتر</p>
              <p className="text-sm text-muted-foreground">إظهار الشعار في أسفل الصفحة</p>
            </div>
            <input type="checkbox" className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
