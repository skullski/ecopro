import React, { useEffect, useState } from "react";
import { MoreHorizontal, Download, Filter, ShoppingBag, TrendingUp, Plus, Settings, X, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

interface OrderStatus {
  id: string | number;
  name: string;
  key?: string; // English key like 'confirmed', 'completed'
  color: string;
  icon: string;
  sort_order: number;
  is_default: boolean;
  counts_as_revenue?: boolean;
}

export default function OrdersAdmin() {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [customStatuses, setCustomStatuses] = useState<OrderStatus[]>([]);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#6b7280');
  const [newStatusIcon, setNewStatusIcon] = useState('●');
  const [newStatusCountsAsRevenue, setNewStatusCountsAsRevenue] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<string>('all');
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
      'Ahmed Mohammed', 'Fatima Ali', 'Mahmoud Sara', 'Layla Hassan', 'Salim Omar',
      'Noureddine', 'Zeinab Ahmed', 'Karim Hussein', 'Sara Mostafa', 'Yasser Mahmoud',
      'Rania Khaled', 'Omar Farouk', 'Mona Saeed', 'Tarek Gamal', 'Huda Kamal'
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
    if (filterTab === 'all') return orders;
    if (filterTab === 'archived') {
      return orders.filter(o => o.status === 'failed' || o.status === 'cancelled');
    }
    // Find the status to get its key for matching
    const selectedStatus = customStatuses.find(s => s.name === filterTab || s.key === filterTab);
    if (selectedStatus) {
      // Match by key, name, or id
      return orders.filter(o => 
        o.status === selectedStatus.key || 
        o.status === selectedStatus.name || 
        o.status === String(selectedStatus.id)
      );
    }
    return orders.filter(o => o.status === filterTab);
  };

  // Load custom statuses
  const loadStatuses = async () => {
    try {
      const res = await fetch('/api/client/order-statuses');
      if (res.ok) {
        const data = await res.json();
        setCustomStatuses(data);
      }
    } catch (error) {
      console.error('Failed to load statuses:', error);
    }
  };

  // Add new custom status
  const handleAddStatus = async () => {
    if (!newStatusName.trim()) return;
    try {
      const res = await fetch('/api/client/order-statuses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newStatusName,
          color: newStatusColor,
          icon: newStatusIcon,
          counts_as_revenue: newStatusCountsAsRevenue
        })
      });
      if (res.ok) {
        await loadStatuses();
        setNewStatusName('');
        setNewStatusColor('#6b7280');
        setNewStatusIcon('●');
        setNewStatusCountsAsRevenue(false);
      }
    } catch (error) {
      console.error('Failed to add status:', error);
    }
  };

  // Delete custom status
  const handleDeleteStatus = async (statusId: string | number) => {
    try {
      const res = await fetch(`/api/client/order-statuses/${statusId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadStatuses();
      }
    } catch (error) {
      console.error('Failed to delete status:', error);
    }
  };

  // Get status display info
  const getStatusDisplay = (statusKey: string) => {
    const status = customStatuses.find(s => 
      s.name === statusKey || String(s.id) === statusKey
    );
    if (status) {
      return { name: status.name, color: status.color, icon: status.icon };
    }
    // Fallback to built-in statuses
    const builtIn: Record<string, { name: string; color: string; icon: string }> = {
      pending: { name: t('orders.status.pending') || 'Pending', color: '#eab308', icon: '●' },
      confirmed: { name: t('orders.status.confirmed') || 'Confirmed', color: '#22c55e', icon: '✓' },
      processing: { name: 'Processing', color: '#3b82f6', icon: '◐' },
      shipped: { name: 'Shipped', color: '#8b5cf6', icon: '📦' },
      delivered: { name: 'Delivered', color: '#10b981', icon: '✓' },
      cancelled: { name: 'Cancelled', color: '#ef4444', icon: '✕' },
      failed: { name: t('orders.status.failed') || 'Failed', color: '#ef4444', icon: '✕' },
      followup: { name: t('orders.status.followup') || 'Follow-up', color: '#3b82f6', icon: '●' },
    };
    return builtIn[statusKey] || { name: statusKey, color: '#6b7280', icon: '●' };
  };

  useEffect(()=>{
    loadOrders();
    loadStatuses();
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
      const res = await fetch('/api/client/orders?limit=100', {
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
      const transformedOrders = ordersArray.map((order: any) => {
        // Get first product image from the images array
        let product_image = null;
        if (order.product_images) {
          // product_images comes as PostgreSQL array string like '{url1,url2}' or as actual array
          const images = Array.isArray(order.product_images) 
            ? order.product_images 
            : order.product_images.replace(/^\{|\}$/g, '').split(',').filter(Boolean);
          product_image = images[0] || null;
        }
        
        return {
          id: `ORD-${String(order.id).padStart(3, '0')}`,
          customer: order.customer_name,
          total: order.total_price,
          status: order.status, // Keep the actual status from database
          created_at: order.created_at,
          time: getTimeStr(Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)),
          product_title: order.product_title,
          product_image: product_image,
          quantity: order.quantity,
          phone: order.customer_phone,
          email: order.customer_email,
          address: order.shipping_address,
          raw_id: order.id
        };
      });
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

      const res = await fetch(`/api/client/orders/${rawId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
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

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
              <div className="text-sm font-semibold text-muted-foreground">Total Orders</div>
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
              <div className="text-sm font-semibold text-muted-foreground">Confirmed Orders</div>
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
              <div className="text-sm font-semibold text-muted-foreground">Revenue</div>
              <div className="text-xl font-bold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                {orders
                  .filter(o => {
                    // Get statuses that count as revenue
                    const revenueStatuses = customStatuses
                      .filter(s => s.counts_as_revenue)
                      .map(s => s.name);
                    // Also include built-in 'delivered' status
                    revenueStatuses.push('delivered');
                    return revenueStatuses.includes(o.status);
                  })
                  .reduce((sum, o) => sum + (Number(o.total) || 0), 0)
                  .toLocaleString()} DZD
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
              <button 
                onClick={() => setShowStatusManager(true)}
                className="inline-flex items-center gap-1 rounded border border-purple-500/30 bg-purple-500/10 text-purple-600 px-3 py-2 text-sm font-bold hover:bg-purple-500/20 transition-colors h-9"
              >
                <Settings className="h-4 w-4"/> Statuses
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
            All ({orders.length})
          </button>
          {customStatuses.map(status => (
            <button
              key={status.id}
              onClick={() => setFilterTab(String(status.name))}
              style={{ 
                backgroundColor: filterTab === status.name ? status.color : undefined,
                borderColor: status.color 
              }}
              className={`px-4 py-2 rounded text-sm font-bold transition-colors h-9 border ${
                filterTab === status.name
                  ? 'text-white'
                  : 'bg-background text-foreground hover:opacity-80'
              }`}
            >
              {status.icon} {status.name} ({orders.filter(o => o.status === status.key || o.status === status.name || o.status === String(status.id)).length})
            </button>
          ))}
          <button
            onClick={() => setFilterTab('archived')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors h-7 ${
              filterTab === 'archived'
                ? 'bg-gray-500 text-white'
                : 'bg-background text-foreground hover:bg-gray-500/10'
            }`}
          >
            Archived ({orders.filter(o => o.status === 'failed' || o.status === 'cancelled').length})
          </button>
        </div>

        <div className="overflow-x-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-3 md:p-3 text-center">
              <div className="inline-flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
              <p className="mt-1 md:mt-2 text-muted-foreground text-xs">Loading orders...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-3 md:p-3 text-center">
              <div className="rounded bg-red-500/10 border border-red-500/30 p-2 md:p-3 mb-2">
                <p className="text-red-600 font-semibold text-xs">⚠️ Error</p>
                <p className="text-red-600 text-xs mt-1">{error}</p>
              </div>
              <button
                onClick={() => loadOrders()}
                className="inline-flex items-center gap-1 rounded bg-primary text-white px-2 py-1 text-xs font-medium hover:bg-primary/90 transition-colors h-8"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State - No Orders At All */}
          {!isLoading && !error && orders.length === 0 && (
            <div className="p-6 md:p-8 text-center">
              <div className="text-lg mb-2">📭</div>
              <p className="text-xs md:text-sm font-semibold text-muted-foreground mb-1">No orders</p>
              <p className="text-xs text-muted-foreground mb-2">No orders received yet</p>
              <button
                onClick={() => setShowAddOrder(true)}
                className="inline-flex items-center gap-1 rounded bg-green-500 text-white px-2 py-1 text-xs font-medium hover:bg-green-600 transition-colors h-8"
              >
                <Plus className="h-3 w-3"/> Add new order
              </button>
            </div>
          )}

          {/* Empty State - No Orders in This Category */}
          {!isLoading && !error && orders.length > 0 && getFilteredOrders().length === 0 && (
            <div className="p-6 md:p-8 text-center">
              <div className="text-lg mb-2">🔍</div>
              <p className="text-xs md:text-sm font-semibold text-muted-foreground mb-1">No orders in this category</p>
              <p className="text-xs text-muted-foreground">Try changing the filter</p>
            </div>
          )}

          {/* Orders Table */}
          {!isLoading && !error && orders.length > 0 && getFilteredOrders().length > 0 && (
          <table className="w-full text-sm font-semibold">
            <thead>
              <tr className="border-b border-primary/10 bg-gradient-to-r from-muted/50 to-muted/30">
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">Image</th>
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">{t('orders.orderNumber')}</th>
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">Product</th>
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">{t('orders.customer')}</th>
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">{t('orders.amount')}</th>
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">{t('orders.status')}</th>
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm">{t('orders.time')}</th>
                <th className="whitespace-nowrap p-2 text-right font-bold text-sm w-8"></th>
              </tr>
            </thead>
            <tbody>
              {getFilteredOrders().map((o:any)=> (
                <React.Fragment key={o.id}>
                  <tr 
                    onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)}
                    className="border-b border-primary/5 transition-all cursor-pointer hover:bg-primary/10"
                  >
                    <td className="whitespace-nowrap p-2 text-right">
                      {o.product_image ? (
                        <img 
                          src={o.product_image} 
                          alt={o.product_title || 'Product'} 
                          className="w-10 h-10 rounded object-cover border border-border/50 ml-auto"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center border border-border/50 ml-auto">
                          <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap p-2 text-right font-bold text-sm">{o.id}</td>
                    <td className="whitespace-nowrap p-2 text-right">
                      <span className="text-sm font-semibold max-w-[150px] truncate block" title={o.product_title}>
                        {o.product_title || 'No product'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-2 text-right text-sm font-semibold">{o.customer}</td>
                    <td className="whitespace-nowrap p-2 text-right">
                      <span className="font-bold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent text-sm">
                        {o.total} DZD
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-2 text-right">
                      {(() => {
                        const statusInfo = getStatusDisplay(o.status);
                        return (
                          <span 
                            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold border"
                            style={{ 
                              backgroundColor: `${statusInfo.color}20`,
                              borderColor: `${statusInfo.color}50`,
                              color: statusInfo.color 
                            }}
                          >
                            {statusInfo.icon} {statusInfo.name}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="whitespace-nowrap p-2 text-right text-muted-foreground text-sm" key={`time-${o.id}-${timeUpdate}`}>{getTimeStr(Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000))}</td>
                    <td className="p-2 text-right">
                      <span className="text-xs text-muted-foreground">
                        {expandedOrderId === o.id ? '▼' : '▶'}
                      </span>
                    </td>
                  </tr>
                  {expandedOrderId === o.id && (
                    <tr className="bg-muted/30 border-b border-primary/10">
                      <td colSpan={8} className="p-3">
                        <div className="space-y-2">
                          {/* Order Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            <div className="bg-background rounded p-2 border border-border/50">
                              <div className="text-sm font-semibold text-muted-foreground mb-0.5">Order Number</div>
                              <div className="font-bold text-sm">{o.id}</div>
                            </div>
                            <div className="bg-background rounded p-2 border border-border/50">
                              <div className="text-sm font-semibold text-muted-foreground mb-0.5">Customer Name</div>
                              <div className="font-bold text-sm">{o.customer}</div>
                            </div>
                            <div className="bg-background rounded p-2 border border-border/50">
                              <div className="text-sm font-semibold text-muted-foreground mb-0.5">Phone Number</div>
                              <div className="font-bold text-sm">{o.phone || 'Not available'}</div>
                            </div>
                            <div className="bg-background rounded p-2 border border-border/50">
                              <div className="text-sm font-semibold text-muted-foreground mb-0.5">Email</div>
                              <div className="font-bold text-sm">{o.email || 'Not available'}</div>
                            </div>
                            <div className="bg-background rounded p-2 border border-border/50">
                              <div className="text-sm font-semibold text-muted-foreground mb-0.5">Address</div>
                              <div className="font-bold text-sm">{o.address || 'Not available'}</div>
                            </div>
                            <div className="bg-background rounded p-2 border border-border/50">
                              <div className="text-sm font-semibold text-muted-foreground mb-0.5">Product</div>
                              <div className="flex items-center gap-2">
                                {o.product_image ? (
                                  <img 
                                    src={o.product_image} 
                                    alt={o.product_title || 'Product'} 
                                    className="w-12 h-12 rounded object-cover border border-border/50"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center border border-border/50">
                                    <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="font-bold text-sm">{o.product_title || 'Not available'}</div>
                              </div>
                            </div>
                          </div>

                          {/* Actions - Custom Statuses */}
                          <div className="flex flex-wrap gap-2">
                            {customStatuses.map(status => (
                              <button 
                                key={status.id}
                                onClick={() => setStatus(o.id, status.name)} 
                                disabled={o.status === status.name}
                                className="inline-flex items-center rounded px-3 py-2 text-sm font-bold transition-colors shadow h-9 disabled:opacity-30"
                                style={{ 
                                  backgroundColor: status.color,
                                  color: 'white'
                                }}
                              >
                                {status.icon} {status.name}
                              </button>
                            ))}
                            <button 
                              onClick={() => setStatus(o.id, 'cancelled')} 
                              className="inline-flex items-center rounded bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-sm font-bold text-white hover:from-red-600 hover:to-red-700 transition-colors shadow h-9"
                            >
                              ✕ Cancel Order
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
            <h2 className="text-lg font-bold">Add New Order</h2>
            
            <div>
              <label className="text-sm font-bold">Customer Name *</label>
              <input
                type="text"
                value={newOrder.customer_name}
                onChange={(e) => setNewOrder({...newOrder, customer_name: e.target.value})}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary h-9 text-sm"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="text-sm font-bold">Phone Number</label>
              <input
                type="tel"
                value={newOrder.customer_phone}
                onChange={(e) => setNewOrder({...newOrder, customer_phone: e.target.value})}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary h-9 text-sm"
                placeholder="+213..."
              />
            </div>

            <div>
              <label className="text-sm font-bold">Email</label>
              <input
                type="email"
                value={newOrder.customer_email}
                onChange={(e) => setNewOrder({...newOrder, customer_email: e.target.value})}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary h-9 text-sm"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="text-sm font-bold">Address</label>
              <input
                type="text"
                value={newOrder.customer_address}
                onChange={(e) => setNewOrder({...newOrder, customer_address: e.target.value})}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary h-9 text-sm"
                placeholder="Enter address"
              />
            </div>

            <div>
              <label className="text-sm font-bold">Total *</label>
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
                Cancel
              </button>
              <button
                onClick={handleAddOrder}
                className="flex-1 px-3 py-2 rounded bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold hover:from-green-600 hover:to-green-700 transition-colors shadow h-9"
              >
                Add Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Manager Modal */}
      {showStatusManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-card rounded-lg border border-primary/20 shadow-xl max-w-md w-full p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Manage Order Statuses</h2>
              <button 
                onClick={() => setShowStatusManager(false)}
                className="p-1 rounded hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Existing Statuses */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-muted-foreground">Current Statuses</h3>
              {customStatuses.map(status => (
                <div 
                  key={status.id}
                  className="flex items-center justify-between p-2 rounded border border-border/50 bg-background"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: status.color }}
                    >
                      {status.icon}
                    </div>
                    <span className="font-bold">{status.name}</span>
                    {status.counts_as_revenue && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">💰 Revenue</span>
                    )}
                  </div>
                  {!status.is_default && (
                    <button
                      onClick={() => handleDeleteStatus(status.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Status */}
            <div className="space-y-3 pt-3 border-t border-border/50">
              <h3 className="text-sm font-bold text-muted-foreground">Add New Status</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  placeholder="Status name"
                />
                <input
                  type="color"
                  value={newStatusColor}
                  onChange={(e) => setNewStatusColor(e.target.value)}
                  className="w-10 h-10 rounded border border-border/50 cursor-pointer"
                />
                <select
                  value={newStatusIcon}
                  onChange={(e) => setNewStatusIcon(e.target.value)}
                  className="px-2 py-2 rounded border border-border/50 bg-background text-sm"
                >
                  <option value="●">●</option>
                  <option value="✓">✓</option>
                  <option value="✕">✕</option>
                  <option value="◐">◐</option>
                  <option value="📦">📦</option>
                  <option value="🚚">🚚</option>
                  <option value="⏳">⏳</option>
                  <option value="💰">💰</option>
                  <option value="📞">📞</option>
                  <option value="🔄">🔄</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newStatusCountsAsRevenue}
                  onChange={(e) => setNewStatusCountsAsRevenue(e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-green-500"
                />
                <span className="text-sm">💰 Count as revenue (orders with this status count toward revenue)</span>
              </label>
              <button
                onClick={handleAddStatus}
                disabled={!newStatusName.trim()}
                className="w-full px-3 py-2 rounded bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold hover:from-purple-600 hover:to-purple-700 transition-colors shadow disabled:opacity-50"
              >
                <Plus className="h-4 w-4 inline mr-1" /> Add Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
