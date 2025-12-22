import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Store,
  AlertCircle,
  Activity,
  Eye,
  Shield,
  BarChart3,
  Settings,
  MessageCircle,
  Lock,
  LogOut,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Zap,
  Award,
  Search,
  CreditCard
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GradientCard } from '@/components/ui/GradientCard';
import { Button } from '@/components/ui/button';
import AdminChats from './admin/Chats';

interface PlatformStats {
  totalUsers: number;
  totalClients: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  pendingOrders: number;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  user_type: string;
  created_at: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  seller_name: string;
  seller_email: string;
  status: string;
  views: number;
  created_at: string;
  images?: string[];
  flagged?: boolean;
  flag_reason?: string;
}

interface ActivityLog {
  id: number;
  client_id: number;
  staff_id?: number;
  action: string;
  resource_type: string;
  timestamp: string;
}

interface Store {
  id: number;
  email: string;
  store_name: string;
  store_slug: string;
  subscription_status?: string;
  paid_until?: string;
  created_at: string;
}

interface StaffMember {
  id: number;
  store_id: number;
  email: string;
  role: string;
  status: string;
  store_name: string;
  owner_email: string;
  created_at: string;
}

export default function PlatformAdmin() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalClients: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    pendingOrders: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stores' | 'products' | 'activity' | 'settings' | 'billing' | 'payment-failures' | 'chats'>('overview');
  const [billingMetrics, setBillingMetrics] = useState<any>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<any>(null);
  const [converting, setConverting] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [flaggedProductId, setFlaggedProductId] = useState<number | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagNotes, setFlagNotes] = useState('');
  const [flagging, setFlagging] = useState(false);
  const [paymentFailures, setPaymentFailures] = useState<any[]>([]);
  const [failuresLoading, setFailuresLoading] = useState(false);
  const [retryingPayment, setRetryingPayment] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [bulkModeratingProducts, setBulkModeratingProducts] = useState(false);

  useEffect(() => {
    loadPlatformData();
    const interval = setInterval(() => {
      if (activeTab === 'activity') loadActivityLogs();
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadPlatformData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const [usersRes, productsRes, statsRes, storesRes, activityRes, staffRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/products', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch('/api/admin/stores', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch('/api/admin/activity-logs', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch('/api/admin/staff', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);

        const clients = usersData.filter((u: User) => u.user_type === 'client').length;

        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          totalClients: clients,
        }));
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);

        const activeProducts = productsData.filter((p: Product) => p.status === 'active').length;

        setStats(prev => ({
          ...prev,
          totalProducts: productsData.length,
          activeProducts,
        }));
      }

      if (storesRes && storesRes.ok) {
        const storesData = await storesRes.json();
        setStores(storesData || []);
      } else if (storesRes) {
        console.error('Failed to load stores:', storesRes.status, storesRes.statusText);
      }

      if (activityRes && activityRes.ok) {
        const activityData = await activityRes.json();
        setActivityLogs(activityData || []);
      }

      if (staffRes && staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData || []);
      }

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(prev => ({
          ...prev,
          ...statsData,
        }));
      }
    } catch (error) {
      console.error('Failed to load platform data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/activity-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data || []);
      }
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    }
  };

  const loadBillingMetrics = async () => {
    setBillingLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/billing/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBillingMetrics(data);
      }
    } catch (error) {
      console.error('Failed to load billing metrics:', error);
    } finally {
      setBillingLoading(false);
    }
  };

  const loadPlatformSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/billing/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlatformSettings(data);
      }
    } catch (error) {
      console.error('Failed to load platform settings:', error);
    }
  };

  const loadPaymentFailures = async () => {
    setFailuresLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/billing/admin/payment-failures', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentFailures(data || []);
      }
    } catch (error) {
      console.error('Failed to load payment failures:', error);
    } finally {
      setFailuresLoading(false);
    }
  };

  const handlePaymentRetry = async (transactionId: string) => {
    if (!confirm('Retry payment for this transaction?')) return;
    
    setRetryingPayment(transactionId as any);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/billing/admin/retry-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transactionId }),
      });

      if (res.ok) {
        await loadPaymentFailures();
        alert('Payment retry initiated');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to retry payment');
      }
    } catch (error) {
      console.error('Error retrying payment:', error);
      alert('Error retrying payment');
    } finally {
      setRetryingPayment(null);
    }
  };

  const handleBulkRemoveProducts = async () => {
    if (selectedProducts.size === 0) {
      alert('Please select products to remove');
      return;
    }

    const confirmRemove = confirm(`Are you sure you want to remove ${selectedProducts.size} product(s)? This action cannot be undone.`);
    if (!confirmRemove) return;

    setBulkModeratingProducts(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/bulk-remove-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productIds: Array.from(selectedProducts) }),
      });

      if (res.ok) {
        await loadPlatformData();
        setSelectedProducts(new Set());
        alert('Products removed successfully');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to remove products');
      }
    } catch (error) {
      console.error('Error removing products:', error);
      alert('Error removing products');
    } finally {
      setBulkModeratingProducts(false);
    }
  };

  const handleBulkSuspendStores = async () => {
    // Get stores of selected products
    const storeEmails = new Set(
      Array.from(selectedProducts).map(productId => {
        const product = products.find(p => p.id === productId);
        return product?.seller_email;
      }).filter(Boolean)
    );

    if (storeEmails.size === 0) {
      alert('Please select products to suspend stores');
      return;
    }

    const confirmSuspend = confirm(`Suspend stores owned by ${storeEmails.size} seller(s)? They will lose store access until reinstated.`);
    if (!confirmSuspend) return;

    setBulkModeratingProducts(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/bulk-suspend-stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sellerEmails: Array.from(storeEmails) }),
      });

      if (res.ok) {
        await loadPlatformData();
        setSelectedProducts(new Set());
        alert('Stores suspended successfully');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to suspend stores');
      }
    } catch (error) {
      console.error('Error suspending stores:', error);
      alert('Error suspending stores');
    } finally {
      setBulkModeratingProducts(false);
    }
  };

  const handlePromoteToAdmin = async (userId: number) => {
    if (!confirm('Are you sure you want to promote this user to admin?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        await loadPlatformData();
        alert('User promoted to admin successfully');
      }
    } catch (error) {
      console.error('Failed to promote user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this user account? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await loadPlatformData();
        alert('User deleted successfully');
      } else {
        const txt = await res.text();
        alert(`Failed to delete user: ${txt}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleConvertToSeller = async (userId: number) => {
    setConverting(userId);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/users/${userId}/convert-to-seller`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        await loadPlatformData();
        alert(`User converted to seller. Temporary password: ${data.temp_password}`);
      } else {
        const txt = await res.text();
        alert(`Failed to convert: ${txt}`);
      }
    } catch (e) {
      console.error('Convert to seller failed:', e);
      alert('Failed to convert user to seller');
    } finally {
      setConverting(null);
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this staff member? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/staff/${staffId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await loadPlatformData();
        alert('Staff member deleted successfully');
      } else {
        const txt = await res.text();
        alert(`Failed to delete staff member: ${txt}`);
      }
    } catch (error) {
      console.error('Failed to delete staff:', error);
      alert('Failed to delete staff member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-lg font-semibold">{t('loading') || 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Premium Admin Header - Responsive */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden shadow-2xl border-b border-emerald-500/30">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 animate-pulse"></div>
        </div>
        
        {/* Glowing Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse hidden lg:block"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse hidden lg:block" style={{animationDelay: '2s'}}></div>
        
        <div className="container relative mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 w-full sm:flex-1">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-white/30 rounded-lg sm:rounded-2xl blur-xl"></div>
                <div className="relative w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 rounded-lg sm:rounded-2xl bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-2xl">
                  <Zap className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 text-white drop-shadow-lg" strokeWidth={2} />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black drop-shadow-lg truncate">Platform Control</h1>
                <p className="text-white/90 text-xs sm:text-sm font-semibold drop-shadow truncate">Management & Analytics</p>
              </div>
            </div>
            
            {/* Quick Stats - Responsive */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-wrap justify-end w-full sm:w-auto">
              <div className="hidden sm:block px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 transition-all">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Users className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="text-xs sm:text-sm font-bold whitespace-nowrap">{stats.totalUsers}</span>
                </div>
              </div>
              <div className="hidden md:block px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 transition-all">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Store className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="text-xs sm:text-sm font-bold whitespace-nowrap">{stats.totalClients}</span>
                </div>
              </div>
              <div className="hidden lg:block px-3 lg:px-4 py-1 lg:py-2 rounded-lg lg:rounded-xl bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 transition-all">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-bold">{stats.totalProducts}</span>
                </div>
              </div>
              <Button 
                size="sm"
                className="text-white bg-white/20 hover:bg-white/30 border border-white/40 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto"
                onClick={() => window.location.href = '/'}
              >
                <LogOut className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Enhanced Navigation Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 bg-slate-800/50 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-700/50 p-1 sm:p-2 shadow-lg overflow-x-auto">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3"
          >
            <BarChart3 className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">OVR</span>
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3"
          >
            <Users className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden">U</span>
          </Button>
          <Button
            variant={activeTab === 'stores' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('stores')}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3"
          >
            <Store className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Stores</span>
            <span className="sm:hidden">S</span>
          </Button>
          <Button
            variant={activeTab === 'products' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('products')}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3"
          >
            <Package className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Products</span>
            <span className="sm:hidden">P</span>
          </Button>
          <Button
            variant={activeTab === 'activity' ? 'default' : 'ghost'}
            onClick={() => { setActiveTab('activity'); loadActivityLogs(); }}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3"
          >
            <Activity className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Activity</span>
            <span className="sm:hidden">A</span>
          </Button>
          <Button
            variant={activeTab === 'billing' ? 'default' : 'ghost'}
            onClick={() => { 
              setActiveTab('billing');
              loadBillingMetrics();
              loadPlatformSettings();
            }}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3"
          >
            <CreditCard className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Billing</span>
            <span className="sm:hidden">B</span>
          </Button>
          <Button
            variant={activeTab === 'payment-failures' ? 'default' : 'ghost'}
            onClick={() => { 
              setActiveTab('payment-failures');
              loadPaymentFailures();
            }}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3"
          >
            <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden md:inline">Failures</span>
            <span className="md:hidden">F</span>
          </Button>
          <Button
            variant={activeTab === 'chats' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('chats')}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3"
          >
            <MessageCircle className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Chats</span>
            <span className="sm:hidden">C</span>
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('settings')}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3"
          >
            <Settings className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">ST</span>
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Premium Stats Grid - Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-lg border border-blue-500/30 hover:shadow-xl hover:border-blue-400/50 transition-all">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-blue-200 text-xs sm:text-sm font-semibold mb-1 truncate">Total Users</p>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black">{stats.totalUsers}</h3>
                    <p className="text-blue-300 text-xs mt-1 truncate">Platform wide</p>
                  </div>
                  <Users className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 text-blue-300 opacity-20 flex-shrink-0" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-lg border border-emerald-500/30 hover:shadow-xl hover:border-emerald-400/50 transition-all">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-emerald-200 text-xs sm:text-sm font-semibold mb-1 truncate">Active Stores</p>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black">{stats.totalClients}</h3>
                    <p className="text-emerald-300 text-xs mt-1 truncate">Subscribed</p>
                  </div>
                  <Store className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 text-emerald-300 opacity-20 flex-shrink-0" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-lg border border-purple-500/30 hover:shadow-xl hover:border-purple-400/50 transition-all">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-purple-200 text-xs sm:text-sm font-semibold mb-1 truncate">Total Products</p>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black">{stats.totalProducts}</h3>
                    <p className="text-purple-300 text-xs mt-1">{stats.activeProducts} active</p>
                  </div>
                  <Package className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 text-purple-300 opacity-20 flex-shrink-0" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-white shadow-lg border border-orange-500/30 hover:shadow-xl hover:border-orange-400/50 transition-all">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-orange-200 text-xs sm:text-sm font-semibold mb-1 truncate">Pending Orders</p>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black">{stats.pendingOrders}</h3>
                    <p className="text-orange-300 text-xs mt-1">Awaiting</p>
                  </div>
                  <ShoppingBag className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 text-orange-300 opacity-20 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg sm:rounded-xl border border-slate-700/50 p-3 sm:p-4 shadow-md hover:bg-slate-800/70 transition-all">
                <p className="text-slate-400 text-xs font-medium mb-2">Total Orders</p>
                <h3 className="text-xl sm:text-2xl font-bold text-cyan-400">{stats.totalOrders}</h3>
                <p className="text-slate-500 text-xs mt-1">All time</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg sm:rounded-xl border border-slate-700/50 p-3 sm:p-4 shadow-md hover:bg-slate-800/70 transition-all">
                <p className="text-slate-400 text-xs font-medium mb-2">Total Revenue</p>
                <h3 className="text-xl sm:text-2xl font-bold text-emerald-400">${(stats.totalRevenue / 1000).toFixed(0)}K</h3>
                <p className="text-slate-500 text-xs mt-1">Generated</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg sm:rounded-xl border border-slate-700/50 p-3 sm:p-4 shadow-md hover:bg-slate-800/70 transition-all">
                <p className="text-slate-400 text-xs font-medium mb-2">Seller Count</p>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-400">{stats.totalSellers}</h3>
                <p className="text-slate-500 text-xs mt-1">Active sellers</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg sm:rounded-xl border border-slate-700/50 p-3 sm:p-4 shadow-md hover:bg-slate-800/70 transition-all">
                <p className="text-slate-400 text-xs font-medium mb-2">Avg Products</p>
                <h3 className="text-xl sm:text-2xl font-bold text-purple-400">
                  {stats.totalClients > 0 ? (stats.totalProducts / stats.totalClients).toFixed(1) : 0}
                </h3>
                <p className="text-slate-500 text-xs mt-1">Per store</p>
              </div>
            </div>

            {/* Quick Insights - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Activity */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-700/50 shadow-lg p-4 sm:p-5 lg:p-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Activity className="w-4 sm:w-5 h-4 sm:h-5 text-cyan-400" />
                  Recent Activity
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-slate-700/50 last:border-0">
                      <div className="w-2 h-2 mt-1 sm:mt-2 rounded-full bg-cyan-400 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-white font-medium truncate">{log.action}</p>
                        <p className="text-xs text-slate-400">{log.resource_type}</p>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Health */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-700/50 shadow-lg p-4 sm:p-5 lg:p-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400" />
                  Platform Health
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm text-slate-300">System Status</span>
                      <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-emerald-400" />
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{width: '95%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm text-slate-300">Active Connections</span>
                      <span className="text-xs sm:text-sm font-bold text-cyan-400">{stats.totalClients}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm text-slate-300">Database Usage</span>
                      <span className="text-xs sm:text-sm font-bold text-purple-400">42%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400" style={{width: '42%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Admins */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-red-600/20 to-pink-600/20">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  Super Admins ({users.filter(u => u.user_type === 'admin').length})
                </h3>
              </div>
              <div className="divide-y divide-slate-700/50 max-h-96 overflow-auto">
                {users.filter(u => u.user_type === 'admin').map((user) => (
                  <div key={user.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Badge className="bg-red-500/80 text-white">Admin</Badge>
                    </div>
                    <Button size="sm" variant="destructive" className="w-full text-xs" onClick={() => handleDeleteUser(user.id)}>
                      Delete
                    </Button>
                  </div>
                ))}
                {users.filter(u => u.user_type === 'admin').length === 0 && (
                  <div className="p-6 text-sm text-slate-400 text-center">No admins</div>
                )}
              </div>
            </div>

            {/* Store Owners */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-emerald-600/20 to-teal-600/20">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-400" />
                  Store Owners ({users.filter(u => u.user_type === 'client').length})
                </h3>
              </div>
              <div className="divide-y divide-slate-700/50 max-h-96 overflow-auto">
                {users.filter(u => u.user_type === 'client').map((user) => (
                  <div key={user.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Badge className="bg-emerald-500/80 text-white">Client</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handlePromoteToAdmin(user.id)}>
                        Promote
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1 text-xs" onClick={() => handleDeleteUser(user.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {users.filter(u => u.user_type === 'client').length === 0 && (
                  <div className="p-6 text-sm text-slate-400 text-center">No store owners</div>
                )}
              </div>
            </div>

            {/* Managers/Staff */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Managers ({staff.length})
                </h3>
              </div>
              <div className="divide-y divide-slate-700/50 max-h-96 overflow-auto">
                {staff.map((staffMember) => (
                  <div key={staffMember.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">{staffMember.email}</p>
                        <p className="text-xs text-slate-400 truncate">{staffMember.store_name}</p>
                        <p className="text-xs text-slate-500">Owner: {staffMember.owner_email}</p>
                      </div>
                      <Badge className={staffMember.status === 'active' ? 'bg-blue-500/80 text-white' : 'bg-slate-500/80 text-white'}>
                        {staffMember.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="destructive" className="w-full text-xs" onClick={() => handleDeleteStaff(staffMember.id)}>
                      Delete
                    </Button>
                  </div>
                ))}
                {staff.length === 0 && (
                  <div className="p-6 text-sm text-slate-400 text-center">No managers</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {activeTab === 'stores' && (
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-400" />
                All Stores
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30 border-b border-slate-600/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-300">Store Name</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Email</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Slug</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No stores found
                      </td>
                    </tr>
                  ) : (
                    stores.map((store) => (
                      <tr key={store.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="p-4 font-medium text-white">{store.store_name}</td>
                        <td className="p-4 text-slate-300 text-sm">{store.email}</td>
                        <td className="p-4 text-slate-400 text-sm font-mono">{store.store_slug}</td>
                        <td className="p-4">
                          <Badge className={store.subscription_status === 'active' ? 'bg-emerald-500/80' : 'bg-red-500/80'}>
                            {store.subscription_status || 'Free'}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-400 text-sm">{new Date(store.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment Failures Tab */}
        {activeTab === 'payment-failures' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-md rounded-2xl border border-red-500/30 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total Failed Payments</p>
                    <p className="text-3xl font-bold text-red-400">
                      {paymentFailures.filter(p => p.status === 'failed').length}
                    </p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/30 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Pending Retries</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {paymentFailures.filter(p => p.status === 'pending_retry').length}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-md rounded-2xl border border-orange-500/30 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Lost Revenue</p>
                    <p className="text-3xl font-bold text-orange-400">
                      ${paymentFailures.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-orange-500/40" />
                </div>
              </div>
            </div>

            {/* Payment Failures List */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 bg-slate-900/80">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Failed Payment Transactions
                </h3>
                <p className="text-sm text-slate-400 mt-2">Review and retry failed payments from store owners</p>
              </div>

              {failuresLoading ? (
                <div className="p-8 text-center">
                  <p className="text-slate-400">Loading payment failures...</p>
                </div>
              ) : paymentFailures.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
                  <p className="text-slate-400">No payment failures detected</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50 bg-slate-900/50">
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Transaction ID</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Store Owner</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Amount</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Failure Reason</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Status</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Last Attempted</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {paymentFailures.map((failure) => (
                        <tr key={failure.id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="p-4 text-slate-300 text-sm font-mono">{failure.transaction_id?.substring(0, 12)}...</td>
                          <td className="p-4 text-slate-400 text-sm">{failure.store_owner_email || 'Unknown'}</td>
                          <td className="p-4 text-slate-300 text-sm font-bold">${failure.amount?.toFixed(2) || '0.00'}</td>
                          <td className="p-4 text-slate-400 text-sm">
                            <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">
                              {failure.failure_reason || 'Unknown'}
                            </span>
                          </td>
                          <td className="p-4 text-sm">
                            {failure.status === 'failed' && (
                              <Badge className="bg-red-600 text-white">Failed</Badge>
                            )}
                            {failure.status === 'pending_retry' && (
                              <Badge className="bg-yellow-600 text-white">Pending Retry</Badge>
                            )}
                            {failure.status === 'retry_scheduled' && (
                              <Badge className="bg-blue-600 text-white">Scheduled</Badge>
                            )}
                          </td>
                          <td className="p-4 text-slate-400 text-sm">{new Date(failure.updated_at || failure.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-sm flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handlePaymentRetry(failure.transaction_id)}
                              disabled={retryingPayment === failure.transaction_id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              {retryingPayment === failure.transaction_id ? 'Retrying...' : 'Retry'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-slate-300 border-slate-600 hover:border-slate-500"
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Retry History */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                Automatic Retry Schedule
              </h3>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>First Retry: 5 minutes after failure</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Second Retry: 15 minutes after first retry</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Third Retry: 1 hour after second retry</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Final Retry: 24 hours after third retry</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">If all automatic retries fail, manual action is required.</p>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  All Products ({products.length})
                </h3>
                {selectedProducts.size > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full">
                      {selectedProducts.size} selected
                    </span>
                    <Button
                      onClick={() => setSelectedProducts(new Set())}
                      variant="ghost"
                      className="text-slate-300 hover:text-white"
                      size="sm"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white text-sm">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white text-sm flex-1 min-w-48"
                />
              </div>

              {/* Bulk Action Buttons */}
              {selectedProducts.size > 0 && (
                <div className="flex gap-2 pt-4 mt-4 border-t border-slate-700/50">
                  <Button
                    onClick={handleBulkRemoveProducts}
                    disabled={bulkModeratingProducts}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove {selectedProducts.size} Product(s)
                  </Button>
                  <Button
                    onClick={handleBulkSuspendStores}
                    disabled={bulkModeratingProducts}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-sm"
                    size="sm"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Suspend Store(s)
                  </Button>
                  {bulkModeratingProducts && (
                    <span className="text-sm text-slate-400 flex items-center">Processing...</span>
                  )}
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30 border-b border-slate-600/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-300 w-12">
                      <input 
                        type="checkbox"
                        checked={selectedProducts.size === products.length && products.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts(new Set(products.map(p => p.id)));
                          } else {
                            setSelectedProducts(new Set());
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                    </th>
                    <th className="text-left p-4 font-semibold text-slate-300">Image</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Product</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Seller</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Price</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Views</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {products.filter(p =>
                    (filterStatus === 'all' || p.status === filterStatus) &&
                    p.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((product) => {
                    const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;
                    const isSelected = selectedProducts.has(product.id);
                    return (
                    <tr key={product.id} className={`hover:bg-slate-700/20 transition-colors ${isSelected ? 'bg-slate-700/40' : ''}`}>
                      <td className="p-4">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newSelected = new Set(selectedProducts);
                            if (e.target.checked) {
                              newSelected.add(product.id);
                            } else {
                              newSelected.delete(product.id);
                            }
                            setSelectedProducts(newSelected);
                          }}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="p-4">
                        {firstImage ? (
                          <img 
                            src={firstImage} 
                            alt={product.title}
                            className="w-16 h-16 rounded-lg object-cover border border-slate-600/50"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-slate-700/50 border border-slate-600/50 flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-500" />
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-medium text-white truncate max-w-xs">{product.title}</td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium text-slate-300">{product.seller_name}</p>
                          <p className="text-xs text-slate-500">{product.seller_email}</p>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-emerald-400">${product.price}</td>
                      <td className="p-4">
                        <Badge className={product.status === 'active' ? 'bg-emerald-500/80' : product.flagged ? 'bg-red-500/80' : 'bg-slate-500/80'}>
                          {product.flagged ? 'Flagged' : product.status}
                        </Badge>
                      </td>
                      <td className="p-4 flex items-center gap-1 text-slate-300">
                        <Eye className="w-4 h-4" />
                        {product.views}
                      </td>
                      <td className="p-4">
                        <Button
                          onClick={() => {
                            setFlaggedProductId(product.id);
                            setFlagReason(product.flag_reason || '');
                            setShowFlagModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg transition-colors"
                        >
                          {product.flagged ? 'Unflag' : 'Flag'}
                        </Button>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'activity' && (
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden font-mono">
            <div className="p-6 border-b border-slate-700/50 bg-slate-900/80">
              <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                $ activity_logs --stream
              </h3>
              <p className="text-xs text-slate-500 mt-2">Live system activity - Press Ctrl+C to exit</p>
            </div>
            <div className="p-6 max-h-[600px] overflow-auto bg-black/60">
              {activityLogs.length === 0 ? (
                <div className="text-slate-500 text-sm">
                  <div>$ activity_logs --stream</div>
                  <div className="text-slate-600 mt-2">waiting for events...</div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-slate-500 text-sm mb-4">
                    $ tail -f /var/log/ecopro/activity.log
                  </div>
                  {activityLogs.map((log, idx) => {
                    const timestamp = new Date(log.timestamp).toLocaleTimeString();
                    const date = new Date(log.timestamp).toLocaleDateString();
                    const actor = log.staff_id ? `staff_${log.staff_id}` : 'owner';
                    const color = log.action.includes('create') ? 'text-green-400' : 
                                 log.action.includes('delete') ? 'text-red-400' :
                                 log.action.includes('update') ? 'text-yellow-400' : 
                                 'text-cyan-400';
                    
                    return (
                      <div key={log.id} className={`text-xs ${color} hover:bg-slate-800/50 p-2 rounded transition-colors`}>
                        <span className="text-slate-500">[{date} {timestamp}]</span>
                        {' '}
                        <span className="text-slate-400">{actor}</span>
                        {' '}
                        <span className="text-slate-300">→</span>
                        {' '}
                        <span className="font-semibold">{log.action}</span>
                        {' '}
                        <span className="text-slate-500">({log.resource_type})</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chats Tab */}
        {activeTab === 'chats' && (
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
            <AdminChats />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Main Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Platform Limits */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Platform Limits
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-slate-900/30 rounded-lg p-3 sm:p-4 border border-slate-600/30">
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Max Users</label>
                    <div className="flex items-center gap-2">
                      <input type="number" defaultValue="10000" className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                      <span className="text-slate-400 text-xs sm:text-sm">Current: {stats.totalUsers}</span>
                    </div>
                  </div>
                  <div className="bg-slate-900/30 rounded-lg p-3 sm:p-4 border border-slate-600/30">
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Max Stores</label>
                    <div className="flex items-center gap-2">
                      <input type="number" defaultValue="5000" className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                      <span className="text-slate-400 text-xs sm:text-sm">Current: {stats.totalClients}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs sm:text-sm">
                    <Zap className="w-4 h-4 mr-2" />
                    Save Limits
                  </Button>
                </div>
              </div>

              {/* Subscription Settings */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Subscription Settings
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-slate-900/30 rounded-lg p-3 sm:p-4 border border-slate-600/30">
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Monthly Price ($)</label>
                    <input type="number" step="0.01" defaultValue="7" className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                  </div>
                  <div className="bg-slate-900/30 rounded-lg p-3 sm:p-4 border border-slate-600/30">
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Free Trial Days</label>
                    <input type="number" defaultValue="30" className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm">
                    <Zap className="w-4 h-4 mr-2" />
                    Save Subscription Settings
                  </Button>
                </div>
              </div>

              {/* Email & Notifications */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Email Configuration
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-slate-900/30 rounded-lg p-3 sm:p-4 border border-slate-600/30">
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Admin Email</label>
                    <input type="email" placeholder="admin@ecopro.com" defaultValue="admin@ecopro.com" className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
                  </div>
                  <div className="bg-slate-900/30 rounded-lg p-3 sm:p-4 border border-slate-600/30">
                    <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Support Email</label>
                    <input type="email" placeholder="support@ecopro.com" className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
                  </div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-700 border-slate-600" />
                      Payment alerts
                    </label>
                  </div>
                </div>
              </div>

              {/* Security & Compliance */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" />
                  Security Options
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm cursor-pointer p-2 hover:bg-slate-700/30 rounded-lg transition-all">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-700 border-slate-600" />
                    Enable 2FA for admins
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm cursor-pointer p-2 hover:bg-slate-700/30 rounded-lg transition-all">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-700 border-slate-600" />
                    Enable IP whitelist
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm cursor-pointer p-2 hover:bg-slate-700/30 rounded-lg transition-all">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-700 border-slate-600" />
                    Enable audit logging
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm cursor-pointer p-2 hover:bg-slate-700/30 rounded-lg transition-all">
                    <input type="checkbox" className="w-4 h-4 rounded bg-slate-700 border-slate-600" />
                    Enable maintenance mode
                  </label>
                </div>
              </div>
            </div>

            {/* System Maintenance */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-700/50 shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-400" />
                System Maintenance
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <Button variant="outline" className="text-slate-200 text-xs sm:text-sm p-2 sm:p-3 h-auto flex flex-col items-center justify-center gap-1 sm:gap-2">
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs">Clear Cache</span>
                </Button>
                <Button variant="outline" className="text-slate-200 text-xs sm:text-sm p-2 sm:p-3 h-auto flex flex-col items-center justify-center gap-1 sm:gap-2">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs">Export DB</span>
                </Button>
                <Button variant="outline" className="text-slate-200 text-xs sm:text-sm p-2 sm:p-3 h-auto flex flex-col items-center justify-center gap-1 sm:gap-2">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs">Audit Log</span>
                </Button>
                <Button variant="destructive" className="text-xs sm:text-sm p-2 sm:p-3 h-auto flex flex-col items-center justify-center gap-1 sm:gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs">Emergency</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Billing Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Monthly Revenue (MRR)</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      ${billingMetrics?.mrr?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-emerald-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-md rounded-2xl border border-blue-500/30 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Active Subscriptions</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {billingMetrics?.active_subscriptions || 0}
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-blue-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-md rounded-2xl border border-orange-500/30 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Unpaid Subscriptions</p>
                    <p className="text-3xl font-bold text-orange-400">
                      {billingMetrics?.unpaid_count || 0}
                    </p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-orange-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">New Signups (This Month)</p>
                    <p className="text-3xl font-bold text-purple-400">
                      {billingMetrics?.new_signups || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-500/40" />
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-lg">
                <p className="text-sm text-slate-400 mb-2">Churn Rate</p>
                <p className="text-2xl font-bold text-red-400">
                  {billingMetrics?.churn_rate?.toFixed(1) || '0.0'}%
                </p>
                <p className="text-xs text-slate-500 mt-2">Cancelled this month</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-lg">
                <p className="text-sm text-slate-400 mb-2">Failed Payments</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {billingMetrics?.failed_payments || 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">Need retry</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-lg">
                <p className="text-sm text-slate-400 mb-2">Expired Subscriptions</p>
                <p className="text-2xl font-bold text-red-500">
                  {billingMetrics?.expired_count || 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">Account locked</p>
              </div>
            </div>

            {/* Subscription Breakdown */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 bg-slate-900/80">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Subscription Status Breakdown
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">Trial Active</span>
                      <span className="text-2xl font-bold text-blue-400">{billingMetrics?.trial_count || 0}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{width: `${((billingMetrics?.trial_count || 0) / Math.max((billingMetrics?.active_subscriptions || 1) + (billingMetrics?.trial_count || 0) + (billingMetrics?.expired_count || 0), 1) * 100)}%`}}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">Active Paid</span>
                      <span className="text-2xl font-bold text-emerald-400">{billingMetrics?.active_subscriptions || 0}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full" 
                        style={{width: `${((billingMetrics?.active_subscriptions || 0) / Math.max((billingMetrics?.active_subscriptions || 1) + (billingMetrics?.trial_count || 0) + (billingMetrics?.expired_count || 0), 1) * 100)}%`}}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">Expired</span>
                      <span className="text-2xl font-bold text-red-400">{billingMetrics?.expired_count || 0}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{width: `${((billingMetrics?.expired_count || 0) / Math.max((billingMetrics?.active_subscriptions || 1) + (billingMetrics?.trial_count || 0) + (billingMetrics?.expired_count || 0), 1) * 100)}%`}}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 bg-slate-900/80">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  Platform Settings
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {platformSettings ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Max Users Limit
                        </label>
                        <p className="text-2xl font-bold text-white">
                          {platformSettings.max_users || 1000}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Current: {stats.totalUsers} registered</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Max Stores Limit
                        </label>
                        <p className="text-2xl font-bold text-white">
                          {platformSettings.max_stores || 1000}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Current: {stats.totalClients} stores</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Subscription Price
                        </label>
                        <p className="text-2xl font-bold text-emerald-400">
                          ${platformSettings.subscription_price || 7}/month
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Free Trial Days
                        </label>
                        <p className="text-2xl font-bold text-blue-400">
                          {platformSettings.trial_days || 30} days
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4">
                      Last updated: {new Date(platformSettings.updated_at).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400">Loading settings...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Flag Product Modal */}
        {showFlagModal && flaggedProductId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-400" />
                Flag Product for Review
              </h3>
              <p className="text-slate-300 text-sm mb-4">
                {products.find(p => p.id === flaggedProductId)?.title}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Reason for Flagging</label>
                  <select 
                    value={flagReason} 
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                  >
                    <option value="">Select a reason...</option>
                    <option value="inappropriate_content">Inappropriate Content</option>
                    <option value="illegal_item">Illegal Item (Weapons, Drugs, etc)</option>
                    <option value="counterfeit">Counterfeit/Fake Product</option>
                    <option value="stolen_goods">Stolen Goods</option>
                    <option value="hate_speech">Hate Speech/Offensive Content</option>
                    <option value="scam">Possible Scam</option>
                    <option value="sexual_content">Sexual/Adult Content</option>
                    <option value="violence">Violence/Harm</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Additional Notes</label>
                  <textarea 
                    value={flagNotes}
                    onChange={(e) => setFlagNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                    rows={3}
                    placeholder="Provide details about why this product should be reviewed..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowFlagModal(false);
                      setFlagReason('');
                      setFlagNotes('');
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                    disabled={flagging}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!flagReason) {
                        alert('Please select a reason');
                        return;
                      }

                      setFlagging(true);
                      try {
                        const token = localStorage.getItem('authToken');
                        const response = await fetch('/api/admin/flag-product', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            productId: flaggedProductId,
                            reason: flagReason,
                            description: flagNotes
                          })
                        });

                        if (response.ok) {
                          // Update product in state to show flagged
                          setProducts(products.map(p => 
                            p.id === flaggedProductId 
                              ? { ...p, flagged: true, flag_reason: flagReason }
                              : p
                          ));
                          setShowFlagModal(false);
                          setFlagReason('');
                          setFlagNotes('');
                          alert('Product flagged for review. Admin team will review shortly.');
                        } else {
                          const error = await response.json();
                          alert(error.error || 'Failed to flag product');
                        }
                      } catch (err) {
                        console.error('Error flagging product:', err);
                        alert('Error flagging product');
                      } finally {
                        setFlagging(false);
                      }
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    disabled={flagging}
                  >
                    {flagging ? 'Flagging...' : 'Flag Product'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
