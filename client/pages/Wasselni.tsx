import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Wasselni() {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-4">{t("wasselni.title")}</h1>
        <p className="text-lg text-muted-foreground">{t("wasselni.desc")}</p>

        <div className="mt-6 rounded-lg border bg-card p-4">
          <h3 className="font-bold">مثال مكالمة</h3>
          <p className="mt-2 text-sm">{t("wasselni.example")}</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <h4 className="font-bold">ميزات</h4>
            <ul className="mt-2 list-disc pr-5 text-sm">
              <li>ت��كيد تلقائي للطلبات باستخدام صوت اصطناعي باللهجة المحلية</li>
              <li>حفظ نتائج المكالمات في لوحة التحكم</li>
              <li>إعدادات قابلة للتخصيص: نص المكالمة، الصوت، اللهجة</li>
            </ul>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h4 className="font-bold">الاشتراكات</h4>
            <ul className="mt-2 list-disc pr-5 text-sm">
              <li>خطة مجانية: مكالمات محدودة ورسائل</li>
              <li>خطة احترافية: تحكم كامل وعدد مكالمات أكبر</li>
              <li>خطة متقدمة: أصوات مخصصة وفهم أحسن للمحادثات</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Link to="/signup"><Button>{"إنشاء حساب"}</Button></Link>
          <Link to="/dashboard/wasselni-settings"><Button variant="outline">إعدادات Wasselni</Button></Link>
          <Link to="/dashboard/calls"><Button variant="ghost">قائمة المكالمات</Button></Link>
        </div>
      </div>
    </section>
  );
}
