import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";

const templates = [
  { id: 1, name: "كلاسيكي", color: "from-blue-500 to-purple-500", description: "تصميم أنيق ومحترف" },
  { id: 2, name: "عصري", color: "from-pink-500 to-orange-500", description: "تصميم حديث وجذاب" },
  { id: 3, name: "بسيط", color: "from-green-500 to-teal-500", description: "تصميم نظيف وواضح" },
  { id: 4, name: "داكن", color: "from-gray-700 to-gray-900", description: "وضع داكن أنيق" },
  { id: 5, name: "ملون", color: "from-red-500 via-yellow-500 to-green-500", description: "تصميم نابض بالحياة" },
  { id: 6, name: "احترافي", color: "from-indigo-500 to-blue-500", description: "تصميم للأعمال" },
];

export default function StoreTemplate() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          قالب المتجر
        </h1>
        <p className="text-muted-foreground mt-2">اختر التصميم المناسب لمتجرك</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer group">
            <CardHeader>
              <div className={`h-32 rounded-lg bg-gradient-to-br ${template.color} mb-4 relative overflow-hidden group-hover:scale-105 transition-transform`}>
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Check className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                {template.name}
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-primary to-accent" variant="outline">
                اختيار هذا القالب
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle>تخصيص الألوان</CardTitle>
          <CardDescription>قم بتخصيص ألوان القالب حسب هويتك التجارية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">اللون الأساسي</label>
              <div className="flex gap-2">
                <input type="color" defaultValue="#8b5cf6" className="w-12 h-12 rounded-lg cursor-pointer" />
                <input type="text" defaultValue="#8b5cf6" className="flex-1 px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">اللون الثانوي</label>
              <div className="flex gap-2">
                <input type="color" defaultValue="#06b6d4" className="w-12 h-12 rounded-lg cursor-pointer" />
                <input type="text" defaultValue="#06b6d4" className="flex-1 px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
          <Button className="w-full bg-gradient-to-r from-primary to-accent">
            حفظ التخصيصات
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
