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
  Lock,
  LogOut,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Zap,
  Award,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GradientCard } from '@/components/ui/GradientCard';
import { Button } from '@/components/ui/button';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stores' | 'products' | 'activity' | 'settings'>('overview');
  const [converting, setConverting] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
        fetch('/api/products?limit=50&offset=0'),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-white text-lg font-semibold">{t('loading') || 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Premium Admin Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden shadow-2xl border-b border-emerald-500/30">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 animate-pulse"></div>
        </div>
        
        {/* Glowing Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="container relative mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-2xl">
                  <Zap className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black drop-shadow-lg">Platform Control</h1>
                <p className="text-white/90 text-sm font-semibold drop-shadow">Complete Platform Management & Analytics</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden xl:flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 transition-all">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-bold">{stats.totalUsers} Users</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 transition-all">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  <span className="text-sm font-bold">{stats.totalClients} Stores</span>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 transition-all">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-bold">{stats.totalProducts} Products</span>
                </div>
              </div>
              <Button 
                size="sm"
                className="text-white bg-white/20 hover:bg-white/30 border border-white/40"
                onClick={() => window.location.href = '/'}
              >
                <LogOut className="w-4 h-4 mr-1" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Navigation Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-2 shadow-lg overflow-x-auto">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="whitespace-nowrap text-slate-200"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="whitespace-nowrap text-slate-200"
          >
            <Users className="w-4 h-4 mr-2" />
            Users ({stats.totalUsers})
          </Button>
          <Button
            variant={activeTab === 'stores' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('stores')}
            className="whitespace-nowrap text-slate-200"
          >
            <Store className="w-4 h-4 mr-2" />
            Stores ({stats.totalClients})
          </Button>
          <Button
            variant={activeTab === 'products' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('products')}
            className="whitespace-nowrap text-slate-200"
          >
            <Package className="w-4 h-4 mr-2" />
            Products ({stats.totalProducts})
          </Button>
          <Button
            variant={activeTab === 'activity' ? 'default' : 'ghost'}
            onClick={() => { setActiveTab('activity'); loadActivityLogs(); }}
            className="whitespace-nowrap text-slate-200"
          >
            <Activity className="w-4 h-4 mr-2" />
            Activity Logs
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('settings')}
            className="whitespace-nowrap text-slate-200"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg border border-blue-500/30 hover:shadow-xl hover:border-blue-400/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm font-semibold mb-1">Total Users</p>
                    <h3 className="text-4xl font-black">{stats.totalUsers}</h3>
                  </div>
                  <Users className="w-12 h-12 text-blue-300 opacity-20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg border border-emerald-500/30 hover:shadow-xl hover:border-emerald-400/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm font-semibold mb-1">Active Stores</p>
                    <h3 className="text-4xl font-black">{stats.totalClients}</h3>
                  </div>
                  <Store className="w-12 h-12 text-emerald-300 opacity-20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg border border-purple-500/30 hover:shadow-xl hover:border-purple-400/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm font-semibold mb-1">Total Products</p>
                    <h3 className="text-4xl font-black">{stats.totalProducts}</h3>
                    <p className="text-purple-300 text-xs mt-1">{stats.activeProducts} active</p>
                  </div>
                  <Package className="w-12 h-12 text-purple-300 opacity-20" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 text-white shadow-lg border border-orange-500/30 hover:shadow-xl hover:border-orange-400/50 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm font-semibold mb-1">Pending Orders</p>
                    <h3 className="text-4xl font-black">{stats.pendingOrders}</h3>
                  </div>
                  <ShoppingBag className="w-12 h-12 text-orange-300 opacity-20" />
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-slate-700/50 last:border-0">
                      <div className="w-2 h-2 mt-2 rounded-full bg-cyan-400"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{log.action}</p>
                        <p className="text-xs text-slate-400">{log.resource_type}</p>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Health */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Platform Health
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">System Status</span>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{width: '95%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">Active Connections</span>
                      <span className="text-sm font-bold text-cyan-400">{stats.totalClients}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">Database Usage</span>
                      <span className="text-sm font-bold text-purple-400">42%</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  {stores.map((store) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                All Products
              </h3>
              <div className="flex gap-2 flex-wrap">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30 border-b border-slate-600/50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-300">Product</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Seller</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Price</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Views</th>
                    <th className="text-left p-4 font-semibold text-slate-300">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {products.filter(p =>
                    (filterStatus === 'all' || p.status === filterStatus) &&
                    p.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((product) => (
                    <tr key={product.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="p-4 font-medium text-white truncate max-w-xs">{product.title}</td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium text-slate-300">{product.seller_name}</p>
                          <p className="text-xs text-slate-500">{product.seller_email}</p>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-emerald-400">${product.price}</td>
                      <td className="p-4">
                        <Badge className={product.status === 'active' ? 'bg-emerald-500/80' : 'bg-slate-500/80'}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="p-4 flex items-center gap-1 text-slate-300">
                        <Eye className="w-4 h-4" />
                        {product.views}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">{new Date(product.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'activity' && (
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Staff Activity Logs
              </h3>
            </div>
            <div className="divide-y divide-slate-700/50 max-h-96 overflow-auto">
              {activityLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-white font-medium">{log.action}</p>
                      <p className="text-sm text-slate-400">{log.resource_type}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline">{log.staff_id ? 'Staff' : 'Owner'}</Badge>
                  </div>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <div className="p-6 text-sm text-slate-400 text-center">No activity logs</div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-yellow-400" />
                Platform Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Max Users</label>
                  <input type="number" defaultValue="10000" className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Max Stores</label>
                  <input type="number" defaultValue="5000" className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Commission Rate (%)</label>
                  <input type="number" step="0.1" defaultValue="5" className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg" />
                </div>
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">Save Settings</Button>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-400" />
                Security & System
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-slate-200">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
                <Button variant="outline" className="w-full justify-start text-slate-200">
                  <Package className="w-4 h-4 mr-2" />
                  Export Database
                </Button>
                <Button variant="outline" className="w-full justify-start text-slate-200">
                  <Award className="w-4 h-4 mr-2" />
                  View Audit Log
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Emergency Mode
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
