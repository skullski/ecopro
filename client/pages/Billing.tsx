import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Billing() {
  const [plan, setPlan] = useState(localStorage.getItem('plan') || 'free');

  function subscribe(p:string){
    localStorage.setItem('plan', p);
    setPlan(p);
    alert('تم تحديث الخطة (محلياً)');
  }

  return (
    <section className="container mx-auto py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">الاشتراك والفوترة</h2>
        <p className="text-sm text-muted-foreground">إدارة خطة الاشتراك ستكون مفعلة عند ربط بوابة الدفع.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-bold">مجاني</h3>
            <div className="mt-2">$0 / شهر</div>
            <div className="mt-4">
              <Button onClick={()=>subscribe('free')}>اختيار</Button>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-bold">احترافي</h3>
            <div className="mt-2">$29 / شهر</div>
            <div className="mt-4">
              <Button onClick={()=>subscribe('pro')}>الترقية إلى احترافي</Button>
            </div>
          </div>
        </div>
        <div className="mt-6 text-sm text-muted-foreground">الخطة الحالية: {plan}</div>
      </div>
    </section>
  );
}
