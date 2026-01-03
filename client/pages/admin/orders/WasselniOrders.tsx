import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Clock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function WasselniOrders() {
  const { t } = useTranslation();

  const wasselniOrders = [
    { id: "WN001", customer: "Ahmed Mohammed", status: "inDelivery" as const, total: "3,500 DZD", driver: "Karim Larbi" },
    { id: "WN002", customer: "Fatima Zahra", status: "delivered" as const, total: "2,800 DZD", driver: "Youssef Ben Ali" },
    { id: "WN003", customer: "Mohamed Amine", status: "pending" as const, total: "4,200 DZD", driver: "Not specified" },
  ];

  const getStatusColor = (status: "inDelivery" | "delivered" | "pending") => {
    switch (status) {
      case "inDelivery":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "delivered":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getStatusLabel = (status: "inDelivery" | "delivered" | "pending") => {
    switch (status) {
      case "inDelivery":
        return t("admin.orders.wasselni.inDelivery");
      case "delivered":
        return t("admin.orders.wasselni.deliveredToday");
      case "pending":
        return t("admin.orders.wasselni.pending");
      default:
        return "";
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t("admin.orders.wasselni.title")}
        </h1>
        <p className="text-muted-foreground mt-2">{t("admin.orders.wasselni.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardDescription>{t("admin.orders.wasselni.inDelivery")}</CardDescription>
            <CardTitle className="text-xl md:text-2xl text-blue-600">12</CardTitle>
          </CardHeader>
          <CardContent>
            <Truck className="w-8 h-8 text-blue-500/30" />
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20">
          <CardHeader className="pb-3">
            <CardDescription>{t("admin.orders.wasselni.deliveredToday")}</CardDescription>
            <CardTitle className="text-xl md:text-2xl text-green-600">28</CardTitle>
          </CardHeader>
          <CardContent>
            <Package className="w-8 h-8 text-green-500/30" />
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardDescription>{t("admin.orders.wasselni.pending")}</CardDescription>
            <CardTitle className="text-xl md:text-2xl text-yellow-600">5</CardTitle>
          </CardHeader>
          <CardContent>
            <Clock className="w-8 h-8 text-yellow-500/30" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>{t("admin.orders.wasselni.listTitle")}</CardTitle>
          <CardDescription>{t("admin.orders.wasselni.listDesc")}</CardDescription>
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
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("admin.orders.wasselni.customer")} {order.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("admin.orders.wasselni.driver")} {order.driver}
                    </p>
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
