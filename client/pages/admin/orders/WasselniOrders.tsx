import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Clock } from "lucide-react";

export default function WasselniOrders() {
  const wasselniOrders = [
    { id: "WN001", customer: "أحمد محمد", status: "قيد التوصيل", total: "3,500 دج", driver: "كريم العربي" },
    { id: "WN002", customer: "فاطمة الزهراء", status: "تم التسليم", total: "2,800 دج", driver: "يوسف بن علي" },
    { id: "WN003", customer: "محمد الأمين", status: "في الانتظار", total: "4,200 دج", driver: "غير محدد" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "قيد التوصيل": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "تم التسليم": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "في الانتظار": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          واش نوَجَّد ؟
        </h1>
        <p className="text-muted-foreground mt-2">متابعة طلبات التوصيل مع واصلني</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardDescription>قيد التوصيل</CardDescription>
            <CardTitle className="text-xl md:text-2xl text-blue-600">12</CardTitle>
          </CardHeader>
          <CardContent>
            <Truck className="w-8 h-8 text-blue-500/30" />
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20">
          <CardHeader className="pb-3">
            <CardDescription>تم التسليم اليوم</CardDescription>
            <CardTitle className="text-xl md:text-2xl text-green-600">28</CardTitle>
          </CardHeader>
          <CardContent>
            <Package className="w-8 h-8 text-green-500/30" />
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardDescription>في الانتظار</CardDescription>
            <CardTitle className="text-xl md:text-2xl text-yellow-600">5</CardTitle>
          </CardHeader>
          <CardContent>
            <Clock className="w-8 h-8 text-yellow-500/30" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>طلبات واصلني</CardTitle>
          <CardDescription>الطلبات المرتبطة بخدمة التوصيل واصلني</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {wasselniOrders.map((order) => (
              <div key={order.id} className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-primary">#{order.id}</span>
                      <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">العميل: {order.customer}</p>
                    <p className="text-sm text-muted-foreground">السائق: {order.driver}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">{order.total}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
