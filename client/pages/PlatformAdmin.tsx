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
  UserCheck,
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products'>('overview');

  useEffect(() => {
    loadPlatformData();
  }, []);

  const loadPlatformData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Fetch users and products in parallel for faster loading
      const [usersRes, productsRes, statsRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        // Only fetch first 20 products for display
        fetch('/api/products?limit=20&offset=0'),
        // Fetch just the counts for stats
        fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null), // Make stats optional
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);

        // Calculate stats from users
        const clients = usersData.filter((u: User) => u.user_type === 'client').length;
        const sellers = usersData.filter((u: User) => u.user_type === 'seller').length;

        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          totalClients: clients,
          totalSellers: sellers,
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

      // Use stats endpoint if available
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Modern Admin Header with Pattern Background */}
      <div className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white overflow-hidden">
        {/* Animated Pattern Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBoLTJ2Mmgydi0yem0wIDI4aC0ydjJoMnYtMnptLTItMmgtMnYyaDJ2LTJ6bS0yLTJoLTJ2Mmgydi0yem0tMi0yaC0ydjJoMnYtMnptLTYgMHYtMmgtMnYyaDJ6bS0yIDJ2LTJoLTJ2MmgyeiIvPjwvZz48L2c+PC9zdmc+')] animate-[slide_20s_linear_infinite]"></div>
        </div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="container relative mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg"></div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-2xl">
                  <Shield className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black drop-shadow-lg">{t('admin.dashboardTitle')}</h1>
                <p className="text-white/90 text-xs font-semibold drop-shadow">{t('admin.dashboardSubtitle')}</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all cursor-pointer">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{stats.totalUsers}</span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all cursor-pointer">
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{stats.totalProducts}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20 border border-white/30"
                onClick={() => window.location.href = '/'}
              >
                {t('admin.exit')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-card rounded-xl border p-2 shadow-sm">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="flex-1"
          >
            <Activity className="w-4 h-4 mr-2" />
            {t('admin.tab.overview')}
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            {t('admin.tab.users', { n: stats.totalUsers })}
          </Button>
          <Button
            variant={activeTab === 'products' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('products')}
            className="flex-1"
          >
            <Package className="w-4 h-4 mr-2" />
            {t('admin.tab.products', { n: stats.totalProducts })}
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-xl border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{t('admin.stats.totalUsers')}</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>

              <div className="bg-card rounded-xl border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-purple-500" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{t('admin.stats.clients')}</p>
                <p className="text-3xl font-bold">{stats.totalClients}</p>
              </div>

              <div className="bg-card rounded-xl border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Store className="w-6 h-6 text-orange-500" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{t('admin.stats.sellers')}</p>
                <p className="text-3xl font-bold">{stats.totalSellers}</p>
              </div>

              <div className="bg-card rounded-xl border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-500" />
                  </div>
                  <Badge variant="secondary">{stats.activeProducts} active</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{t('admin.stats.totalProducts')}</p>
                <p className="text-3xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-card rounded-xl border shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t('admin.recentUsers')}
                  </h2>
                </div>
                <div className="divide-y max-h-96 overflow-auto">
                  {users.slice(0, 10).map((user) => (
                    <div key={user.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={user.user_type === 'admin' ? 'default' : 'secondary'}>
                            {t('user.type.' + user.user_type)}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Products */}
              <div className="bg-card rounded-xl border shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {t('admin.recentProducts')}
                  </h2>
                </div>
                <div className="divide-y max-h-96 overflow-auto">
                  {products.slice(0, 10).map((product) => (
                    <div key={product.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">{product.title}</p>
                          <p className="text-sm text-muted-foreground">{t('admin.bySeller', { name: product.seller_name })}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-primary">{product.price} {t('currency')}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Eye className="w-3 h-3" />
                            {product.views}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{t('admin.allUsers')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">{t('user.name')}</th>
                    <th className="text-left p-4 font-medium">{t('user.email')}</th>
                    <th className="text-left p-4 font-medium">{t('user.type')}</th>
                    <th className="text-left p-4 font-medium">{t('user.role')}</th>
                    <th className="text-left p-4 font-medium">{t('user.joined')}</th>
                    <th className="text-left p-4 font-medium">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4">{user.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        <Badge variant={user.user_type === 'admin' ? 'default' : 'secondary'}>
                          {t('user.type.' + user.user_type)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{t('user.role.' + user.role)}</Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {user.user_type !== 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePromoteToAdmin(user.id)}
                          >
                            {t('admin.promoteToAdmin')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-card rounded-xl border shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">{t('admin.allProducts')}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">{t('product.name')}</th>
                    <th className="text-left p-4 font-medium">{t('product.seller')}</th>
                    <th className="text-left p-4 font-medium">{t('product.price')}</th>
                    <th className="text-left p-4 font-medium">{t('product.status')}</th>
                    <th className="text-left p-4 font-medium">{t('product.views')}</th>
                    <th className="text-left p-4 font-medium">{t('product.created')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium">{product.title}</td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium">{product.seller_name}</p>
                          <p className="text-xs text-muted-foreground">{product.seller_email}</p>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-primary">${product.price}</td>
                      <td className="p-4">
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {t('product.status.' + product.status)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          {product.views}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(product.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
