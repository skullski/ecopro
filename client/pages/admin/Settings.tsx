import { useState } from "react";

export default function Settings() {
  const [stripeKey, setStripeKey] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");

  function save(){
    const cfg = { stripeKey, supabaseUrl };
    localStorage.setItem('integrations', JSON.stringify(cfg));
    alert('تم حفظ الإعدادات (محلياً). ستتم عملية الربط الحقيقية لاحقًا.');
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">الإعدادات والتكاملات</h2>
      <div className="grid gap-4 max-w-2xl">
        <div className="rounded-lg border bg-card p-4">
          <h4 className="font-bold">Stripe</h4>
          <p className="text-sm text-muted-foreground">أدخل مفاتيح Stripe الاختبارية ليتم حفظها محليًا (التوصيل الفعلي لاحقًا)</p>
          <input 
            placeholder="Stripe Secret Key" 
            value={stripeKey} 
            onChange={(e)=>setStripeKey(e.target.value)} 
            className="mt-2 w-full rounded-md border bg-background px-3 py-2" 
          />
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h4 className="font-bold">Supabase</h4>
          <p className="text-sm text-muted-foreground">أدخل عنوان Supabase وAPI key (محلي مؤقت)</p>
          <input 
            placeholder="Supabase URL" 
            value={supabaseUrl} 
            onChange={(e)=>setSupabaseUrl(e.target.value)} 
            className="mt-2 w-full rounded-md border bg-background px-3 py-2" 
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={save} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">حفظ</button>
        </div>
      </div>
    </div>
  );
}
