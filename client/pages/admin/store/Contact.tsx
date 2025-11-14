import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MapPin, Globe, Facebook, Instagram } from "lucide-react";

export default function StoreContact() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          معلومات الإتصال
        </h1>
        <p className="text-muted-foreground mt-2">أضف وسائل التواصل مع متجرك</p>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            معلومات الاتصال الأساسية
          </CardTitle>
          <CardDescription>رقم الهاتف والبريد الإلكتروني</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Phone className="w-4 h-4" />
              رقم الهاتف
            </label>
            <Input type="tel" placeholder="+213 555 123 456" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Phone className="w-4 h-4" />
              رقم هاتف إضافي
            </label>
            <Input type="tel" placeholder="+213 555 789 012" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Mail className="w-4 h-4" />
              البريد الإلكتروني
            </label>
            <Input type="email" placeholder="store@example.com" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            العنوان
          </CardTitle>
          <CardDescription>موقع المتجر الفعلي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">المدينة</label>
            <Input placeholder="الجزائر" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">الولاية</label>
            <Input placeholder="الجزائر العاصمة" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">العنوان الكامل</label>
            <Input placeholder="شارع ديدوش مراد، الجزائر" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">رابط خرائط جوجل</label>
            <Input placeholder="https://maps.google.com/..." />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500" />
            وسائل التواصل الاجتماعي
          </CardTitle>
          <CardDescription>روابط حسابات التواصل الاجتماعي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Facebook className="w-4 h-4" />
              فيسبوك
            </label>
            <Input placeholder="https://facebook.com/yourstore" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              إنستغرام
            </label>
            <Input placeholder="https://instagram.com/yourstore" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Globe className="w-4 h-4" />
              تيكتوك
            </label>
            <Input placeholder="https://tiktok.com/@yourstore" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Globe className="w-4 h-4" />
              واتساب للأعمال
            </label>
            <Input placeholder="+213 555 123 456" />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full bg-gradient-to-r from-primary to-accent">
        حفظ المعلومات
      </Button>
    </div>
  );
}
