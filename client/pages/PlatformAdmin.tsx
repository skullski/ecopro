import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useNavigate } from 'react-router-dom';
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
  CreditCard,
  Gift,
  UserPlus,
  AlertTriangle,
  Unlock,
  Copy,
  X,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { GradientCard } from '@/components/ui/GradientCard';
import { Button } from '@/components/ui/button';

interface PlatformStats {
  totalUsers: number;
  totalClients: number;
  totalAdmins: number;
  lockedAccounts: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  expiredSubscriptions: number;
  totalCodes: number;
  redeemedCodes: number;
  pendingCodes: number;
  expiredCodes: number;
  newSignupsWeek: number;
  newSignupsMonth: number;
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

interface LockedAccount {
  id: number;
  email: string;
  name: string;
  is_locked: boolean;
  locked_reason?: string;
  locked_at?: string;
  unlock_reason?: string;
  unlocked_at?: string;
  is_paid_temporarily?: boolean;
  subscription_extended_until?: string;
  created_at: string;
}

// Locked Accounts Manager Component
function LockedAccountsManager() {
  const [allAccounts, setAllAccounts] = useState<LockedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'unlock' | 'lock'>('unlock');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'extend' | 'mark_paid'>('extend');
  const [extendDays, setExtendDays] = useState(30);
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'locked' | 'unlocked'>('all');

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  async function fetchAllAccounts() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/locked-accounts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      setAllAccounts(data.accounts || []);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      alert('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  }

  const filteredAccounts = allAccounts.filter(acc => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'locked') return acc.is_locked;
    if (filterStatus === 'unlocked') return !acc.is_locked;
    return true;
  });

  const lockedCount = allAccounts.filter(a => a.is_locked).length;
  const unlockedCount = allAccounts.filter(a => !a.is_locked).length;

  async function handleProcess() {
    if (selectedAccounts.length === 0) {
      alert('Please select accounts');
      return;
    }

    if (!reason.trim()) {
      alert('Please enter a reason');
      return;
    }

    setProcessing(true);
    try {
      for (const clientId of selectedAccounts) {
        const endpoint = modalMode === 'unlock' ? '/api/admin/unlock-account' : '/api/admin/lock-account';
        const body = modalMode === 'unlock'
          ? {
              client_id: clientId,
              unlock_reason: reason,
              action,
              days: action === 'extend' ? extendDays : undefined
            }
          : {
              client_id: clientId,
              reason,
              lock_type: 'payment'  // Tools page always locks for payment issues
            };

        console.log(`[${modalMode.toUpperCase()}] Sending to ${endpoint}:`, body);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(body)
        });

        console.log(`[${modalMode.toUpperCase()}] Response status:`, response.status);
        
        if (!response.ok) {
          const error = await response.json();
          console.error(`[${modalMode.toUpperCase()}] Error response:`, error);
          alert(`Failed: ${error.error || 'Unknown error'}`);
          return;
        }

        const result = await response.json();
        console.log(`[${modalMode.toUpperCase()}] Success:`, result);
      }

      const action_text = modalMode === 'unlock' ? 'unlocked' : 'locked';
      alert(`Successfully ${action_text} ${selectedAccounts.length} account(s)`);
      setSelectedAccounts([]);
      setReason('');
      setShowModal(false);
      await fetchAllAccounts();
    } catch (err) {
      console.error('Error processing accounts:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to process accounts'}`);
    } finally {
      setProcessing(false);
    }
  }

  function toggleSelectAll() {
    if (selectedAccounts.length === filteredAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(filteredAccounts.map(a => a.id));
    }
  }

  function toggleSelect(id: number) {
    setSelectedAccounts(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <Zap className="w-8 h-8 text-amber-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl border border-green-500/30 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-green-300 mb-2 flex items-center gap-2">
          <Unlock className="w-6 h-6" />
          Subscription & Lock Management
        </h2>
        <p className="text-green-200/80">
          Manage all accounts: lock for payment issues, unlock and extend subscriptions, or grant temporary paid access
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <div className="text-sm text-slate-400">Total Accounts</div>
          <div className="text-3xl font-bold text-white mt-2">{allAccounts.length}</div>
        </div>
        <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
          <div className="text-sm text-red-300">Locked Accounts</div>
          <div className="text-3xl font-bold text-red-400 mt-2">{lockedCount}</div>
        </div>
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-4">
          <div className="text-sm text-green-300">Active Accounts</div>
          <div className="text-3xl font-bold text-green-400 mt-2">{unlockedCount}</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <div className="text-sm text-slate-400">Selected</div>
          <div className="text-3xl font-bold text-cyan-400 mt-2">{selectedAccounts.length}</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'all'
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All ({allAccounts.length})
        </button>
        <button
          onClick={() => setFilterStatus('locked')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'locked'
              ? 'bg-red-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Locked ({lockedCount})
        </button>
        <button
          onClick={() => setFilterStatus('unlocked')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'unlocked'
              ? 'bg-green-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Active ({unlockedCount})
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedAccounts.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
            Bulk Actions ({selectedAccounts.length} selected)
          </h3>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setModalMode('unlock');
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Unlock & Extend
            </Button>
            <Button
              onClick={() => {
                setModalMode('lock');
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
            >
              <Lock className="w-4 h-4 mr-2" />
              Lock for Payment Issues
            </Button>
          </div>
        </div>
      )}

      {/* Accounts Table */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/30">
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedAccounts.length === filteredAccounts.length && filteredAccounts.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-600"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Reason/Notes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>
                      {filterStatus === 'all'
                        ? 'No accounts found'
                        : filterStatus === 'locked'
                        ? 'No locked accounts'
                        : 'No active accounts'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(account => (
                  <tr
                    key={account.id}
                    className={`border-b border-slate-700/20 hover:bg-slate-900/30 transition-colors ${
                      account.is_locked ? 'bg-red-500/5' : 'bg-green-500/5'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.includes(account.id)}
                        onChange={() => toggleSelect(account.id)}
                        className="rounded border-slate-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={account.is_locked ? 'bg-red-600' : 'bg-green-600'}>
                        {account.is_locked ? 'Locked' : 'Active'}
                      </Badge>
                      {account.is_paid_temporarily && <Badge className="bg-blue-600 ml-2">Paid Temp</Badge>}
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-mono">{account.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{account.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {account.is_locked
                        ? account.locked_reason || 'Subscription expired'
                        : account.unlock_reason || 'Active'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {account.is_locked && account.locked_at
                        ? new Date(account.locked_at).toLocaleDateString()
                        : account.unlocked_at
                        ? new Date(account.unlocked_at).toLocaleDateString()
                        : new Date(account.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {modalMode === 'unlock' ? 'Unlock & Extend' : 'Lock Account'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {modalMode === 'unlock' && (
                <>
                  {/* Action Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Action</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700/50"
                        style={{ background: action === 'extend' ? 'rgba(59, 130, 246, 0.1)' : undefined }}>
                        <input
                          type="radio"
                          checked={action === 'extend'}
                          onChange={() => setAction('extend')}
                          name="action"
                        />
                        <div>
                          <div className="font-medium text-white">Extend Subscription</div>
                          <div className="text-xs text-slate-400">Add days to their subscription</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700/50"
                        style={{ background: action === 'mark_paid' ? 'rgba(34, 197, 94, 0.1)' : undefined }}>
                        <input
                          type="radio"
                          checked={action === 'mark_paid'}
                          onChange={() => setAction('mark_paid')}
                          name="action"
                        />
                        <div>
                          <div className="font-medium text-white">Mark as Paid Temporarily</div>
                          <div className="text-xs text-slate-400">Grant 30-day paid access</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Days Input (for extend) */}
                  {action === 'extend' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Days to Extend</label>
                      <input
                        type="number"
                        value={extendDays}
                        onChange={(e) => setExtendDays(Math.min(365, Math.max(1, parseInt(e.target.value) || 1)))}
                        min="1"
                        max="365"
                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      />
                      <p className="text-xs text-slate-400 mt-1">Maximum: 365 days</p>
                    </div>
                  )}
                </>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {modalMode === 'unlock' ? 'Unlock Reason' : 'Lock Reason'}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    modalMode === 'unlock'
                      ? 'e.g., Voucher code issue fixed, Customer requested, Trial extension...'
                      : 'e.g., Subscription payment overdue, Account flagged for review...'
                  }
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 text-sm"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowModal(false)}
                  variant="ghost"
                  className="flex-1"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProcess}
                  className={`flex-1 ${
                    modalMode === 'unlock'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                  }`}
                  disabled={processing || !reason.trim()}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {modalMode === 'unlock' ? (
                        <>
                          <Unlock className="w-4 h-4 mr-2" />
                          Unlock {selectedAccounts.length}
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Lock {selectedAccounts.length}
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlatformAdmin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalClients: 0,
    totalAdmins: 0,
    lockedAccounts: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    expiredSubscriptions: 0,
    totalCodes: 0,
    redeemedCodes: 0,
    pendingCodes: 0,
    expiredCodes: 0,
    newSignupsWeek: 0,
    newSignupsMonth: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stores' | 'products' | 'activity' | 'settings' | 'billing' | 'payment-failures' | 'codes' | 'tools'>('overview');
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
  const [codesLoading, setCodesLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [issuingCode, setIssuingCode] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'bronze' | 'silver' | 'gold'>('bronze');
  const [lastGeneratedCode, setLastGeneratedCode] = useState<any>(null);
  const [expireClientEmail, setExpireClientEmail] = useState('');
  const [expiringClient, setExpiringClient] = useState(false);

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

  const handlePaymentRetry = async (codeRequestId: number | string) => {
    if (!confirm('Issue/reissue code for this request?')) return;
    
    setRetryingPayment(codeRequestId as any);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/billing/admin/retry-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transactionId: codeRequestId }),
      });

      if (res.ok) {
        const data = await res.json();
        await loadPaymentFailures();
        alert(`Code issued successfully!\n\nCode: ${data.newCode}\n\nExpires in 1 hour.`);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to issue code');
      }
    } catch (error) {
      console.error('Error issuing code:', error);
      alert('Error issuing code');
    } finally {
      setRetryingPayment(null);
    }
  };

  const loadCodes = async () => {
    setCodesLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/codes/admin/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedCodes(data || []);
      } else {
        console.error('Failed to load codes');
        setGeneratedCodes([]);
      }
    } catch (error) {
      console.error('Failed to load codes:', error);
      setGeneratedCodes([]);
    } finally {
      setCodesLoading(false);
    }
  };

  const handleIssueCode = async () => {
    if (issuingCode) return;
    
    setIssuingCode(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/codes/admin/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier: selectedTier,
          payment_method: 'admin',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastGeneratedCode({
          code: data.code,
          tier: data.tier,
          expires_at: data.expires_at,
        });
        await loadCodes();
        await loadPlatformData(); // Refresh stats
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to generate code');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Error generating code');
    } finally {
      setIssuingCode(false);
    }
  };

  const handleExpireClientAccount = async () => {
    if (!expireClientEmail.trim()) {
      alert('Please enter a client email');
      return;
    }

    setExpiringClient(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // First, find the client by email
      const searchRes = await fetch(`/api/users/search?email=${encodeURIComponent(expireClientEmail)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!searchRes.ok) {
        alert('Client not found');
        setExpiringClient(false);
        return;
      }

      const clientData = await searchRes.json();
      const clientId = clientData.id;

      // Now expire the subscription
      const res = await fetch('/api/billing/admin/expire-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: clientId,
          reason: 'Testing voucher code redemption'
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ Account expired: ${data.client.email}\n\nUser can still login but will be redirected to renew subscription page.`);
        setExpireClientEmail('');
      } else {
        const error = await res.json();
        alert(`❌ ${error.error || 'Failed to expire account'}`);
      }
    } catch (error) {
      console.error('Error expiring account:', error);
      alert('Error expiring account');
    } finally {
      setExpiringClient(false);
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

  const handleLockUser = async (userId: number, userName: string) => {
    const reason = prompt(`Lock account for ${userName}?\nEnter reason (optional):`);
    if (reason === null) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/users/${userId}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason || 'Account locked by admin' }),
      });

      if (res.ok) {
        await loadPlatformData();
        alert('User account locked successfully');
      } else {
        try {
          const data = await res.json();
          alert(`Failed to lock user account: ${data.error || data.message || 'Unknown error'}`);
        } catch {
          alert('Failed to lock user account');
        }
      }
    } catch (error) {
      console.error('Failed to lock user:', error);
      alert('Failed to lock user account');
    }
  };

  const handleUnlockUser = async (userId: number, userName: string) => {
    const confirm_unlock = confirm(`Unlock account for ${userName}?`);
    if (!confirm_unlock) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/users/${userId}/unlock`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await loadPlatformData();
        alert('User account unlocked successfully');
      } else {
        try {
          const data = await res.json();
          alert(`Failed to unlock user account: ${data.error || data.message || 'Unknown error'}`);
        } catch {
          alert('Failed to unlock user account');
        }
      }
    } catch (error) {
      console.error('Failed to unlock user:', error);
      alert('Failed to unlock user account');
    }
  };

  const handleDeleteUser = async (userId: number, userEmail?: string, userType?: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this user account? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: userEmail && userType ? JSON.stringify({ email: userEmail, user_type: userType }) : undefined,
      });

      if (res.ok) {
        await loadPlatformData();
        alert('User deleted successfully');
      } else {
        try {
          const data = await res.json();
          alert(`Failed to delete user: ${data.error || data.message || 'Unknown error'}`);
        } catch {
          const txt = await res.text();
          alert(`Failed to delete user: ${txt}`);
        }
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
      {/* Premium Admin Header - Compact */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden shadow-lg border-b border-emerald-500/30">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 animate-pulse"></div>
        </div>
        
        {/* Glowing Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse hidden lg:block"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse hidden lg:block" style={{animationDelay: '2s'}}></div>
        
        <div className="container relative mx-auto px-2 sm:px-3 py-2 sm:py-3 max-w-7xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-white/30 rounded-lg blur-lg"></div>
                <div className="relative w-9 sm:w-10 h-9 sm:h-10 rounded-lg bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-lg">
                  <Zap className="w-5 sm:w-5 h-5 sm:h-5 text-white drop-shadow-lg" strokeWidth={2} />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-black drop-shadow-lg truncate">Platform Control</h1>
                <p className="text-white/90 text-[10px] sm:text-xs font-medium drop-shadow truncate">Management & Analytics</p>
              </div>
            </div>
            
            {/* Quick Stats - Compact */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 transition-all">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span className="text-[10px] sm:text-xs font-bold">{stats.totalUsers}</span>
                </div>
              </div>
              <div className="hidden sm:flex px-2 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 transition-all">
                <div className="flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  <span className="text-[10px] sm:text-xs font-bold">{stats.totalClients}</span>
                </div>
              </div>
              <div className="hidden md:flex px-2 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30 transition-all">
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  <span className="text-xs font-bold">{stats.totalProducts}</span>
                </div>
              </div>
              <Button 
                size="sm"
                className="text-white bg-white/20 hover:bg-white/30 border border-white/40 text-[10px] sm:text-xs px-2 py-1 h-7"
                onClick={() => window.location.href = '/'}
              >
                <LogOut className="w-3 h-3 mr-1" />
                <span>Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-3 py-3 sm:py-4 max-w-7xl">
        {/* Enhanced Navigation Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700/50 p-1.5 shadow-md overflow-x-auto">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 h-8 sm:h-9"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">OVR</span>
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 h-8 sm:h-9"
          >
            <Users className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Users</span>
            <span className="sm:hidden">U</span>
          </Button>
          <Button
            variant={activeTab === 'stores' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('stores')}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 h-8 sm:h-9"
          >
            <Store className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Stores</span>
            <span className="sm:hidden">S</span>
          </Button>
          <Button
            variant={activeTab === 'products' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('products')}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 h-8 sm:h-9"
          >
            <Package className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Products</span>
            <span className="sm:hidden">P</span>
          </Button>
          <Button
            variant={activeTab === 'activity' ? 'default' : 'ghost'}
            onClick={() => { setActiveTab('activity'); loadActivityLogs(); }}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 h-8 sm:h-9"
          >
            <Activity className="w-4 h-4 mr-1.5" />
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
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 h-8 sm:h-9"
          >
            <CreditCard className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Billing</span>
            <span className="sm:hidden">B</span>
          </Button>
          <Button
            variant={activeTab === 'codes' ? 'default' : 'ghost'}
            onClick={() => { 
              setActiveTab('codes');
              loadCodes();
            }}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 h-8 sm:h-9"
          >
            <Gift className="w-4 h-4 mr-1.5" />
            <span className="hidden md:inline">Codes</span>
            <span className="md:hidden">C</span>
          </Button>
          <Button
            variant={activeTab === 'tools' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('tools')}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 h-8 sm:h-9"
          >
            <Zap className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Tools</span>
            <span className="sm:hidden">T</span>
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('settings')}
            className="whitespace-nowrap text-slate-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 h-8 sm:h-9"
          >
            <Settings className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">ST</span>
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Premium Stats Grid - Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-2.5 sm:p-3 text-white shadow-md border border-blue-500/30">
                <div className="flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-blue-200 text-[10px] sm:text-xs font-medium truncate">Total Users</p>
                    <h3 className="text-lg sm:text-xl font-black">{stats.totalUsers}</h3>
                    <p className="text-blue-300 text-[10px] truncate">{stats.totalClients} stores</p>
                  </div>
                  <Users className="w-6 h-6 text-blue-300 opacity-20 flex-shrink-0" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-2.5 sm:p-3 text-white shadow-md border border-emerald-500/30">
                <div className="flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-emerald-200 text-[10px] sm:text-xs font-medium truncate">Active Subs</p>
                    <h3 className="text-lg sm:text-xl font-black">{stats.activeSubscriptions}</h3>
                    <p className="text-emerald-300 text-[10px] truncate">Paying</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-emerald-300 opacity-20 flex-shrink-0" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-2.5 sm:p-3 text-white shadow-md border border-amber-500/30">
                <div className="flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-amber-200 text-[10px] sm:text-xs font-medium truncate">Trial</p>
                    <h3 className="text-lg sm:text-xl font-black">{stats.trialSubscriptions}</h3>
                    <p className="text-amber-300 text-[10px] truncate">Free trial</p>
                  </div>
                  <Clock className="w-6 h-6 text-amber-300 opacity-20 flex-shrink-0" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-2.5 sm:p-3 text-white shadow-md border border-red-500/30">
                <div className="flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-red-200 text-[10px] sm:text-xs font-medium truncate">Locked</p>
                    <h3 className="text-lg sm:text-xl font-black">{stats.lockedAccounts}</h3>
                    <p className="text-red-300 text-[10px] truncate">Attention</p>
                  </div>
                  <Lock className="w-6 h-6 text-red-300 opacity-20 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Charts Section - Compact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 mb-3">
              {/* Subscription Distribution Pie Chart */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-md p-3">
                <h3 className="text-xs sm:text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <PieChartIcon className="w-3.5 h-3.5 text-purple-400" />
                  Subscriptions
                </h3>
                <div className="h-36 sm:h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: stats.activeSubscriptions, color: '#10b981' },
                          { name: 'Trial', value: stats.trialSubscriptions, color: '#f59e0b' },
                          { name: 'Expired', value: stats.expiredSubscriptions, color: '#ef4444' },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {[
                          { name: 'Active', value: stats.activeSubscriptions, color: '#10b981' },
                          { name: 'Trial', value: stats.trialSubscriptions, color: '#f59e0b' },
                          { name: 'Expired', value: stats.expiredSubscriptions, color: '#ef4444' },
                        ].filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', fontSize: '11px' }}
                        labelStyle={{ color: '#f1f5f9' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] text-slate-400">Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-[10px] text-slate-400">Trial</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-[10px] text-slate-400">Expired</span>
                  </div>
                </div>
              </div>

              {/* Code Statistics Bar Chart */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-md p-3">
                <h3 className="text-xs sm:text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                  Codes
                </h3>
                <div className="h-36 sm:h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Total', value: stats.totalCodes, fill: '#06b6d4' },
                        { name: 'Redeemed', value: stats.redeemedCodes, fill: '#10b981' },
                        { name: 'Pending', value: stats.pendingCodes, fill: '#f59e0b' },
                        { name: 'Expired', value: stats.expiredCodes, fill: '#ef4444' },
                      ]}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 50, bottom: 5 }}
                    >
                      <XAxis type="number" stroke="#64748b" fontSize={10} />
                      <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', fontSize: '11px' }}
                        labelStyle={{ color: '#f1f5f9' }}
                        cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                        {[
                          { name: 'Total', value: stats.totalCodes, fill: '#06b6d4' },
                          { name: 'Redeemed', value: stats.redeemedCodes, fill: '#10b981' },
                          { name: 'Pending', value: stats.pendingCodes, fill: '#f59e0b' },
                          { name: 'Expired', value: stats.expiredCodes, fill: '#ef4444' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Stats Shapes Row - Compact */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {/* Circular Progress - Subscription Rate */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700/50 p-2 shadow-md">
                <div className="flex flex-col items-center">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="40%" stroke="#334155" strokeWidth="4" fill="none" />
                      <circle cx="50%" cy="50%" r="40%" stroke="#10b981" strokeWidth="4" fill="none" strokeLinecap="round"
                        strokeDasharray={`${(stats.totalClients > 0 ? (stats.activeSubscriptions / stats.totalClients) * 226 : 0)} 226`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-400">
                        {stats.totalClients > 0 ? Math.round((stats.activeSubscriptions / stats.totalClients) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Active</p>
                </div>
              </div>

              {/* Circular Progress - Trial Rate */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700/50 p-2 shadow-md">
                <div className="flex flex-col items-center">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="40%" stroke="#334155" strokeWidth="4" fill="none" />
                      <circle cx="50%" cy="50%" r="40%" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round"
                        strokeDasharray={`${(stats.totalClients > 0 ? (stats.trialSubscriptions / stats.totalClients) * 226 : 0)} 226`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-bold text-amber-400">
                        {stats.totalClients > 0 ? Math.round((stats.trialSubscriptions / stats.totalClients) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Trial</p>
                </div>
              </div>

              {/* Circular Progress - Code Redemption */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700/50 p-2 shadow-md">
                <div className="flex flex-col items-center">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="40%" stroke="#334155" strokeWidth="4" fill="none" />
                      <circle cx="50%" cy="50%" r="40%" stroke="#8b5cf6" strokeWidth="4" fill="none" strokeLinecap="round"
                        strokeDasharray={`${(stats.totalCodes > 0 ? (stats.redeemedCodes / stats.totalCodes) * 226 : 0)} 226`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-bold text-purple-400">
                        {stats.totalCodes > 0 ? Math.round((stats.redeemedCodes / stats.totalCodes) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Codes</p>
                </div>
              </div>

              {/* Growth Indicator */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700/50 p-2 shadow-md">
                <div className="flex flex-col items-center">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full"></div>
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                  </div>
                  <p className="text-sm font-bold text-cyan-400">+{stats.newSignupsWeek}</p>
                  <p className="text-[10px] text-slate-400">Week</p>
                </div>
              </div>
            </div>

            {/* Quick Insights - Compact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
              {/* Recent Activity */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-md p-3">
                <h3 className="text-xs sm:text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Recent Activity
                </h3>
                <div className="space-y-1.5">
                  {activityLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="flex items-start gap-2 pb-1.5 border-b border-slate-700/50 last:border-0">
                      <div className="w-1.5 h-1.5 mt-1 rounded-full bg-cyan-400 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs text-white font-medium truncate">{log.action}</p>
                        <p className="text-[10px] text-slate-400">{log.resource_type}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {activityLogs.length === 0 && (
                    <p className="text-[10px] text-slate-500 text-center py-2">No recent activity</p>
                  )}
                </div>
              </div>

              {/* Quick Stats Summary */}
              <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-md p-3">
                <h3 className="text-xs sm:text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-700/30 rounded-md p-2">
                    <p className="text-[10px] text-slate-400">This Week</p>
                    <p className="text-base font-bold text-emerald-400">{stats.newSignupsWeek}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-md p-2">
                    <p className="text-[10px] text-slate-400">This Month</p>
                    <p className="text-base font-bold text-blue-400">{stats.newSignupsMonth}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-md p-2">
                    <p className="text-[10px] text-slate-400">Redeemed</p>
                    <p className="text-base font-bold text-purple-400">{stats.redeemedCodes}</p>
                  </div>
                  <div className="bg-slate-700/30 rounded-md p-2">
                    <p className="text-[10px] text-slate-400">Expired</p>
                    <p className="text-base font-bold text-orange-400">{stats.expiredSubscriptions}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-700/50">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-[10px] h-7"
                    onClick={() => setActiveTab('billing')}
                  >
                    <CreditCard className="w-3 h-3 mr-1" />
                    View Billing
                  </Button>
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
                        {(user as any).is_locked && <p className="text-xs text-red-400">🔒 Account Locked</p>}
                        {user.email === 'admin@ecopro.com' && <p className="text-xs text-blue-400">🛡️ System Admin</p>}
                      </div>
                      <Badge className="bg-red-500/80 text-white">Admin</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs" 
                        disabled={user.email === 'admin@ecopro.com'}
                        onClick={() => (user as any).is_locked ? handleUnlockUser(user.id, user.name) : handleLockUser(user.id, user.name)}
                      >
                        {(user as any).is_locked ? '🔓 Unlock' : '🔒 Lock'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="flex-1 text-xs"
                        disabled={user.email === 'admin@ecopro.com'}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </div>
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
                        {(user as any).is_locked && <p className="text-xs text-red-400">🔒 Account Locked</p>}
                      </div>
                      <Badge className="bg-emerald-500/80 text-white">Client</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => (user as any).is_locked ? handleUnlockUser(user.id, user.name) : handleLockUser(user.id, user.name)}>
                        {(user as any).is_locked ? '🔓 Unlock' : '🔒 Lock'}
                      </Button>
                      <Button size="sm" variant="default" className="flex-1 text-xs" onClick={() => handlePromoteToAdmin(user.id)}>
                        Promote
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1 text-xs" onClick={() => handleDeleteUser(user.id, user.email, user.user_type)}>
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
                        {(staffMember as any).is_locked && <p className="text-xs text-red-400">🔒 Account Locked</p>}
                      </div>
                      <Badge className={staffMember.status === 'active' ? 'bg-blue-500/80 text-white' : 'bg-slate-500/80 text-white'}>
                        {staffMember.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => (staffMember as any).is_locked ? handleUnlockUser(staffMember.id, staffMember.email) : handleLockUser(staffMember.id, staffMember.email)}>
                        {(staffMember as any).is_locked ? '🔓 Unlock' : '🔒 Lock'}
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1 text-xs" onClick={() => handleDeleteStaff(staffMember.id)}>
                        Delete
                      </Button>
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

        {/* Code Requests Tab (was Payment Failures) */}
        {activeTab === 'payment-failures' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 backdrop-blur-md rounded-2xl border border-yellow-500/30 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Pending Code Requests</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {paymentFailures.filter(p => p.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-md rounded-2xl border border-red-500/30 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Expired Codes</p>
                    <p className="text-3xl font-bold text-red-400">
                      {billingMetrics?.codes_expired || 0}
                    </p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-md rounded-2xl border border-blue-500/30 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total Requests</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {paymentFailures.length}
                    </p>
                  </div>
                  <CreditCard className="w-10 h-10 text-blue-500/40" />
                </div>
              </div>
            </div>

            {/* Code Requests List */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 bg-slate-900/80">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  Pending & Expired Code Requests
                </h3>
                <p className="text-sm text-slate-400 mt-2">Review code requests that need attention - issue new codes or reissue expired ones</p>
              </div>

              {failuresLoading ? (
                <div className="p-8 text-center">
                  <p className="text-slate-400">Loading code requests...</p>
                </div>
              ) : paymentFailures.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
                  <p className="text-slate-400">No pending code requests</p>
                  <p className="text-xs text-slate-500 mt-1">All code requests have been processed</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50 bg-slate-900/50">
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">ID</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Client</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Tier</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Issue</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Status</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Requested</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {paymentFailures.map((failure) => (
                        <tr key={failure.id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="p-4 text-slate-300 text-sm font-mono">#{failure.id}</td>
                          <td className="p-4 text-sm">
                            <p className="text-slate-300">{failure.store_owner_name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{failure.store_owner_email}</p>
                          </td>
                          <td className="p-4 text-sm">
                            <Badge className={`${
                              failure.tier === 'gold' ? 'bg-yellow-600' :
                              failure.tier === 'silver' ? 'bg-slate-500' :
                              'bg-amber-700'
                            } text-white capitalize`}>
                              {failure.tier || 'Standard'}
                            </Badge>
                          </td>
                          <td className="p-4 text-slate-400 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              failure.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {failure.failure_reason || 'Needs attention'}
                            </span>
                          </td>
                          <td className="p-4 text-sm">
                            {failure.status === 'pending' && (
                              <Badge className="bg-yellow-600 text-white">Pending</Badge>
                            )}
                            {(failure.status === 'failed' || failure.status === 'expired') && (
                              <Badge className="bg-red-600 text-white">Expired</Badge>
                            )}
                          </td>
                          <td className="p-4 text-slate-400 text-sm">{new Date(failure.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-sm flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handlePaymentRetry(failure.id)}
                              disabled={retryingPayment === failure.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              {retryingPayment === failure.id ? '...' : failure.status === 'pending' ? 'Issue Code' : 'Reissue'}
                            </Button>
                            {failure.chat_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-slate-300 border-slate-600 hover:border-slate-500"
                                onClick={() => navigate('/platform-admin/chat')}
                              >
                                Chat
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                Code Issuance Flow
              </h3>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-400 text-xs">1</span>
                  <span>Client requests a code via chat or Codes Store page</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-400 text-xs">2</span>
                  <span>Admin reviews request and verifies payment (if applicable)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-400 text-xs">3</span>
                  <span>Admin issues code (valid for 1 hour) via chat or this page</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs">4</span>
                  <span>Client redeems code at /codes-store → Subscription activated!</span>
                </div>
              </div>
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
          <div className="space-y-4">
            {/* Billing Metrics Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-3 md:p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Monthly Revenue (MRR)</p>
                    <p className="text-xl md:text-2xl font-bold text-emerald-400">
                      ${billingMetrics?.mrr?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-emerald-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-md rounded-2xl border border-blue-500/30 p-3 md:p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Active Subscriptions</p>
                    <p className="text-xl md:text-2xl font-bold text-blue-400">
                      {billingMetrics?.active_subscriptions || 0}
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-blue-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-md rounded-2xl border border-orange-500/30 p-3 md:p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Unpaid Subscriptions</p>
                    <p className="text-xl md:text-2xl font-bold text-orange-400">
                      {billingMetrics?.unpaid_count || 0}
                    </p>
                  </div>
                  <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-orange-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-md rounded-2xl border border-purple-500/30 p-3 md:p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">New Signups (This Month)</p>
                    <p className="text-xl md:text-2xl font-bold text-purple-400">
                      {billingMetrics?.new_signups || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-500/40" />
                </div>
              </div>
            </div>

            {/* Additional Metrics - Code Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-3 md:p-4 shadow-lg">
                <p className="text-xs text-slate-400 mb-1">Codes Issued</p>
                <p className="text-lg md:text-xl font-bold text-cyan-400">
                  {billingMetrics?.total_codes_issued || 0}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Total codes generated</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-3 md:p-4 shadow-lg">
                <p className="text-xs text-slate-400 mb-1">Codes Redeemed</p>
                <p className="text-lg md:text-xl font-bold text-emerald-400">
                  {billingMetrics?.codes_redeemed || 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">Successfully activated</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-3 md:p-4 shadow-lg">
                <p className="text-xs text-slate-400 mb-1">Pending Codes</p>
                <p className="text-lg md:text-xl font-bold text-yellow-400">
                  {billingMetrics?.codes_pending || 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">Awaiting issuance</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-3 md:p-4 shadow-lg">
                <p className="text-xs text-slate-400 mb-1">Expired Codes</p>
                <p className="text-lg md:text-xl font-bold text-red-400">
                  {billingMetrics?.codes_expired || 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">Need reissue</p>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-3 md:p-4 shadow-lg">
                <p className="text-xs text-slate-400 mb-1">Churn Rate</p>
                <p className="text-lg md:text-xl font-bold text-red-400">
                  {billingMetrics?.churn_rate || '0.0'}%
                </p>
                <p className="text-xs text-slate-500 mt-2">Expired this month</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-lg">
                <p className="text-sm text-slate-400 mb-2">Monthly Redemptions</p>
                <p className="text-2xl font-bold text-blue-400">
                  {billingMetrics?.monthly_redemptions || 0}
                </p>
                <p className="text-xs text-slate-500 mt-2">This month</p>
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

        {/* Codes Tab */}
        {activeTab === 'codes' && (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-3 md:p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Total Codes</p>
                    <p className="text-xl md:text-2xl font-bold text-cyan-400">{stats.totalCodes}</p>
                  </div>
                  <Gift className="w-6 h-6 md:w-8 md:h-8 text-cyan-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-3 md:p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Redeemed</p>
                    <p className="text-xl md:text-2xl font-bold text-emerald-400">{stats.redeemedCodes}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-emerald-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 backdrop-blur-md rounded-2xl border border-amber-500/30 p-3 md:p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Pending</p>
                    <p className="text-xl md:text-2xl font-bold text-amber-400">{stats.pendingCodes}</p>
                  </div>
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-amber-500/40" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-md rounded-2xl border border-red-500/30 p-3 md:p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Expired</p>
                    <p className="text-xl md:text-2xl font-bold text-red-400">{stats.expiredCodes}</p>
                  </div>
                  <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500/40" />
                </div>
              </div>
            </div>

            {/* Generate Code Section */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-cyan-400" />
                Generate New Code
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Tier</label>
                  <div className="flex gap-2">
                    {(['bronze', 'silver', 'gold'] as const).map((tier) => (
                      <Button
                        key={tier}
                        onClick={() => setSelectedTier(tier)}
                        variant={selectedTier === tier ? 'default' : 'outline'}
                        className={`flex-1 text-sm capitalize ${
                          selectedTier === tier
                            ? tier === 'gold'
                              ? 'bg-yellow-600 hover:bg-yellow-700'
                              : tier === 'silver'
                              ? 'bg-slate-500 hover:bg-slate-600'
                              : 'bg-amber-700 hover:bg-amber-800'
                            : 'border-slate-600 text-slate-300'
                        }`}
                      >
                        {tier}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleIssueCode}
                  disabled={issuingCode}
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  {issuingCode ? 'Generating...' : 'Generate Code'}
                </Button>
              </div>
            </div>

            {/* Last Generated Code Display */}
            {lastGeneratedCode && (
              <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-md rounded-2xl border border-emerald-500/50 shadow-lg p-6 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                      <h3 className="text-lg font-bold text-emerald-300">Code Generated Successfully! 🎉</h3>
                    </div>
                    <p className="text-emerald-200 mb-4">Your new code has been created and is ready to distribute.</p>
                    
                    <div className="space-y-3">
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-emerald-500/30">
                        <p className="text-xs text-slate-400 mb-2">SUBSCRIPTION CODE</p>
                        <div className="flex items-center justify-between gap-3">
                          <code className="text-2xl font-mono font-bold text-emerald-400 break-all">{lastGeneratedCode.code}</code>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(lastGeneratedCode.code);
                              alert('Code copied to clipboard!');
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-emerald-500/20">
                          <p className="text-xs text-slate-400">Tier</p>
                          <p className="text-sm font-bold text-emerald-300 capitalize">{lastGeneratedCode.tier}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-emerald-500/20">
                          <p className="text-xs text-slate-400">Expires In</p>
                          <p className="text-sm font-bold text-emerald-300">1 Hour</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-emerald-500/20">
                          <p className="text-xs text-slate-400">Status</p>
                          <p className="text-sm font-bold text-emerald-300">Active</p>
                        </div>
                      </div>

                      <div className="text-xs text-emerald-300/80">
                        ✓ Code is ready to share with clients
                        <br/>
                        ✓ Expires in 1 hour if not redeemed
                        <br/>
                        ✓ Can be redeemed only once
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-slate-200"
                    onClick={() => setLastGeneratedCode(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Generated Codes List */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 bg-slate-900/80">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Recent Generated Codes
                </h3>
                <p className="text-sm text-slate-400 mt-2">All codes issued by admin. Codes expire after 1 hour if not redeemed.</p>
              </div>

              {codesLoading ? (
                <div className="p-8 text-center">
                  <p className="text-slate-400">Loading codes...</p>
                </div>
              ) : generatedCodes.length === 0 ? (
                <div className="p-8 text-center">
                  <Gift className="w-12 h-12 text-slate-500/40 mx-auto mb-3" />
                  <p className="text-slate-400">No codes generated yet</p>
                  <p className="text-xs text-slate-500 mt-1">Generate your first code using the button above</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50 bg-slate-900/50">
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Code</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Tier</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Status</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Created</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Expires</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-300">Client</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {generatedCodes.map((code, idx) => {
                        const createdAt = new Date(code.created_at);
                        const expiryAt = new Date(code.expiry_date);
                        const isExpired = expiryAt < new Date();
                        const timeLeft = Math.max(0, expiryAt.getTime() - new Date().getTime()) / 60000; // minutes
                        
                        return (
                          <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono text-cyan-400">{code.generated_code}</code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    navigator.clipboard.writeText(code.generated_code);
                                    alert('Code copied to clipboard!');
                                  }}
                                >
                                  <span className="text-xs">📋</span>
                                </Button>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={`${
                                code.code_tier === 'gold' ? 'bg-yellow-600' :
                                code.code_tier === 'silver' ? 'bg-slate-500' :
                                'bg-amber-700'
                              } text-white capitalize`}>
                                {code.code_tier}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={`${
                                code.status === 'used' ? 'bg-emerald-600' :
                                isExpired ? 'bg-red-600' :
                                'bg-yellow-600'
                              } text-white`}>
                                {code.status === 'used' ? 'Redeemed' : isExpired ? 'Expired' : 'Active'}
                              </Badge>
                            </td>
                            <td className="p-4 text-slate-400 text-sm">{createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}</td>
                            <td className="p-4 text-slate-400 text-sm">
                              {isExpired ? (
                                <span className="text-red-400">Expired</span>
                              ) : (
                                <span className="text-amber-400">{Math.floor(timeLeft)} min</span>
                              )}
                            </td>
                            <td className="p-4 text-slate-400 text-sm">
                              {code.redeemed_by_name || code.redeemed_by_email || code.client_name || code.client_email || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tools Tab - Manage locked accounts */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <LockedAccountsManager />
          </div>
        )}
      </div>
    </div>
  );
}

