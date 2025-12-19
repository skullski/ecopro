import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Package, User, Phone, MapPin } from "lucide-react";

export default function AddOrder() {
  return (
    <div className="space-y-3 md:space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          إضافة طلب
        </h1>
        <p className="text-muted-foreground mt-2">إنشاء طلب جديد يدوياً</p>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            معلومات العميل
          </CardTitle>
          <CardDescription>بيانات العميل المطلوبة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">الاسم الكامل</label>
              <Input placeholder="أدخل اسم العميل" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Phone className="w-4 h-4" />
                رقم الهاتف
              </label>
              <Input placeholder="+213 555 123 456" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">الولاية</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option>اختر الولاية</option>
                <option>الجزائر</option>
                <option>وهران</option>
                <option>قسنطينة</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">البلدية</label>
              <Input placeholder="أدخل البلدية" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              العنوان الكامل
            </label>
            <Input placeholder="الشارع، الحي، نقاط مرجعية..." />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              المنتجات
            </div>
            <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
              <Plus className="w-4 h-4 ml-2" />
              إضافة منتج
            </Button>
          </CardTitle>
          <CardDescription>المنتجات المطلوبة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <select className="flex-1 px-3 py-2 border rounded-lg">
                <option>اختر المنتج</option>
                <option>منتج 1</option>
                <option>منتج 2</option>
              </select>
              <Input type="number" placeholder="الكمية" className="w-24" defaultValue="1" />
              <Input type="number" placeholder="السعر" className="w-32" />
              <Button variant="ghost" size="sm" className="text-red-500">حذف</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-500/20">
        <CardHeader>
          <CardTitle>ملخص الطلب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">المجموع الجزئي</span>
            <span className="font-medium">0.00 دج</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">رسوم التوصيل</span>
            <span className="font-medium">0.00 دج</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between py-2">
            <span className="font-bold text-lg">المجموع الكلي</span>
            <span className="font-bold text-lg text-primary">0.00 دج</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1 bg-gradient-to-r from-primary to-accent">
          إنشاء الطلب
        </Button>
        <Button variant="outline" className="flex-1">
          إلغاء
        </Button>
      </div>
    </div>
  );
}
