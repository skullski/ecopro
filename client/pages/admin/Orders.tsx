import React, { useEffect, useState } from "react";
import { MoreHorizontal, Download, Filter, ShoppingBag, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

export default function OrdersAdmin() {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'confirmed' | 'archived'>('all');
  const [timeUpdate, setTimeUpdate] = useState<number>(0); // For triggering time updates
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

  // Filter orders based on selected tab
  const getFilteredOrders = () => {
    switch (filterTab) {
      case 'pending':
        return orders.filter(o => o.status === 'pending');
      case 'confirmed':
        return orders.filter(o => o.status === 'confirmed');
      case 'archived':
        return orders.filter(o => o.status === 'failed' || o.status === 'cancelled');
      case 'all':
      default:
        return orders;
    }
  };

  useEffect(()=>{
    loadOrders();
  },[]);

  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Quick status update handler
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        await loadOrders();
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Poll orders every 30 seconds for near-real-time updates (reduced from 5s for performance)
  useEffect(() => {
    const id = setInterval(() => {
      loadOrders(true);
    }, 30000); // 30 seconds instead of 5 seconds
    return () => clearInterval(id);
  }, []);

  // Update time display every minute
  useEffect(() => {
    const id = setInterval(() => {
      setTimeUpdate(prev => prev + 1);
    }, 60000); // Update every 60 seconds
    return () => clearInterval(id);
  }, []);

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) {
        setIsRefreshing(true);
        setIsLoading(true);
      }
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated. Please log in.');
        setIsLoading(false);
        return;
      }

      const res = await fetch('/api/client/orders?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        setError('Authentication failed. Please log in again.');
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.status}`);
      }

      const data = await res.json();
      // Handle both old array format and new paginated object format
      const ordersArray = Array.isArray(data) ? data : (data.orders || []);
      
      // Transform API data to match our format
      const transformedOrders = ordersArray.map((order: any) => ({
        id: `ORD-${String(order.id).padStart(3, '0')}`,
        customer: order.customer_name,
        total: order.total_price,
        status: order.status === 'confirmed' ? 'confirmed' : 
                order.status === 'cancelled' ? 'failed' :
                order.status === 'pending' ? 'pending' : 'pending',
        created_at: order.created_at,
        time: getTimeStr(Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)),
        product_title: order.product_title,
        quantity: order.quantity,
        phone: order.customer_phone,
        email: order.customer_email,
        address: order.shipping_address,
        raw_id: order.id
      }));
      setOrders(transformedOrders);
      setError(null);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to load orders. Please try again.');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  async function setStatus(id: string, status: string) {
    try {
      setUpdatingOrderId(id as any);
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
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Error updating status');
    } finally {
      setUpdatingOrderId(null);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-2 mb-2 md:mb-3">
        <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 p-2 md:p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-primary/20">
              <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-muted-foreground">إجمالي الطلبات</div>
              <div className="text-2xl font-bold">{orders.length}</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 p-2 md:p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-accent/20">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-semibold text-muted-foreground">الطلبات المؤكدة</div>
              <div className="text-2xl font-bold">{orders.filter(o => o.status === 'confirmed').length}</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 p-2 md:p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-orange-500/20">
              <span className="text-lg">💰</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-muted-foreground">الإيرادات</div>
              <div className="text-xl font-bold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                {orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0).toLocaleString()} دج
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm shadow overflow-hidden">
        <div className="p-2 md:p-3 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t('orders.title')}
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => loadOrders()}
                className="inline-flex items-center gap-1 rounded border border-primary/30 bg-background px-3 py-2 text-sm font-bold hover:bg-primary/10 transition-colors disabled:opacity-50 h-9"
                disabled={isRefreshing}
              >
                {isRefreshing ? t('orders.refreshing') || 'Refreshing…' : t('orders.refresh') || 'Refresh'}
              </button>
              <button 
                onClick={() => setShowAddOrder(true)}
                className="inline-flex items-center gap-1 rounded bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 text-sm font-bold hover:from-green-600 hover:to-green-700 transition-colors shadow h-9"
              >
                <Plus className="h-4 w-4"/> {t('orders.addOrder') || 'Add Order'}
              </button>
              <button className="inline-flex items-center gap-1 rounded border border-primary/30 bg-background px-3 py-2 text-sm font-bold hover:bg-primary/10 transition-colors h-9">
                <Download className="h-4 w-4"/> {t('orders.download')}
              </button>
              <button className="inline-flex items-center gap-1 rounded bg-gradient-to-r from-primary to-accent text-white px-3 py-2 text-sm font-bold hover:from-primary/90 hover:to-accent/90 transition-colors shadow h-9">
                <Filter className="h-4 w-4"/> {t('orders.filter')}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-primary/10 bg-gradient-to-r from-muted/30 to-muted/10 p-2 flex gap-1 flex-wrap">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded text-sm font-bold transition-colors h-9 ${
              filterTab === 'all'
                ? 'bg-primary text-white'
                : 'bg-background text-foreground hover:bg-primary/10'
            }`}
          >
            الكل ({orders.length})
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-4 py-2 rounded text-sm font-bold transition-colors h-9 ${
              filterTab === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-background text-foreground hover:bg-yellow-500/10'
            }`}
          >
            قيد الانتظار ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterTab('confirmed')}
            className={`px-4 py-2 rounded text-sm font-bold transition-colors h-9 ${
              filterTab === 'confirmed'
                ? 'bg-green-500 text-white'
                : 'bg-background text-foreground hover:bg-green-500/10'
            }`}
          >
            مؤكدة ({orders.filter(o => o.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilterTab('archived')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors h-7 ${
              filterTab === 'archived'
                ? 'bg-gray-500 text-white'
                : 'bg-background text-foreground hover:bg-gray-500/10'
            }`}
          >
            مؤرشفة ({orders.filter(o => o.status === 'failed' || o.status === 'cancelled').length})
          </button>
        </div>

        <div className="overflow-x-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-3 md:p-3 text-center">
              <div className="inline-flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
              <p className="mt-1 md:mt-2 text-muted-foreground text-xs">جاري تحميل الطلبات...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-3 md:p-3 text-center">
              <div className="rounded bg-red-500/10 border border-red-500/30 p-2 md:p-3 mb-2">
                <p className="text-red-600 font-semibold text-xs">⚠️ خطأ</p>
                <p className="text-red-600 text-xs mt-1">{error}</p>
              </div>
              <button
                onClick={() => loadOrders()}
                className="inline-flex items-center gap-1 rounded bg-primary text-white px-2 py-1 text-xs font-medium hover:bg-primary/90 transition-colors h-8"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Empty State - No Orders At All */}
          {!isLoading && !error && orders.length === 0 && (
            <div className="p-6 md:p-8 text-center">
              <div className="text-lg mb-2">📭</div>
              <p className="text-xs md:text-sm font-semibold text-muted-foreground mb-1">لا توجد طلبات</p>
              <p className="text-xs text-muted-foreground mb-2">لم يتم تلقي أي طلبات حتى الآن</p>
              <button
                onClick={() => setShowAddOrder(true)}
                className="inline-flex items-center gap-1 rounded bg-green-500 text-white px-2 py-1 text-xs font-medium hover:bg-green-600 transition-colors h-8"
              >
                <Plus className="h-3 w-3"/> إضافة طلب جديد
              </button>
            </div>
          )}

          {/* Empty State - No Orders in This Category */}
          {!isLoading && !error && orders.length > 0 && getFilteredOrders().length === 0 && (
            <div className="p-6 md:p-8 text-center">
              <div className="text-lg mb-2">🔍</div>
              <p className="text-xs md:text-sm font-semibold text-muted-foreground mb-1">لا توجد طلبات في هذه الفئة</p>
              <p className="text-xs text-muted-foreground">جرب تغيير الفلتر</p>
            </div>
          )}

          {/* Orders Table */}
          {!isLoading && !error && orders.length > 0 && getFilteredOrders().length > 0 && (
          <table className="w-full text-sm font-semibold">
            <thead>
              <tr className="border-b border-primary/10 bg-gradient-to-r from-muted/50 to-muted/30">
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">{t('orders.orderNumber')}</th>
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">{t('orders.customer')}</th>
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">{t('orders.amount')}</th>
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">{t('orders.status')}</th>
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">{t('orders.time')}</th>
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">{t('orders.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredOrders().map((o:any)=> (
                <React.Fragment key={o.id}>
                  <tr 
                    onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)}
                    className="border-b border-primary/5 transition-all cursor-pointer hover:bg-primary/10"
                  >
                    <td className="whitespace-nowrap p-2 text-right font-bold text-sm">{o.id}</td>
                    <td className="whitespace-nowrap p-2 text-right text-sm font-semibold">{o.customer}</td>
                    <td className="whitespace-nowrap p-2 text-right">
                      <span className="font-bold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent text-sm">
                        {o.total} دج
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-2 text-right">
                      {o.status === 'confirmed' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500/20 to-green-500/10 px-3 py-1 text-sm font-bold text-green-600 border border-green-500/30">
                          ● {t('orders.status.confirmed')}
                        </span>
                      )}
                      {o.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 px-3 py-1 text-sm font-bold text-yellow-600 border border-yellow-500/30">
                          ● {t('orders.status.pending')}
                        </span>
                      )}
                      {o.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500/20 to-red-500/10 px-3 py-1 text-sm font-bold text-red-600 border border-red-500/30">
                          ● {t('orders.status.failed')}
                        </span>
                      )}
                      {o.status === 'followup' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-500/10 px-3 py-1 text-sm font-bold text-blue-600 border border-blue-500/30">
                          ● {t('orders.status.followup')}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap p-2 text-right text-muted-foreground text-sm" key={`time-${o.id}-${timeUpdate}`}>{getTimeStr(Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000))}</td>
                    <td className="p-2 text-right flex items-center justify-end gap-1">
                      {o.status === 'confirmed' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatus(o.id, 'shipped');
                            }}
                            disabled={updatingOrderId === o.id}
                            className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 disabled:opacity-50 transition"
                            title="Mark as shipped"
                          >
                            📦
                          </button>
                        </>
                      )}
                      {o.status === 'shipped' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatus(o.id, 'delivered');
                          }}
                          disabled={updatingOrderId === o.id}
                          className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-600 hover:bg-green-500/30 disabled:opacity-50 transition"
                          title="Mark as delivered"
                        >
                          ✓
                        </button>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {expandedOrderId === o.id ? '▼' : '▶'}
                      </span>
                    </td>
                  </tr>
                  {expandedOrderId === o.id && (
                    <tr className="bg-muted/30 border-b border-primary/10">
                      <td colSpan={6} className="p-3">
                        <div className="space-y-2">
                          {/* Order Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            <div className="bg-background rounded p-2 border border-border/50">
                              <div className="text-sm font-semibold text-muted-foreground mb-0.5">رقم الطلب</div>
                              <div className="font-bold text-sm">{o.id}</div>
                            </div>
                            <div className="bg-background rounded p-2 border border-border/50">
                              <div className="text-sm font-semibold text-muted-foreground mb-0.5">اسم العميل</div>
                              <div className="font-bold text-sm">{o.customer}</div>
                            </div>
                            <div className="bg-background rounded p-2 border border-border/50">
                              <div className="text-sm font-semibold text-muted-foreground mb-0.5">رقم الهاتف</div>
                              <div className="font-bold text-sm">{o.phone || 'غير متوفر'}</div>
                            </div>
                            <div className="bg-background rounded p-2 border border-border/50">
                              <div className="text-sm font-semibold text-muted-foreground mb-0.5">البريد الإلكتروني</div>
                              <div className="font-bold text-sm">{o.email || 'غير متوفر'}</div>
                            </div>
                            <div className="bg-background rounded p-2 border border-border/50">
                              <div className="text-sm font-semibold text-muted-foreground mb-0.5">العنوان</div>
                              <div className="font-bold text-sm">{o.address || 'غير متوفر'}</div>
                            </div>
                            <div className="bg-background rounded p-2 border border-border/50">
                              <div className="text-sm font-semibold text-muted-foreground mb-0.5">المنتج</div>
                              <div className="font-bold text-sm">{o.product_title || 'غير متوفر'}</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => setStatus(o.id, 'confirmed')} 
                              className="inline-flex items-center rounded bg-gradient-to-r from-green-500 to-green-600 px-3 py-2 text-sm font-bold text-white hover:from-green-600 hover:to-green-700 transition-colors shadow h-9"
                            >
                              ✓ تأكيد الطلب
                            </button>
                            <button 
                              onClick={() => setStatus(o.id, 'cancelled')} 
                              className="inline-flex items-center rounded bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-sm font-bold text-white hover:from-red-600 hover:to-red-700 transition-colors shadow h-9"
                            >
                              ✕ إلغاء الطلب
                            </button>
                            <button 
                              onClick={() => setStatus(o.id, 'processing')} 
                              className="inline-flex items-center rounded border border-blue-500/50 px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-500/10 transition-colors h-9"
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
          )}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-card rounded-lg border border-primary/20 shadow-xl max-w-xs w-full p-3 space-y-2">
            <h2 className="text-lg font-bold">إضافة طلب جديد</h2>
            
            <div>
              <label className="text-sm font-bold">اسم العميل *</label>
              <input
                type="text"
                value={newOrder.customer_name}
                onChange={(e) => setNewOrder({...newOrder, customer_name: e.target.value})}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary h-9 text-sm"
                placeholder="أدخل اسم العميل"
              />
            </div>

            <div>
              <label className="text-sm font-bold">رقم الهاتف</label>
              <input
                type="tel"
                value={newOrder.customer_phone}
                onChange={(e) => setNewOrder({...newOrder, customer_phone: e.target.value})}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary h-9 text-sm"
                placeholder="+213..."
              />
            </div>

            <div>
              <label className="text-sm font-bold">البريد الإلكتروني</label>
              <input
                type="email"
                value={newOrder.customer_email}
                onChange={(e) => setNewOrder({...newOrder, customer_email: e.target.value})}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary h-9 text-sm"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="text-sm font-bold">العنوان</label>
              <input
                type="text"
                value={newOrder.customer_address}
                onChange={(e) => setNewOrder({...newOrder, customer_address: e.target.value})}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary h-9 text-sm"
                placeholder="أدخل العنوان"
              />
            </div>

            <div>
              <label className="text-sm font-bold">المجموع *</label>
              <input
                type="number"
                value={newOrder.total_price}
                onChange={(e) => setNewOrder({...newOrder, total_price: e.target.value})}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary h-9 text-sm"
                placeholder="0"
                step="0.01"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddOrder(false)}
                className="flex-1 px-3 py-2 rounded border border-primary/30 hover:bg-primary/10 transition-colors text-sm h-9 font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddOrder}
                className="flex-1 px-3 py-2 rounded bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold hover:from-green-600 hover:to-green-700 transition-colors shadow h-9"
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
