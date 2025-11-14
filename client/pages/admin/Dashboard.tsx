import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const revenue = orders.reduce((s:any,o:any)=>s + (o.total || 0), 0);
    setStats({ products: products.length, orders: orders.length, revenue });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">لوحة التحكم</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">المنتجات</div>
          <div className="mt-2 text-3xl font-extrabold">{stats.products}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">الطلبات</div>
          <div className="mt-2 text-3xl font-extrabold">{stats.orders}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">إجمالي العائد</div>
          <div className="mt-2 text-3xl font-extrabold">${stats.revenue}</div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-card p-4">
        <h3 className="font-bold">آخر الطلبات</h3>
        <RecentOrders />
      </div>
    </div>
  );
}

function RecentOrders() {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  if (!orders.length) return <div className="text-muted-foreground mt-4">لا توجد طلبات بعد</div>;
  return (
    <ul className="mt-4 space-y-2">
      {orders.slice(-5).reverse().map((o:any)=> (
        <li key={o.id} className="flex items-center justify-between rounded-md border p-3">
          <div>
            <div className="font-bold">#{o.id}</div>
            <div className="text-sm text-muted-foreground">{o.items?.length || 0} منتجات</div>
          </div>
          <div className="font-bold">${o.total}</div>
        </li>
      ))}
    </ul>
  )
}
