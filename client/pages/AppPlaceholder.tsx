import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AppPlaceholder() {
  const isAdmin = typeof window !== "undefined" && localStorage.getItem("isAdmin") === 'true';

  function toggleAdmin() {
    const next = !isAdmin;
    localStorage.setItem('isAdmin', next ? 'true' : 'false');
    window.location.reload();
  }

  return (
    <section className="container mx-auto py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">لوحة التحكم</h1>
        <p className="mt-4 text-muted-foreground">
          هذه صفحة تجريبية مؤقتة لعرض مكان لوحة التحكم المستقبلية. استخدم زر تفعيل المسؤول للاختبار.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/">
            <Button variant="ghost">العودة للصفحة الرئيسية</Button>
          </Link>
          <a href="/#الأسعار">
            <Button>عرض الأسعار</Button>
          </a>
          <Button onClick={toggleAdmin}>{isAdmin ? 'تعطيل وضع المسؤول' : 'تفعيل وضع المسؤول'}</Button>
          {isAdmin && (
            <Link to="/admin">
              <Button variant="outline">انتقل إلى لوحة المسؤول</Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
