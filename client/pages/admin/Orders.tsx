import React, { useEffect, useState } from "react";
import { MoreHorizontal, Download, Filter, ShoppingBag, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

export default function OrdersAdmin() {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    total_price: '',
    product_title: ''
  });

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
    loadOrders();
  },[]);

  // Poll orders every 5 seconds for near-real-time updates
  useEffect(() => {
    const id = setInterval(() => {
      loadOrders(true);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setIsRefreshing(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch('/api/client/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        // Transform API data to match our format
        const transformedOrders = data.map((order: any) => ({
          id: `ORD-${String(order.id).padStart(3, '0')}`,
          customer: order.customer_name,
          total: order.total_price,
          status: order.status === 'confirmed' ? 'confirmed' : 
                  order.status === 'cancelled' ? 'failed' :
                  order.status === 'pending' ? 'pending' : 'pending',
          time: getTimeStr(Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)),
          product_title: order.product_title,
          quantity: order.quantity,
          phone: order.customer_phone,
          email: order.customer_email,
          address: order.shipping_address,
          raw_id: order.id
        }));
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  async function setStatus(id: string, status: string) {
    try {
      // Extract raw ID from ORD-XXX format
      const rawId = orders.find(o => o.id === id)?.raw_id;
      if (!rawId) return;

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await fetch(`/api/client/orders/${rawId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        // Reload orders after status update
        await loadOrders();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  async function handleAddOrder() {
    try {
      if (!newOrder.customer_name || !newOrder.total_price || !newOrder.product_title) {
        alert('Please fill in required fields');
        return;
      }

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: 1,
          client_id: null,
          quantity: 1,
          total_price: parseFloat(newOrder.total_price),
          customer_name: newOrder.customer_name,
          customer_email: newOrder.customer_email || null,
          customer_phone: newOrder.customer_phone || null,
          customer_address: newOrder.customer_address || null
        })
      });

      if (res.ok) {
        setShowAddOrder(false);
        setNewOrder({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          customer_address: '',
          total_price: '',
          product_title: ''
        });
        await loadOrders();
      } else {
        alert('Failed to create order');
      }
    } catch (error) {
      console.error('Error adding order:', error);
      alert('Error creating order');
    }
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
                {orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0).toLocaleString()} دج
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
              <button 
                onClick={() => loadOrders()}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-primary/30 bg-background px-4 py-2 text-sm font-medium hover:bg-primary/10 transition-colors disabled:opacity-50"
                disabled={isRefreshing}
              >
                {isRefreshing ? t('orders.refreshing') || 'Refreshing…' : t('orders.refresh') || 'Refresh'}
              </button>
              <button 
                onClick={() => setShowAddOrder(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-sm font-medium hover:from-green-600 hover:to-green-700 transition-colors shadow-md"
              >
                <Plus className="h-4 w-4"/> {t('orders.addOrder') || 'Add Order'}
              </button>
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
                <React.Fragment key={o.id}>
                  <tr 
                    onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)}
                    className="border-b border-primary/5 transition-all cursor-pointer hover:bg-primary/10"
                  >
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
                    <td className="p-4 text-right">
                      <span className="text-xs text-muted-foreground">
                        {expandedOrderId === o.id ? '▼' : '▶'}
                      </span>
                    </td>
                  </tr>
                  {expandedOrderId === o.id && (
                    <tr className="bg-muted/30 border-b-2 border-primary/10">
                      <td colSpan={6} className="p-6">
                        <div className="space-y-6">
                          {/* Order Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-background rounded-lg p-4 border border-border/50">
                              <div className="text-xs text-muted-foreground mb-1">رقم الطلب</div>
                              <div className="font-semibold">{o.id}</div>
                            </div>
                            <div className="bg-background rounded-lg p-4 border border-border/50">
                              <div className="text-xs text-muted-foreground mb-1">اسم العميل</div>
                              <div className="font-semibold">{o.customer}</div>
                            </div>
                            <div className="bg-background rounded-lg p-4 border border-border/50">
                              <div className="text-xs text-muted-foreground mb-1">رقم الهاتف</div>
                              <div className="font-semibold">{o.phone || 'غير متوفر'}</div>
                            </div>
                            <div className="bg-background rounded-lg p-4 border border-border/50">
                              <div className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</div>
                              <div className="font-semibold text-sm">{o.email || 'غير متوفر'}</div>
                            </div>
                            <div className="bg-background rounded-lg p-4 border border-border/50">
                              <div className="text-xs text-muted-foreground mb-1">العنوان</div>
                              <div className="font-semibold text-sm">{o.address || 'غير متوفر'}</div>
                            </div>
                            <div className="bg-background rounded-lg p-4 border border-border/50">
                              <div className="text-xs text-muted-foreground mb-1">المنتج</div>
                              <div className="font-semibold text-sm">{o.product_title || 'غير متوفر'}</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3">
                            <button 
                              onClick={() => setStatus(o.id, 'confirmed')} 
                              className="inline-flex items-center rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-medium text-white hover:from-green-600 hover:to-green-700 transition-colors shadow-md"
                            >
                              ✓ تأكيد الطلب
                            </button>
                            <button 
                              onClick={() => setStatus(o.id, 'failed')} 
                              className="inline-flex items-center rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-medium text-white hover:from-red-600 hover:to-red-700 transition-colors shadow-md"
                            >
                              ✕ إلغاء الطلب
                            </button>
                            <button 
                              onClick={() => setStatus(o.id, 'followup')} 
                              className="inline-flex items-center rounded-lg border-2 border-blue-500/50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-500/10 transition-colors"
                            >
                              ◯ متابعة
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t-2 border-primary/10 flex items-center justify-between bg-muted/30">
          <div className="text-sm text-muted-foreground">
            {orders.length === 0 ? 'Showing 0 orders' : t('orders.showing').replace('{start}', '1').replace('{end}', Math.min(15, orders.length).toString()).replace('{total}', orders.length.toString())}
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

      {/* Add Order Modal */}
      {showAddOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border-2 border-primary/20 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold">إضافة طلب جديد</h2>
            
            <div>
              <label className="text-sm font-medium">اسم العميل *</label>
              <input
                type="text"
                value={newOrder.customer_name}
                onChange={(e) => setNewOrder({...newOrder, customer_name: e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="أدخل اسم العميل"
              />
            </div>

            <div>
              <label className="text-sm font-medium">رقم الهاتف</label>
              <input
                type="tel"
                value={newOrder.customer_phone}
                onChange={(e) => setNewOrder({...newOrder, customer_phone: e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+213..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <input
                type="email"
                value={newOrder.customer_email}
                onChange={(e) => setNewOrder({...newOrder, customer_email: e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium">العنوان</label>
              <input
                type="text"
                value={newOrder.customer_address}
                onChange={(e) => setNewOrder({...newOrder, customer_address: e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="أدخل العنوان"
              />
            </div>

            <div>
              <label className="text-sm font-medium">المجموع *</label>
              <input
                type="number"
                value={newOrder.total_price}
                onChange={(e) => setNewOrder({...newOrder, total_price: e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
                step="0.01"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowAddOrder(false)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-primary/30 hover:bg-primary/10 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddOrder}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:from-green-600 hover:to-green-700 transition-colors shadow-md"
              >
                إضافة الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
