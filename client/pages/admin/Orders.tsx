import { useEffect, useState } from "react";
import { MoreHorizontal, Download, Filter, ShoppingBag, TrendingUp } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function OrdersAdmin() {
  const { t, locale } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);

  const customerNames = {
    ar: [
      'أحمد محمد', 'فاطمة علي', 'محمود سارة', 'ليلى حسن', 'سليم عمر',
      'نور الدين', 'زينب أحمد', 'كريم حسين', 'سارة مصطفى', 'ياسر محمود',
      'رانيا خالد', 'عمر فاروق', 'منى سعيد', 'طارق جمال', 'هدى كمال'
    ],
    en: [
      'Ahmed Mohamed', 'Fatima Ali', 'Mahmoud Sarah', 'Leila Hassan', 'Salim Omar',
      'Nour Eddine', 'Zainab Ahmed', 'Karim Hussein', 'Sarah Mustafa', 'Yasser Mahmoud',
      'Rania Khaled', 'Omar Farouk', 'Mona Saeed', 'Tarek Jamal', 'Hoda Kamal'
    ],
    fr: [
      'Ahmed Mohamed', 'Fatima Ali', 'Mahmoud Sarah', 'Leila Hassan', 'Salim Omar',
      'Nour Eddine', 'Zeinab Ahmed', 'Karim Hussein', 'Sara Mustafa', 'Yasser Mahmoud',
      'Rania Khaled', 'Omar Farouk', 'Mona Saeed', 'Tarek Jamal', 'Hoda Kamal'
    ]
  };

  const getTimeStr = (minutes: number) => {
    if (minutes < 60) {
      return t('orders.time.minutes').replace('{n}', minutes.toString());
    } else if (minutes === 60) {
      return t('orders.time.hour');
    } else {
      const hours = Math.floor(minutes / 60);
      return hours === 1 
        ? t('orders.time.hour')
        : t('orders.time.hours').replace('{n}', hours.toString());
    }
  };

  useEffect(()=>{
    const existing = JSON.parse(localStorage.getItem('orders')||'[]');
    if(existing.length === 0){
      const sample = [
        { id: 'ORD-001', total: 15500, status: 'confirmed', minutes: 5 },
        { id: 'ORD-002', total: 8200, status: 'confirmed', minutes: 15 },
        { id: 'ORD-003', total: 22000, status: 'pending', minutes: 30 },
        { id: 'ORD-004', total: 12800, status: 'confirmed', minutes: 60 },
        { id: 'ORD-005', total: 5500, status: 'failed', minutes: 120 },
        { id: 'ORD-006', total: 18900, status: 'confirmed', minutes: 180 },
        { id: 'ORD-007', total: 7300, status: 'pending', minutes: 240 },
        { id: 'ORD-008', total: 25000, status: 'confirmed', minutes: 300 },
        { id: 'ORD-009', total: 13200, status: 'failed', minutes: 360 },
        { id: 'ORD-010', total: 9800, status: 'confirmed', minutes: 420 },
        { id: 'ORD-011', total: 16700, status: 'pending', minutes: 480 },
        { id: 'ORD-012', total: 21000, status: 'confirmed', minutes: 540 },
        { id: 'ORD-013', total: 11500, status: 'confirmed', minutes: 600 },
        { id: 'ORD-014', total: 19300, status: 'failed', minutes: 660 },
        { id: 'ORD-015', total: 8900, status: 'confirmed', minutes: 720 }
      ].map((order, index) => ({
        ...order,
        customer: customerNames[locale][index],
        time: getTimeStr(order.minutes)
      }));
      localStorage.setItem('orders', JSON.stringify(sample));
      setOrders(sample);
    } else setOrders(existing);
  },[]);

  function setStatus(id:string, status:string){
    const all = JSON.parse(localStorage.getItem('orders')||'[]');
    const next = all.map((o:any)=> o.id===id ? {...o, status} : o);
    localStorage.setItem('orders', JSON.stringify(next));
    setOrders(next);
  }

  return (
    <div>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/20">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">إجمالي الطلبات</div>
              <div className="text-2xl font-bold">{orders.length}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border-2 border-accent/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent/20">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">الطلبات المؤكدة</div>
              <div className="text-2xl font-bold">{orders.filter(o => o.status === 'confirmed').length}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border-2 border-orange-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-500/20">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">الإيرادات</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                {orders.reduce((sum, o) => sum + o.total, 0)} دج
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="p-6 border-b-2 border-primary/10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t('orders.title')}
            </h3>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg border-2 border-primary/30 bg-background px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors">
                <Download className="h-4 w-4"/> {t('orders.download')}
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white px-4 py-2 text-sm font-medium hover:from-primary/90 hover:to-accent/90 transition-colors shadow-md">
                <Filter className="h-4 w-4"/> {t('orders.filter')}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-primary/10 bg-gradient-to-r from-muted/50 to-muted/30">
                <th className="whitespace-nowrap p-4 text-right font-bold">{t('orders.orderNumber')}</th>
                <th className="whitespace-nowrap p-4 text-right font-bold">{t('orders.customer')}</th>
                <th className="whitespace-nowrap p-4 text-right font-bold">{t('orders.amount')}</th>
                <th className="whitespace-nowrap p-4 text-right font-bold">{t('orders.status')}</th>
                <th className="whitespace-nowrap p-4 text-right font-bold">{t('orders.time')}</th>
                <th className="whitespace-nowrap p-4 text-right font-bold">{t('orders.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o:any)=> (
                <tr key={o.id} className="border-b border-primary/5 transition-colors hover:bg-primary/5">
                  <td className="whitespace-nowrap p-4 text-right font-medium">{o.id}</td>
                  <td className="whitespace-nowrap p-4 text-right">{o.customer}</td>
                  <td className="whitespace-nowrap p-4 text-right">
                    <span className="font-bold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                      {o.total} دج
                    </span>
                  </td>
                  <td className="whitespace-nowrap p-4 text-right">
                    {o.status === 'confirmed' && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500/20 to-green-500/10 px-3 py-1 text-xs font-bold text-green-600 border border-green-500/30">
                        ● {t('orders.status.confirmed')}
                      </span>
                    )}
                    {o.status === 'pending' && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-600 border border-yellow-500/30">
                        ● {t('orders.status.pending')}
                      </span>
                    )}
                    {o.status === 'failed' && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500/20 to-red-500/10 px-3 py-1 text-xs font-bold text-red-600 border border-red-500/30">
                        ● {t('orders.status.failed')}
                      </span>
                    )}
                    {o.status === 'followup' && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 border border-blue-500/30">
                        ● {t('orders.status.followup')}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap p-4 text-right text-muted-foreground">{o.time}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setStatus(o.id, 'confirmed')} 
                        className="inline-flex items-center rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-3 py-1.5 text-xs font-medium text-white hover:from-green-600 hover:to-green-700 transition-colors shadow-md"
                      >
                        {t('orders.action.confirm')}
                      </button>
                      <button 
                        onClick={() => setStatus(o.id, 'failed')} 
                        className="inline-flex items-center rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 text-xs font-medium text-white hover:from-red-600 hover:to-red-700 transition-colors shadow-md"
                      >
                        {t('orders.action.cancel')}
                      </button>
                      <button 
                        onClick={() => setStatus(o.id, 'followup')} 
                        className="inline-flex items-center rounded-lg border-2 border-primary/30 px-3 py-1.5 text-xs font-medium hover:bg-primary/10 transition-colors"
                      >
                        {t('orders.action.followup')}
                      </button>
                      <button className="rounded-lg p-2 hover:bg-muted transition-colors">
                        <MoreHorizontal className="h-4 w-4"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t-2 border-primary/10 flex items-center justify-between bg-muted/30">
          <div className="text-sm text-muted-foreground">
            {t('orders.showing').replace('{start}', '1').replace('{end}', '15').replace('{total}', orders.length.toString())}
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="rounded-lg border-2 border-primary/30 bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={orders.length <= 15}
            >
              {t('orders.prev')}
            </button>
            <button 
              className="rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-white hover:from-primary/90 hover:to-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              disabled={orders.length <= 15}
            >
              {t('orders.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
