import { TrendingUp, DollarSign, ShoppingCart, Users, BarChart3, ArrowUpRight } from "lucide-react";

export default function Analytics() {
  const orders = JSON.parse(localStorage.getItem("orders")||"[]");
  const revenue = orders.reduce((s:any,o:any)=>s + (o.total||0), 0);
  const totalOrders = orders.length;
  const confirmedOrders = orders.filter((o:any) => o.status === 'confirmed').length;
  const conversionRate = totalOrders ? Math.round((confirmedOrders / totalOrders) * 100) : 0;
  
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          التحليلات
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="group rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 p-6 hover:shadow-xl hover:shadow-primary/20 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/20 group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-sm font-bold">
              <ArrowUpRight className="h-4 w-4" />
              +12%
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-1">إجمالي الطلبات</div>
          <div className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {totalOrders}
          </div>
        </div>

        <div className="group rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/20 to-accent/5 p-6 hover:shadow-xl hover:shadow-accent/20 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-accent/20 group-hover:scale-110 transition-transform">
              <DollarSign className="h-6 w-6 text-accent" />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-sm font-bold">
              <ArrowUpRight className="h-4 w-4" />
              +23%
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-1">إجمالي العائد</div>
          <div className="text-3xl font-extrabold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
            ${revenue}
          </div>
        </div>

        <div className="group rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-purple-500/5 p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-sm font-bold">
              <ArrowUpRight className="h-4 w-4" />
              +8%
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-1">معدّل التحويل</div>
          <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {conversionRate}%
          </div>
        </div>

        <div className="group rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-orange-500/5 p-6 hover:shadow-xl hover:shadow-orange-500/20 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-500/20 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-sm font-bold">
              <ArrowUpRight className="h-4 w-4" />
              +15%
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-1">العملاء النشطون</div>
          <div className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            {Math.floor(totalOrders * 0.7)}
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            رسم بياني للمبيعات
          </h3>
          <div className="h-64 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border-2 border-dashed border-primary/20">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">سيتم إضافة الرسم البياني قريباً</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-accent/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            ملخص الأداء
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <span className="font-medium">الطلبات المؤكدة</span>
              <span className="text-xl font-bold text-green-500">{confirmedOrders}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
              <span className="font-medium">قيد الانتظار</span>
              <span className="text-xl font-bold text-yellow-500">
                {orders.filter((o:any) => o.status === 'pending').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20">
              <span className="font-medium">الملغاة</span>
              <span className="text-xl font-bold text-red-500">
                {orders.filter((o:any) => o.status === 'failed').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20">
              <span className="font-medium">متوسط قيمة الطلب</span>
              <span className="text-xl font-bold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                ${totalOrders ? Math.round(revenue / totalOrders) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">📊</div>
          <h3 className="text-lg font-bold">ملاحظات</h3>
        </div>
        <p className="text-muted-foreground">
          هذه بيانات تجريبية. سيتم ربط تحليلات حقيقية بعد توصيل خدمات التحليلات.
          جميع الإحصائيات والرسوم البيانية ستكون مباشرة ومحدثة في الوقت الفعلي.
        </p>
      </div>
    </div>
  );
}
