import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function OrderSuccess(){
  const { id } = useParams();
  const orders = JSON.parse(localStorage.getItem('orders')||'[]');
  const order = orders.find((o:any)=>o.id===id);
  if (!order) return <div className="container mx-auto py-20">الطلب غير موجود</div>;

  return (
    <section className="container mx-auto py-20">
      <div className="mx-auto max-w-md text-center rounded-lg border bg-card p-6">
        <h2 className="text-2xl font-bold">شكراً لطلبك</h2>
        <p className="mt-2 text-sm text-muted-foreground">رقم الطلب: #{order.id}</p>
        <div className="mt-4">
          <Link to="/marketplace"><Button variant="ghost">العودة للمتجر</Button></Link>
          <Link to="/dashboard/orders"><Button className="ml-2">عرض الطلبات</Button></Link>
        </div>
      </div>
    </section>
  );
}
