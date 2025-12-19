import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, XCircle, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AbandonedOrders() {
  const abandonedOrders = [
    { id: "AB001", customer: "علي بن صالح", phone: "+213 555 111 222", items: 3, total: "5,600 دج", time: "منذ 2 ساعة" },
    { id: "AB002", customer: "سارة أحمد", phone: "+213 555 333 444", items: 1, total: "2,100 دج", time: "منذ 5 ساعات" },
    { id: "AB003", customer: "خالد محمود", phone: "+213 555 555 666", items: 2, total: "3,800 دج", time: "منذ يوم واحد" },
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          الطلبات المتروكة
        </h1>
        <p className="text-muted-foreground mt-2">الطلبات التي لم تكتمل من قبل العملاء</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-orange-500/20">
          <CardHeader className="pb-3">
            <CardDescription>طلبات متروكة اليوم</CardDescription>
            <CardTitle className="text-xl md:text-2xl text-orange-600">8</CardTitle>
          </CardHeader>
          <CardContent>
            <XCircle className="w-8 h-8 text-orange-500/30" />
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/20">
          <CardHeader className="pb-3">
            <CardDescription>قيمة الطلبات المتروكة</CardDescription>
            <CardTitle className="text-2xl text-red-600">45,200 دج</CardTitle>
          </CardHeader>
          <CardContent>
            <ShoppingCart className="w-8 h-8 text-red-500/30" />
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardDescription>معدل الاسترجاع</CardDescription>
            <CardTitle className="text-xl md:text-2xl text-yellow-600">23%</CardTitle>
          </CardHeader>
          <CardContent>
            <Clock className="w-8 h-8 text-yellow-500/30" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>قائمة الطلبات المتروكة</CardTitle>
          <CardDescription>تواصل مع العملاء لإكمال الطلبات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {abandonedOrders.map((order) => (
              <div key={order.id} className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-primary">#{order.id}</span>
                      <span className="text-xs px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
                        متروك
                      </span>
                    </div>
                    <p className="text-sm mb-1">العميل: {order.customer}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {order.phone}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{order.time}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">{order.items} منتج</p>
                    <p className="font-bold text-lg">{order.total}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                      <Phone className="w-4 h-4 ml-2" />
                      اتصال
                    </Button>
                    <Button size="sm" variant="outline">
                      عرض
                    </Button>
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
