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

interface Seller {
  id: number;
  email: string;
  name: string;
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
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products'>('overview');
  const [converting, setConverting] = useState<number | null>(null);

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
      const [usersRes, productsRes, statsRes, sellersRes] = await Promise.all([
        fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        // Only fetch first 20 products for display
        fetch('/api/products?limit=20&offset=0'),
        // Fetch just the counts for stats
        fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null), // Make stats optional
        fetch('/api/admin/sellers', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
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

      // Sellers endpoint with fallback behavior
      if (sellersRes && sellersRes.ok) {
        const sellersData = await sellersRes.json();
        setSellers(sellersData || []);
        setStats(prev => ({
          ...prev,
          totalSellers: Array.isArray(sellersData) ? sellersData.length : prev.totalSellers,
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

  const handleDeleteSeller = async (sellerId: number) => {
    const confirmDelete = confirm('Delete this seller account? This action cannot be undone.');
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSellers(prev => prev.filter(s => s.id !== sellerId));
        setStats(prev => ({ ...prev, totalSellers: Math.max(0, prev.totalSellers - 1) }));
      } else {
        const txt = await res.text();
        alert(`Failed to delete seller: ${txt}`);
      }
    } catch (e) {
      console.error('Failed to delete seller:', e);
      alert('Failed to delete seller');
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
                <h1 className="text-2xl font-black drop-shadow-lg">{t('admin.dashboardTitle') || 'Admin Dashboard'}</h1>
                <p className="text-white/90 text-xs font-semibold drop-shadow">{t('admin.dashboardSubtitle') || 'Platform Management'}</p>
                <p className="mt-1 text-white/80 text-xs drop-shadow">
                  {t('admin.header.help') || 'Manage users, sellers, marketplace products and orders from here.'}
                </p>
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
              {/* Roles box for quick context */}
              <div className="ml-2 px-3 py-2 rounded-lg bg-white/15 backdrop-blur-md border border-white/30 shadow-sm">
                <div className="text-[10px] font-semibold text-white/90 mb-1">Roles</div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center rounded-md border border-white/30 px-2 py-0.5 text-[10px] bg-white/10 text-white">Admin</span>
                  <span className="inline-flex items-center rounded-md border border-white/30 px-2 py-0.5 text-[10px] bg-white/10 text-white">Client</span>
                  <span className="inline-flex items-center rounded-md border border-white/30 px-2 py-0.5 text-[10px] bg-white/10 text-white">User</span>
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

            {/* Overview shows stats only */}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Role Boxes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Admins Box */}
              <div className="bg-card rounded-xl border shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {t('admin.box.admins') || 'Admins'}
                  </h2>
                </div>
                <div className="divide-y max-h-96 overflow-auto">
                  {users.filter(u => u.user_type === 'admin').map((user) => (
                    <div key={user.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Badge variant="default">{t('user.type.admin') || 'Admin'}</Badge>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                              {t('delete') || 'Delete'}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {users.filter(u => u.user_type === 'admin').length === 0 && (
                    <div className="p-6 text-sm text-muted-foreground">No admins.</div>
                  )}
                </div>
              </div>

              {/* Clients Box */}
              <div className="bg-card rounded-xl border shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t('admin.box.clients') || 'Clients'}
                  </h2>
                </div>
                <div className="divide-y max-h-96 overflow-auto">
                  {users.filter(u => u.user_type === 'client').map((user) => (
                    <div key={user.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Badge variant="secondary">{t('user.type.client') || 'Client'}</Badge>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                              {t('delete') || 'Delete'}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {users.filter(u => u.user_type === 'client').length === 0 && (
                    <div className="p-6 text-sm text-muted-foreground">No clients.</div>
                  )}
                </div>
              </div>

              {/* Sellers Box */}
              <div className="bg-card rounded-xl border shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    {t('admin.box.sellers') || 'Sellers'}
                  </h2>
                </div>
                <div className="divide-y max-h-96 overflow-auto">
                  {sellers.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground">No sellers yet.</div>
                  ) : (
                    sellers.map((seller) => (
                      <div key={seller.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{seller.name || seller.email}</p>
                            <p className="text-sm text-muted-foreground">{seller.email}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Badge variant="secondary">{t('user.type.seller')}</Badge>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteSeller(seller.id)}>
                                {t('delete') || 'Delete'}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {seller.created_at ? new Date(seller.created_at).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
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
                    <th className="text-left p-4 font-medium">{t('actions') || 'Actions'}</th>
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
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            const ok = confirm('Delete this marketplace product?');
                            if (!ok) return;
                            try {
                              const token = localStorage.getItem('authToken');
                              const res = await fetch(`/api/admin/marketplace/products/${product.id}`,
                                { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                              if (res.ok) {
                                setProducts(prev => prev.filter(p => p.id !== product.id));
                                setStats(prev => ({ ...prev, totalProducts: Math.max(0, prev.totalProducts - 1) }));
                              } else {
                                alert(await res.text());
                              }
                            } catch (e) {
                              alert('Failed to delete product');
                            }
                          }}
                        >
                          {t('delete') || 'Delete'}
                        </Button>
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
