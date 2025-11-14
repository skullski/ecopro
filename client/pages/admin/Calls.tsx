import { useEffect, useState } from "react";

export default function CallsAdmin(){
  const [calls, setCalls] = useState<any[]>([]);
  const [customer, setCustomer] = useState('');
  const [product, setProduct] = useState('');

  useEffect(()=>{
    setCalls(JSON.parse(localStorage.getItem('wasselni_calls')||'[]'));
  },[]);

  function queueCall(){
    const id = Date.now().toString();
    const entry = { id, customer, product, status: 'scheduled', createdAt: Date.now() };
    const all = JSON.parse(localStorage.getItem('wasselni_calls')||'[]');
    all.push(entry);
    localStorage.setItem('wasselni_calls', JSON.stringify(all));
    setCalls(all);
    setCustomer(''); setProduct('');
  }

  function simulateCall(id:string){
    const outcome = prompt('Enter outcome: confirmed / cancelled / followup', 'confirmed');
    if (!outcome) return;
    const all = JSON.parse(localStorage.getItem('wasselni_calls')||'[]');
    const next = all.map((c:any)=> c.id===id ? {...c, status: outcome, answeredAt: Date.now()} : c);
    localStorage.setItem('wasselni_calls', JSON.stringify(next));
    setCalls(next);
  }

  function remove(id:string){
    const all = JSON.parse(localStorage.getItem('wasselni_calls')||'[]');
    const next = all.filter((c:any)=>c.id!==id);
    localStorage.setItem('wasselni_calls', JSON.stringify(next));
    setCalls(next);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">قائمة المكالمات</h2>
      <div className="rounded-lg border bg-card p-4 mb-4">
        <h3 className="font-bold">جدولة مكالمة جديدة</h3>
        <div className="mt-2 grid gap-2 max-w-md">
          <input 
            placeholder="اسم الزبون" 
            value={customer} 
            onChange={(e)=>setCustomer(e.target.value)} 
            className="rounded-md border bg-background px-3 py-2" 
          />
          <input 
            placeholder="اسم المنتج" 
            value={product} 
            onChange={(e)=>setProduct(e.target.value)} 
            className="rounded-md border bg-background px-3 py-2" 
          />
          <div className="flex items-center gap-2">
            <button onClick={queueCall} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">جدولة</button>
          </div>
        </div>
      </div>

      <div>
        {!calls.length && <div className="text-muted-foreground">لا توجد مكالمات مجدولة حالياً</div>}
        <div className="mt-4 space-y-3">
          {calls.map(c=> (
            <div key={c.id} className="rounded-md border bg-card p-3 flex items-center justify-between">
              <div>
                <div className="font-bold">{c.customer} — {c.product}</div>
                <div className="text-sm text-muted-foreground">{c.status}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>simulateCall(c.id)} className="rounded-md border bg-background hover:bg-muted px-3 py-1 text-sm">محاكاة المكالمة</button>
                <button onClick={()=>remove(c.id)} className="rounded-md border bg-background hover:bg-muted px-3 py-1 text-sm">حذف</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
