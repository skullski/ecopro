import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';

interface StaffUser {
  id: number;
  email: string;
  role: 'manager' | 'staff';
  permissions: Record<string, boolean>;
  store_name?: string;
  status: 'pending' | 'active' | 'inactive';
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // SECURITY: Extract and validate clientId from JWT token
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        navigate('/staff/login');
        return;
      }

      // Decode JWT to get clientId
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Verify staff has clientId (assigned to a store)
      if (!payload.clientId || !payload.staffId) {
        throw new Error('Invalid staff credentials: missing store assignment');
      }

      // Check expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }

      const parsedUser = JSON.parse(storedUser);
      
      // Store clientId for later use in API calls
      localStorage.setItem('staffClientId', String(payload.clientId));
      
      setUser(parsedUser);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to validate authentication';
      console.error('[StaffDashboard] Validation error:', errorMsg);
      setError(errorMsg);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isStaff');
      navigate('/staff/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('staffId');
    localStorage.removeItem('isStaff');
    navigate('/staff/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="bg-slate-800 border-red-600 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">{error}</p>
            <Button onClick={() => navigate('/staff/login')} className="w-full">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Count available permissions
  const availablePermissions = Object.values(user.permissions || {}).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-slate-800 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Staff Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">{user.store_name || 'Your Store'}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 bg-slate-700 dark:bg-slate-800 border-slate-600 dark:border-slate-700 text-slate-200 hover:bg-slate-600 dark:hover:bg-slate-700 hover:text-white">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <Card className="mb-8 bg-slate-800 dark:bg-slate-900 border-slate-700 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-900 dark:bg-blue-950 rounded-lg flex items-center justify-center border border-blue-700 dark:border-blue-800">
                  <User className="w-6 h-6 text-blue-400 dark:text-blue-300" />
                </div>
                <div>
                  <CardTitle className="text-white">Welcome, {user.email}</CardTitle>
                  <CardDescription className="text-slate-400">You are logged in as a {user.role}</CardDescription>
                </div>
              </div>
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={user.status === 'active' ? 'bg-green-600 dark:bg-green-700' : 'bg-slate-600 dark:bg-slate-700'}>
                {user.status === 'active' ? 'Active' : 'Pending'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Permissions Overview */}
        <Card className="bg-slate-800 dark:bg-slate-900 border-slate-700 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Your Permissions</CardTitle>
            <CardDescription className="text-slate-400">
              You have access to {availablePermissions} features in this store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(user.permissions || {}).map(([permission, hasAccess]) => (
                <div key={permission} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700 dark:bg-slate-800 border border-slate-600 dark:border-slate-700">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      hasAccess ? 'bg-green-500 dark:bg-green-400' : 'bg-slate-500 dark:bg-slate-600'
                    }`}
                  />
                  <span className="text-sm font-medium text-slate-300 capitalize">
                    {permission.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Message */}
        <div className="mt-8 bg-blue-900/30 dark:bg-blue-950/50 border border-blue-700/50 dark:border-blue-800/50 rounded-lg p-6">
          <p className="text-blue-300 dark:text-blue-200">
            <strong>Staff dashboard is coming soon!</strong> Once your store owner enables additional features, you'll be able to manage orders, products, and more from here. Your permissions have been configured by the store owner.
          </p>
        </div>
      </div>
    </div>
  );
}
