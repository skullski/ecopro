import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Home, Image, Type } from "lucide-react";

export default function StoreHomepage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          الصفحة الرئيسية
        </h1>
        <p className="text-muted-foreground mt-2">قم بتخصيص محتوى الصفحة الرئيسية لمتجرك</p>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            عنوان البانر الرئيسي
          </CardTitle>
          <CardDescription>النص الرئيسي الذي يظهر في أعلى الصفحة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">العنوان الرئيسي</label>
            <Input placeholder="مثال: مرحباً بك في متجرنا" className="text-lg" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">العنوان الفرعي</label>
            <Input placeholder="مثال: أفضل المنتجات بأفضل الأسعار" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">وصف مختصر</label>
            <Textarea placeholder="اكتب وصفاً مختصراً عن متجرك..." rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-accent" />
            صورة البانر
          </CardTitle>
          <CardDescription>الصورة الرئيسية في الصفحة الرئيسية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-accent/30 rounded-xl p-8 text-center hover:border-accent/50 transition-colors">
            <input type="file" id="banner-upload" className="hidden" accept="image/*" />
            <label htmlFor="banner-upload" className="cursor-pointer">
              <Image className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">انقر لاختيار صورة البانر</p>
              <p className="text-xs text-muted-foreground">الأبعاد الموصى بها: 1920x600 بكسل</p>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-purple-500" />
            أقسام الصفحة الرئيسية
          </CardTitle>
          <CardDescription>تفعيل وترتيب الأقسام المختلفة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "المنتجات المميزة", enabled: true },
            { name: "العروض الخاصة", enabled: true },
            { name: "التصنيفات", enabled: false },
            { name: "آراء العملاء", enabled: true },
            { name: "شركاء النجاح", enabled: false },
          ].map((section, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{section.name}</p>
              <input type="checkbox" className="w-5 h-5" defaultChecked={section.enabled} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1 bg-gradient-to-r from-primary to-accent">
          حفظ التغييرات
        </Button>
        <Button variant="outline" className="flex-1">
          معاينة
        </Button>
      </div>
    </div>
  );
}
