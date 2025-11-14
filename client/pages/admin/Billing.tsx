export default function AdminBilling() {
  const plan = localStorage.getItem('plan') || 'free';
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">الفوترة والإيرادات</h2>
      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm text-muted-foreground">الخطة الحالية:</div>
        <div className="mt-2 text-lg font-bold">{plan}</div>
        <p className="mt-2 text-sm text-muted-foreground">تفاصيل الفوترة الفعلية ستظهر بعد ربط بوابة الدفع.</p>
      </div>
    </div>
  );
}
