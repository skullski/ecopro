import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CustomerSignup(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  function handleSignup(e:any){
    e.preventDefault();
    const customers = JSON.parse(localStorage.getItem('customers')||'[]');
    const exists = customers.find((c:any)=> c.email===email && c.storeId===id);
    if(exists){ alert('Account exists'); return; }
    const c = { id: Date.now().toString(), email, name, storeId: id };
    customers.push(c);
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('customer_session', JSON.stringify({ email, storeId: id }));
    navigate(`/shop/${id}/dashboard`);
  }

  return (
    <section className="container mx-auto py-20">
      <div className="mx-auto max-w-md rounded-lg border bg-card p-6">
        <h3 className="text-lg font-bold mb-4">Create Customer Account</h3>
        <form onSubmit={handleSignup} className="grid gap-3">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" className="rounded-md border bg-background px-3 py-2" />
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="rounded-md border bg-background px-3 py-2" />
          <div className="flex items-center gap-2">
            <Button type="submit">Create</Button>
            <Button variant="ghost" onClick={()=>navigate(`/s/${id}`)}>Return to store</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
