import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Package } from "lucide-react";

export default function FlexScan() {
  return (
    <div className="space-y-3 md:space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Flex Scan
        </h1>
        <p className="text-muted-foreground mt-2">تحليل ذكي للطلبات والمبيعات</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardDescription>معدل نجاح الطلبات</CardDescription>
            <CardTitle className="text-xl md:text-2xl text-blue-600">87%</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingUp className="w-8 h-8 text-blue-500/30" />
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20">
          <CardHeader className="pb-3">
            <CardDescription>متوسط قيمة الطلب</CardDescription>
            <CardTitle className="text-2xl text-green-600">3,420 دج</CardTitle>
          </CardHeader>
          <CardContent>
            <Package className="w-8 h-8 text-green-500/30" />
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardDescription>أوقات الذروة</CardDescription>
            <CardTitle className="text-2xl text-purple-600">14:00-17:00</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart3 className="w-8 h-8 text-purple-500/30" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>تحليل الأداء</CardTitle>
          <CardDescription>إحصائيات متقدمة عن أداء متجرك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-500/5 to-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">معدل إلغاء الطلبات</span>
                <span className="font-bold text-blue-600">8.5%</span>
              </div>
              <div className="w-full bg-blue-500/20 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '8.5%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-500/5 to-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">معدل إعادة الطلب</span>
                <span className="font-bold text-green-600">34%</span>
              </div>
              <div className="w-full bg-green-500/20 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '34%' }}></div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-500/5 to-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">رضا العملاء</span>
                <span className="font-bold text-purple-600">92%</span>
              </div>
              <div className="w-full bg-purple-500/20 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle>توصيات الذكاء الاصطناعي</CardTitle>
          <CardDescription>نصائح لتحسين الأداء</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">⚡ زيادة المخزون</p>
              <p className="text-sm text-muted-foreground">المنتج "سماعات لاسلكية" مطلوب بكثرة. فكر في زيادة المخزون.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">📈 وقت ذروة الطلبات</p>
              <p className="text-sm text-muted-foreground">أغلب الطلبات بين 14:00-17:00. خصص موارد إضافية في هذا الوقت.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium mb-1">🎯 استهداف العملاء</p>
              <p className="text-sm text-muted-foreground">34% من عملائك يعيدون الطلب. قدم لهم عروض خاصة.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
