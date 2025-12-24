import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Gift, Lock, MessageCircle, Save, Shield, User, Settings, Database, CreditCard } from 'lucide-react';
import { setAuthToken } from '@/lib/auth';

type SubscriptionRow = {
  tier?: string | null;
  status?: string | null;
  trial_started_at?: string | null;
  trial_ends_at?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
} | null;

type ProfileResponse = {
  id: string;
  email: string;
  name: string;
  role: string;
  user_type?: string | null;
  is_locked?: boolean;
  locked_reason?: string | null;
  lock_type?: string | null;
  phone?: string | null;
  business_name?: string | null;
  country?: string | null;
  city?: string | null;
  subscription?: SubscriptionRow;
};

function formatDate(input?: string | null): string {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);

  const [profile, setProfile] = React.useState<ProfileResponse | null>(null);
  const [access, setAccess] = React.useState<{
    status: string;
    hasAccess: boolean;
    daysLeft?: number;
    message?: string;
  } | null>(null);

  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    business_name: '',
    country: '',
    city: '',
  });

  const [pw, setPw] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [integrations, setIntegrations] = React.useState({
    stripeKey: '',
    supabaseUrl: '',
  });

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const [pRes, aRes] = await Promise.all([
        fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/billing/check-access', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (pRes.ok) {
        const p = (await pRes.json()) as ProfileResponse;
        setProfile(p);
        setForm({
          name: p.name || '',
          email: p.email || '',
          phone: p.phone || '',
          business_name: p.business_name || '',
          country: p.country || '',
          city: p.city || '',
        });
      }

      if (aRes.ok) {
        const a = await aRes.json();
        setAccess(a);
      }
    } catch (e) {
      console.error('Profile load error:', e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to update profile');
      }

      if (data?.token) {
        setAuthToken(data.token);
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      toast({ title: 'Saved', description: 'Profile updated successfully' });
      await load();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    try {
      if (!pw.currentPassword || !pw.newPassword) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please fill all password fields' });
        return;
      }
      if (pw.newPassword.length < 6) {
        toast({ variant: 'destructive', title: 'Error', description: 'New password must be at least 6 characters' });
        return;
      }
      if (pw.newPassword !== pw.confirmNewPassword) {
        toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match' });
        return;
      }

      setChangingPassword(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: pw.currentPassword,
          newPassword: pw.newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to change password');
      }

      toast({ title: 'Updated', description: 'Password changed successfully' });
      setPw({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: (e as Error).message });
    } finally {
      setChangingPassword(false);
    }
  };

  const subStatus = access?.status || profile?.subscription?.status || 'unknown';
  const hasAccess = access?.hasAccess ?? true;

  const trialEnds = profile?.subscription?.trial_ends_at || null;
  const periodEnds = profile?.subscription?.current_period_end || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account details and subscription</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone / WhatsApp</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_name">Business / Store Name</Label>
                <Input
                  id="business_name"
                  value={form.business_name}
                  onChange={(e) => setForm((s) => ({ ...s, business_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={form.country} onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} />
              </div>
            </div>

            <Button onClick={onSave} disabled={saving || loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>

            {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          </CardContent>
        </Card>

        {/* Subscription (copy lock-card colors) */}
        <div className="rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-900/95 backdrop-blur-md">
          <div className="bg-gradient-to-r from-amber-500/30 to-orange-500/30 p-8 text-center border-b border-amber-500/30">
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/50">
              <Lock className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-300">Subscription</h2>
            <p className="text-amber-200/80 mt-2">Status and renewal</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Status</span>
              <Badge className={hasAccess ? 'bg-emerald-600/20 text-emerald-200 border border-emerald-500/30' : 'bg-amber-600/20 text-amber-200 border border-amber-500/30'}>
                {subStatus}
              </Badge>
            </div>

            {typeof access?.daysLeft === 'number' && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Days left</span>
                <span className="text-slate-100 font-semibold">{access.daysLeft}</span>
              </div>
            )}

            {(trialEnds || periodEnds) && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Renewal / Trial ends</span>
                <span className="text-slate-100 font-semibold">{formatDate(periodEnds || trialEnds)}</span>
              </div>
            )}

            {profile?.is_locked && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold">Locked:</span> {profile.lock_type || 'locked'}
                </p>
                {profile.locked_reason && <p className="text-sm text-slate-400 mt-1">{profile.locked_reason}</p>}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/codes')}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-12 text-lg font-semibold"
              >
                <Gift className="w-5 h-5 mr-2" />
                Enter Voucher Code
              </Button>

              <Button
                onClick={() => navigate('/chat')}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 h-11"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Support
              </Button>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-sm text-slate-400 text-center">
                Use a voucher code to unlock Orders and Bot.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={pw.currentPassword}
                onChange={(e) => setPw((s) => ({ ...s, currentPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={pw.newPassword}
                onChange={(e) => setPw((s) => ({ ...s, newPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={pw.confirmNewPassword}
                onChange={(e) => setPw((s) => ({ ...s, confirmNewPassword: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Password changes require your current password.</div>
            <Button onClick={onChangePassword} disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Change Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Need help with your subscription, voucher codes, or account?
          </div>
          <Separator />
          <div className="flex gap-3 flex-col sm:flex-row">
            <Button onClick={() => navigate('/chat')} className="sm:w-auto w-full">
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => navigate('/codes')} className="sm:w-auto w-full">
              Voucher Codes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Configure external service integrations for your store.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                  <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Stripe</h4>
                  <p className="text-xs text-muted-foreground">Payment processing</p>
                </div>
              </div>
              <Input 
                placeholder="Stripe Secret Key" 
                type="password"
                value={integrations.stripeKey} 
                onChange={(e) => setIntegrations(s => ({ ...s, stripeKey: e.target.value }))} 
              />
            </div>
            
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20">
                  <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Supabase</h4>
                  <p className="text-xs text-muted-foreground">Database & storage</p>
                </div>
              </div>
              <Input 
                placeholder="Supabase URL" 
                value={integrations.supabaseUrl} 
                onChange={(e) => setIntegrations(s => ({ ...s, supabaseUrl: e.target.value }))} 
              />
            </div>
          </div>

          <Button 
            onClick={() => {
              localStorage.setItem('integrations', JSON.stringify(integrations));
              toast({ title: 'Saved', description: 'Integration settings saved locally' });
            }} 
            variant="outline"
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Integrations
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            These settings are saved locally. Full integration will be available in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
