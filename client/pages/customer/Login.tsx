import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CustomerLogin(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  function handleLogin(e:any){
    e.preventDefault();
    // simple customer session: store in localStorage
    const customers = JSON.parse(localStorage.getItem('customers')||'[]');
    let cust = customers.find((c:any)=> c.email === email && c.storeId === id);
    if(!cust){
      alert('لم نجد هذا المستخدم، يمكنك التسجيل أولاً');
      return;
    }
    localStorage.setItem('customer_session', JSON.stringify({ email, storeId: id }));
    navigate(`/shop/${id}/dashboard`);
  }

  return (
    <section className="container mx-auto py-20">
      <div className="mx-auto max-w-md rounded-lg border bg-card p-6">
        <h3 className="text-lg font-bold mb-4">دخول زبون المتجر</h3>
        <form onSubmit={handleLogin} className="grid gap-3">
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="rounded-md border bg-background px-3 py-2" />
          <div className="flex items-center gap-2">
            <Button type="submit">دخول</Button>
            <Button variant="ghost" onClick={()=>navigate(`/shop/${id}/signup`)}>إنشاء حساب</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
