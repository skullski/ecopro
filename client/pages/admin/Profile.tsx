import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Gift, Lock, MessageCircle, Save, Shield, User, Settings, Database, CreditCard, CheckCircle, AlertCircle, Loader, Ticket } from 'lucide-react';
import { setAuthToken, getAuthToken } from '@/lib/auth';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();

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

  // Voucher code redemption state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  const handleFormatVoucherCode = (value: string) => {
    // Normalize input (supports pasting with spaces/dashes) into XXXX-XXXX-XXXX-XXXX.
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join('-') || cleaned;
    setVoucherCode(formatted);
  };

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError(null);
    setVoucherSuccess(false);
    setVoucherLoading(true);

    try {
      if (!voucherCode.trim()) {
        throw new Error('Please enter a code');
      }

      const token = getAuthToken();
      const res = await fetch('/api/codes/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code: voucherCode.trim().toUpperCase() }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || data?.error) {
        const msg = data?.error || data?.message || 'Failed to redeem code';
        setVoucherError(msg);
        setAttemptsRemaining(typeof data?.attemptsRemaining === 'number' ? data.attemptsRemaining : 3);
      } else {
        setVoucherSuccess(true);
        setVoucherCode('');
        setAttemptsRemaining(3);
        
        toast({ title: 'Success!', description: 'Your subscription has been activated.' });
        
        // Refresh user data
        try {
          const meRes = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (meRes.ok) {
            const userData = await meRes.json();
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (e) {
          console.error('Failed to refresh user data:', e);
        }

        // Reload data and page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err: any) {
      setVoucherError(err.message || 'Failed to redeem code');
    } finally {
      setVoucherLoading(false);
    }
  };

  // Make main content area and sidebar transparent so wallpaper shows through
  useEffect(() => {
    // Add data attribute to body for CSS targeting
    document.body.setAttribute('data-profile-wallpaper', 'true');
    
    // Make main content transparent
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.style.background = 'transparent';
    }

    // Find and make sidebar transparent - target the actual sidebar content div
    const sidebarContentDiv = document.querySelector('.flex.flex-col.h-full.pt-20') as HTMLElement;
    if (sidebarContentDiv) {
      sidebarContentDiv.style.setProperty('background-color', 'rgba(15, 23, 42, 0.7)', 'important');
      sidebarContentDiv.style.setProperty('backdrop-filter', 'blur(16px)', 'important');
    }
    
    // Also target parent aside element
    const asideEl = document.querySelector('aside') as HTMLElement;
    if (asideEl) {
      asideEl.style.setProperty('background', 'transparent', 'important');
    }

    return () => {
      document.body.removeAttribute('data-profile-wallpaper');
      if (mainEl) {
        mainEl.style.background = '';
      }
      if (sidebarContentDiv) {
        sidebarContentDiv.style.removeProperty('background-color');
        sidebarContentDiv.style.removeProperty('backdrop-filter');
      }
      if (asideEl) {
        asideEl.style.removeProperty('background');
      }
    };
  }, []);

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

  // Get wallpaper based on theme
  const wallpaper = theme === 'dark' 
    ? '/uploads/Copilot_20251225_043138.png' 
    : '/uploads/lightmode.png';

  return (
    <>
      {/* Full-screen background that extends under sidebar */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="space-y-3 max-w-4xl min-h-screen p-4 -m-4 relative z-10">
        <div className="flex items-center justify-between backdrop-blur-md bg-white/60 dark:bg-background/50 rounded-lg p-3 border border-white/30 dark:border-slate-700/50">
          <div>
            <h1 className="text-xl font-bold">Profile</h1>
            <p className="text-muted-foreground text-sm">Manage your account details and subscription</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Account */}
          <Card className="p-0 backdrop-blur-md bg-white/60 dark:bg-card/70 border-white/30 dark:border-slate-700/50">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4" />
                Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Name</Label>
                <Input id="name" className="h-8" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input id="email" className="h-8" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs">Phone / WhatsApp</Label>
                <Input id="phone" className="h-8" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="business_name" className="text-xs">Business / Store Name</Label>
                <Input
                  id="business_name"
                  className="h-8"
                  value={form.business_name}
                  onChange={(e) => setForm((s) => ({ ...s, business_name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="country" className="text-xs">Country</Label>
                <Input id="country" className="h-8" value={form.country} onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city" className="text-xs">City</Label>
                <Input id="city" className="h-8" value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} />
              </div>
            </div>

            <Button onClick={onSave} disabled={saving || loading} className="w-full h-8" size="sm">
              <Save className="w-3 h-3 mr-1" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>

            {loading && <div className="text-xs text-muted-foreground">Loading...</div>}
          </CardContent>
        </Card>

        {/* Subscription (copy lock-card colors) */}
        <div className="rounded-xl overflow-hidden border border-slate-700/50 shadow-lg bg-slate-900/95 backdrop-blur-md">
          <div className="bg-gradient-to-r from-amber-500/30 to-orange-500/30 p-4 text-center border-b border-amber-500/30">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-amber-500/50">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-amber-300">Subscription</h2>
            <p className="text-amber-200/80 text-xs mt-1">Status and renewal</p>
          </div>

          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Status</span>
              <Badge className={`text-xs ${hasAccess ? 'bg-emerald-600/20 text-emerald-200 border border-emerald-500/30' : 'bg-amber-600/20 text-amber-200 border border-amber-500/30'}`}>
                {subStatus}
              </Badge>
            </div>

            {typeof access?.daysLeft === 'number' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Days left</span>
                <span className="text-slate-100 font-semibold">{access.daysLeft}</span>
              </div>
            )}

            {(trialEnds || periodEnds) && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Renewal / Trial ends</span>
                <span className="text-slate-100 font-semibold">{formatDate(periodEnds || trialEnds)}</span>
              </div>
            )}

            {profile?.is_locked && (
              <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
                <p className="text-xs text-slate-300">
                  <span className="font-semibold">Locked:</span> {profile.lock_type || 'locked'}
                </p>
                {profile.locked_reason && <p className="text-xs text-slate-400 mt-1">{profile.locked_reason}</p>}
              </div>
            )}

            {/* Voucher Code Redemption - Inline */}
            <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50 space-y-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">Redeem Voucher Code</span>
              </div>

              {voucherSuccess ? (
                <div className="flex items-center gap-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">Code redeemed! Reloading...</span>
                </div>
              ) : (
                <form onSubmit={handleRedeemVoucher} className="space-y-2">
                  <Input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => handleFormatVoucherCode(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    disabled={voucherLoading}
                    className="h-9 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 font-mono text-center"
                  />

                  {voucherError && (
                    <div className="flex items-start gap-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="text-red-300">{voucherError}</p>
                        {attemptsRemaining < 3 && (
                          <p className="text-red-400/70 mt-0.5">Attempts: {attemptsRemaining}/3</p>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={voucherLoading || !voucherCode}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-9 font-semibold"
                    size="sm"
                  >
                    {voucherLoading ? (
                      <>
                        <Loader className="w-4 h-4 mr-1 animate-spin" />
                        Redeeming...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-1" />
                        Redeem Code
                      </>
                    )}
                  </Button>
                </form>
              )}

              <p className="text-xs text-slate-500 text-center">
                Code format: XXXX-XXXX-XXXX-XXXX
              </p>
            </div>

            <Button
              onClick={() => navigate('/chat')}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 h-8"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Need a code? Contact Support
            </Button>
          </div>
        </div>
      </div>

      {/* Security */}
      <Card className="p-0 backdrop-blur-md bg-white/60 dark:bg-card/70 border-white/30 dark:border-slate-700/50">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="currentPassword" className="text-xs">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                className="h-8"
                value={pw.currentPassword}
                onChange={(e) => setPw((s) => ({ ...s, currentPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword" className="text-xs">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                className="h-8"
                value={pw.newPassword}
                onChange={(e) => setPw((s) => ({ ...s, newPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmNewPassword" className="text-xs">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                className="h-8"
                value={pw.confirmNewPassword}
                onChange={(e) => setPw((s) => ({ ...s, confirmNewPassword: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Password changes require your current password.</div>
            <Button onClick={onChangePassword} disabled={changingPassword} size="sm" className="h-8">
              {changingPassword ? 'Updating...' : 'Change Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="p-0 backdrop-blur-md bg-white/60 dark:bg-card/70 border-white/30 dark:border-slate-700/50">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="w-4 h-4" />
            Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0">
          <div className="text-xs text-muted-foreground">
            Need help with your subscription or account?
          </div>
          <Separator />
          <div className="flex gap-2 flex-col sm:flex-row">
            <Button onClick={() => navigate('/chat')} className="sm:w-auto w-full h-8" size="sm">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="p-0 backdrop-blur-md bg-white/60 dark:bg-card/70 border-white/30 dark:border-slate-700/50">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-4 h-4" />
            Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3 pt-0">
          <div className="text-xs text-muted-foreground mb-2">
            Configure external service integrations for your store.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="rounded-lg border bg-card p-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                  <CreditCard className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Stripe</h4>
                  <p className="text-xs text-muted-foreground">Payment processing</p>
                </div>
              </div>
              <Input 
                placeholder="Stripe Secret Key" 
                type="password"
                className="h-8"
                value={integrations.stripeKey} 
                onChange={(e) => setIntegrations(s => ({ ...s, stripeKey: e.target.value }))} 
              />
            </div>
            
            <div className="rounded-lg border bg-card p-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-500/20">
                  <Database className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Supabase</h4>
                  <p className="text-xs text-muted-foreground">Database & storage</p>
                </div>
              </div>
              <Input 
                placeholder="Supabase URL" 
                className="h-8"
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
            className="w-full h-8"
            size="sm"
          >
            <Save className="w-3 h-3 mr-1" />
            Save Integrations
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            These settings are saved locally. Full integration will be available in future updates.
          </p>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
