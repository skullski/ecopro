import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, Image } from "lucide-react";

export default function StoreAbout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          حول المتجر
        </h1>
        <p className="text-muted-foreground mt-2">اكتب معلومات عن متجرك وقصة نجاحك</p>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            نبذة عن المتجر
          </CardTitle>
          <CardDescription>قصة متجرك ورسالتك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">عنوان القسم</label>
            <Input placeholder="مثال: من نحن" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">نبذة مختصرة</label>
            <Textarea
              placeholder="اكتب نبذة مختصرة عن متجرك ورؤيتك..."
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">قصة النجاح الكاملة</label>
            <Textarea
              placeholder="اكتب القصة الكاملة لمتجرك وكيف بدأت..."
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-accent" />
            صورة القسم
          </CardTitle>
          <CardDescription>صورة توضيحية لقسم "حول المتجر"</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-accent/30 rounded-xl p-8 text-center hover:border-accent/50 transition-colors">
            <input type="file" id="about-image" className="hidden" accept="image/*" />
            <label htmlFor="about-image" className="cursor-pointer">
              <Image className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">انقر لاختيار صورة</p>
              <p className="text-xs text-muted-foreground">الأبعاد الموصى بها: 800x600 بكسل</p>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-500/20">
        <CardHeader>
          <CardTitle>قيمنا ومبادئنا</CardTitle>
          <CardDescription>القيم التي يقوم عليها متجرك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["الجودة", "الثقة", "السرعة", "خدمة العملاء"].map((value, idx) => (
            <div key={idx}>
              <label className="text-sm font-medium mb-2 block">{value}</label>
              <Input placeholder={`اكتب عن ${value}...`} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full bg-gradient-to-r from-primary to-accent">
        حفظ المعلومات
      </Button>
    </div>
  );
}
