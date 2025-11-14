import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DarkModeInput } from "@/components/ui/dark-mode-input";

export default function AdminStores(){
  const [stores, setStores] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');

  useEffect(()=>{
    setStores(JSON.parse(localStorage.getItem('stores')||'[]'));
  },[]);

  const [domain, setDomain] = useState('');
  function create(){
    const id = (name || 'store').toLowerCase().replace(/[^a-z0-9]+/g,'-') + '-' + Date.now().toString().slice(-4);
    const s = { 
      id, 
      name, 
      owner, 
      domain, 
      createdAt: Date.now(),
      theme: {
        primaryColor: "#000000",
        secondaryColor: "#ffffff",
        accentColor: "#0066cc",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        fontFamily: "Arial"
      },
      layout: {
        columns: 3,
        showCategories: true,
        showFeatured: true,
        showSearch: true
      },
      features: {
        reviews: false,
        wishlist: false,
        compare: false,
        quickView: true
      },
      subscription: {
        level: "free",
        features: [],
        maxProducts: 10
      }
    };
    const all = JSON.parse(localStorage.getItem('stores')||'[]');
    all.push(s);
    localStorage.setItem('stores', JSON.stringify(all));
    setStores(all);
    setName(''); setOwner('');
  }

  function remove(id:string){
    const all = JSON.parse(localStorage.getItem('stores')||'[]');
    const next = all.filter((x:any)=>x.id!==id);
    localStorage.setItem('stores', JSON.stringify(next));
    setStores(next);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">إدارة المتاجر</h2>
      <div className="grid gap-4 max-w-2xl">
        <div className="rounded-lg border bg-card p-4">
          <label className="block font-bold">اسم المتجر</label>
          <DarkModeInput value={name} onChange={(e)=>setName(e.target.value)} className="mt-2 w-full" />
          <label className="block mt-3 font-bold">بريد صاحب المتجر</label>
          <DarkModeInput value={owner} onChange={(e)=>setOwner(e.target.value)} className="mt-2 w-full" />
          <label className="block mt-3 font-bold">النطاق المخصص (اختياري)</label>
          <DarkModeInput value={domain} onChange={(e)=>setDomain(e.target.value)} placeholder="example.com" className="mt-2 w-full" />
          <div className="mt-3">
            <Button onClick={create}>إنشاء متجر</Button>
          </div>
        </div>

        <div>
          {stores.map(s=> (
            <div key={s.id} className="flex items-center justify-between rounded-md border bg-card p-3">
              <div>
                <div className="font-bold">{s.name}</div>
                <div className="text-sm text-muted-foreground">{s.owner} · {s.id}{s.domain ? ` · ${s.domain}` : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/s/${s.id}`} className="text-sm underline">فتح المتجر</a>
                <Link to={`/admin/store/${s.id}/settings`} className="text-sm underline">إعدادات المتجر</Link>
                {s.domain && <div className="text-sm text-muted-foreground">نطاق: {s.domain}</div>}
                <Button variant="destructive" onClick={()=>remove(s.id)}>حذف</Button>
              </div>
            </div>
          ))}
          {!stores.length && <div className="text-muted-foreground">لا توجد متاجر بعد</div>}
        </div>
      </div>
    </div>
  );
}
