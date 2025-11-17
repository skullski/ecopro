import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Box, Settings, Phone, ChartBar } from "lucide-react";

export default function CustomerDashboard(){
  const { id } = useParams();
  const navigate = useNavigate();
  const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('customer_session')||'null') : null;
  if(!session || session.storeId !== id){
    // redirect to login for this store
    return <div className="container mx-auto py-20 text-center">
      <div className="max-w-md mx-auto rounded-lg border bg-card p-6">
        <h3 className="font-bold">مطلوب تسجيل دخول الزبائن</h3>
        <div className="mt-4">
          <button onClick={()=>navigate(`/shop/${id}/login`)} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">دخول الزبائن</button>
        </div>
      </div>
    </div>;
  }

  const stores = JSON.parse(localStorage.getItem('stores')||'[]');
  const store = stores.find((s:any)=>s.id===id);
  if(!store) return <div className="container mx-auto py-20">المتجر غير موجود</div>;

  return (
    <section className="container mx-auto py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">لوحة زبائن {store.name}</h2>
          <div className="text-sm text-muted-foreground">مرحبًا بك في لوحة التحكم الخاصة بزبائن المتجر</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to={`/s/${store.id}`} className="rounded-lg border bg-card p-4 text-center hover:shadow">
            <ShoppingCart className="mx-auto" />
            <div className="mt-2 font-bold">المتجر</div>
          </Link>

          <Link to={`/shop/${store.id}/orders`} className="rounded-lg border bg-card p-4 text-center hover:shadow">
            <Box className="mx-auto" />
            <div className="mt-2 font-bold">الطلبات</div>
          </Link>

          <Link to={`/shop/${store.id}/calls`} className="rounded-lg border bg-card p-4 text-center hover:shadow">
            <Phone className="mx-auto" />
            <div className="mt-2 font-bold">مكالمات التاكيد</div>
          </Link>

          <Link to={`/shop/${store.id}/settings`} className="rounded-lg border bg-card p-4 text-center hover:shadow">
            <Settings className="mx-auto" />
            <div className="mt-2 font-bold">الإعدادات</div>
          </Link>

          <Link to={`/shop/${store.id}/analytics`} className="rounded-lg border bg-card p-4 text-center hover:shadow">
            <ChartBar className="mx-auto" />
            <div className="mt-2 font-bold">التحليلات</div>
          </Link>
        </div>
      </div>
    </section>
  );
}
