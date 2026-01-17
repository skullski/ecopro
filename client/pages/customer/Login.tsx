import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { safeJsonParse } from "@/utils/safeJson";

export default function CustomerLogin(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  function handleLogin(e:any){
    e.preventDefault();
    // simple customer session: store in localStorage
    const customers = safeJsonParse<any[]>(localStorage.getItem('customers'), []);
    let cust = customers.find((c:any)=> c.email === email && c.storeId === id);
    if(!cust){
      alert('User not found, you can register first');
      return;
    }
    localStorage.setItem('customer_session', JSON.stringify({ email, storeId: id }));
    navigate(`/shop/${id}/dashboard`);
  }

  return (
    <section className="container mx-auto py-20">
      <div className="mx-auto max-w-md rounded-lg border bg-card p-6">
        <h3 className="text-lg font-bold mb-4">Store Customer Login</h3>
        <form onSubmit={handleLogin} className="grid gap-3">
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="rounded-md border bg-background px-3 py-2" />
          <div className="flex items-center gap-2">
            <Button type="submit">Login</Button>
            <Button variant="ghost" onClick={()=>navigate(`/shop/${id}/signup`)}>Create Account</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
