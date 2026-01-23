import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Lock, CheckCircle, AlertCircle, Loader, Ticket, Save, User, Key, Eye, EyeOff } from 'lucide-react';
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const { theme } = useTheme();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

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

  // Voucher code redemption state
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
      const res = await fetch('/api/codes/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        
        toast({ title: t('common.success'), description: t('admin.profile.subscriptionActivated') });
        
        // Refresh user data
        try {
          const meRes = await fetch('/api/auth/me');
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

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to change password');
      }

      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({ title: t('common.success'), description: t('auth.passwordChanged') || 'Password changed successfully!' });

      // Hide success message after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
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

    return () => {
      document.body.removeAttribute('data-profile-wallpaper');
      if (mainEl) {
        mainEl.style.background = '';
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
      const [pRes, aRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/billing/check-access'),
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
      toast({ variant: 'destructive', title: t('common.error'), description: t('admin.profile.loadError') });
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to update profile');
      }

      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      toast({ title: t('common.saved'), description: t('admin.profile.updateSuccess') });
      await load();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const subStatus = access?.status || profile?.subscription?.status || 'unknown';
  const hasAccess = access?.hasAccess ?? true;

  const trialEnds = profile?.subscription?.trial_ends_at || null;
  const periodEnds = profile?.subscription?.current_period_end || null;

  // Get wallpaper based on theme
  // NOTE: These assets live in /public so they deploy to Render (public/uploads is gitignored).
  const wallpaper = theme === 'dark' 
    ? '/profile-wallpaper-dark.png' 
    : '/profile-wallpaper-light.png';

  const isLight = theme !== 'dark';

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
      
      <div className="space-y-1.5 w-full min-h-screen p-2 relative z-10">
        {/* Decorative gold shapes (profile only) */}
        <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-gradient-to-br from-amber-300/30 via-yellow-200/20 to-orange-300/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-24 -left-12 h-32 w-32 rounded-full bg-gradient-to-tr from-amber-200/25 via-orange-200/15 to-yellow-200/15 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-10 right-16 h-36 w-36 rounded-full bg-gradient-to-br from-amber-300/20 via-yellow-200/10 to-orange-300/15 blur-3xl" />

        <div className="flex items-center justify-between backdrop-blur-md profile-glass rounded-lg p-1.5 border border-white/30 dark:border-slate-700/50">
          <div>
            <h1 className="text-lg font-bold">{t('admin.profile.title')}</h1>
            <p className="text-muted-foreground text-xs">{t('admin.profile.subtitle')}</p>
          </div>
          {hasAccess && (
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Gold
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-1.5 items-start">
          {/* Subscription + Account (merged) */}
          <div className="backdrop-blur-md profile-glass rounded-lg border border-white/30 dark:border-slate-700/50 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 p-1.5">
              {/* Subscription */}
              <div className={isLight ? 'rounded-lg overflow-hidden border border-amber-200/70' : 'rounded-lg overflow-hidden border border-slate-700/50'}>
                <div
                  className={
                    isLight
                      ? "bg-gradient-to-r from-amber-200/70 to-orange-200/60 p-2 text-center border-b border-amber-300/40"
                      : "bg-gradient-to-r from-amber-500/30 to-orange-500/30 p-2 text-center border-b border-amber-500/30"
                  }
                >
                  <div
                    className={
                      isLight
                        ? "w-7 h-7 bg-amber-300/40 rounded-full flex items-center justify-center mx-auto mb-1 border border-amber-400/40"
                        : "w-7 h-7 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-1 border border-amber-500/50"
                    }
                  >
                    <Lock className={isLight ? "w-3.5 h-3.5 text-amber-700" : "w-3.5 h-3.5 text-amber-400"} />
                  </div>
                  <h2 className={isLight ? "text-sm font-bold text-amber-900" : "text-sm font-bold text-amber-300"}>{t('admin.profile.subscription')}</h2>
                </div>

                <div className="p-1.5 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={isLight ? "text-slate-700" : "text-slate-300"}>{t('admin.profile.status')}</span>
                    <Badge
                      className={`text-xs ${
                        hasAccess
                          ? isLight
                            ? 'bg-emerald-600/10 text-emerald-800 border border-emerald-600/20'
                            : 'bg-emerald-600/20 text-emerald-200 border border-emerald-500/30'
                          : isLight
                            ? 'bg-amber-500/10 text-amber-900 border border-amber-500/20'
                            : 'bg-amber-600/20 text-amber-200 border border-amber-500/30'
                      }`}
                    >
                      {subStatus}
                    </Badge>
                  </div>

                  {typeof access?.daysLeft === 'number' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className={isLight ? "text-slate-700" : "text-slate-300"}>{t('admin.profile.daysLeft')}</span>
                      <span className={isLight ? "text-slate-900 font-semibold" : "text-slate-100 font-semibold"}>{access.daysLeft}</span>
                    </div>
                  )}

                  {(trialEnds || periodEnds) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className={isLight ? "text-slate-700" : "text-slate-300"}>{t('admin.profile.renewalEnds')}</span>
                      <span className={isLight ? "text-slate-900 font-semibold" : "text-slate-100 font-semibold"}>{formatDate(periodEnds || trialEnds)}</span>
                    </div>
                  )}

                  {profile?.is_locked && (
                    <div className="bg-slate-800/50 rounded-lg p-1.5 border border-slate-700/50">
                      <p className="text-xs text-slate-300">
                        <span className="font-semibold">{t('admin.profile.locked')}:</span> {profile.lock_type || t('admin.profile.locked')}
                      </p>
                      {profile.locked_reason && <p className="text-xs text-slate-400 mt-1">{profile.locked_reason}</p>}
                    </div>
                  )}

                  {/* Voucher Code Redemption - Inline */}
                  <div className="bg-slate-800/60 rounded-lg p-1.5 border border-slate-700/50 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Ticket className="w-3 h-3 text-cyan-400" />
                      <span className="text-xs font-semibold text-white">{t('admin.profile.redeemVoucher')}</span>
                    </div>

                    {voucherSuccess ? (
                      <div className="flex items-center gap-1.5 p-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-xs text-green-300">{t('admin.profile.codeRedeemed')}</span>
                      </div>
                    ) : (
                      <form onSubmit={handleRedeemVoucher} className="space-y-1.5">
                        <Input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => handleFormatVoucherCode(e.target.value)}
                          placeholder="XXXX-XXXX-XXXX-XXXX"
                          disabled={voucherLoading}
                          className={
                            isLight
                              ? "h-6 bg-amber-200/80 border-amber-300 text-slate-900 placeholder:text-amber-800/70 font-mono text-center text-xs"
                              : "h-6 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 font-mono text-center text-xs"
                          }
                        />

                        {voucherError && (
                          <div className="flex items-start gap-1.5 p-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <p className="text-red-300">{voucherError}</p>
                            </div>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={voucherLoading || !voucherCode}
                          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-6 font-semibold text-xs"
                          size="sm"
                        >
                          {voucherLoading ? (
                            <>
                              <Loader className="w-3 h-3 mr-1 animate-spin" />
                              {t('admin.profile.redeeming')}
                            </>
                          ) : (
                            <>
                              <Gift className="w-3 h-3 mr-1" />
                              {t('admin.profile.redeemCode')}
                            </>
                          )}
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* Account */}
              <div className={isLight ? 'rounded-lg overflow-hidden border border-white/30' : 'rounded-lg overflow-hidden border border-slate-700/50'}>
                <div className="p-1.5 pb-1 space-y-0">
                  <div className="flex items-center gap-1.5 text-sm font-semibold leading-none tracking-tight">
                    <User className="w-3 h-3" />
                    {t('admin.profile.account')}
                  </div>
                </div>
                <div className="space-y-1.5 p-1.5 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    <div className="space-y-0.5">
                      <Label htmlFor="name" className="text-xs">{t('admin.profile.name')}</Label>
                      <Input id="name" className="h-6" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="email" className="text-xs">{t('admin.profile.email')}</Label>
                      <Input id="email" className="h-6" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="phone" className="text-xs">{t('admin.profile.phone')}</Label>
                      <Input id="phone" className="h-6" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="business_name" className="text-xs">{t('admin.profile.businessName')}</Label>
                      <Input
                        id="business_name"
                        className="h-6"
                        value={form.business_name}
                        onChange={(e) => setForm((s) => ({ ...s, business_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="country" className="text-xs">{t('admin.profile.country')}</Label>
                      <Input id="country" className="h-6" value={form.country} onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))} />
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="city" className="text-xs">{t('admin.profile.city')}</Label>
                      <Input id="city" className="h-6" value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} />
                    </div>
                  </div>

                  <Button onClick={onSave} disabled={saving || loading} className="w-full h-6" size="sm">
                    <Save className="w-3 h-3 mr-1" />
                    {saving ? t('common.saving') : t('admin.profile.updateProfile')}
                  </Button>

                  {loading && <div className="text-xs text-muted-foreground">{t('platformAdmin.loading')}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <Card className="p-0 backdrop-blur-md profile-glass border-white/30 dark:border-slate-700/50">
          <CardHeader className="p-1.5 pb-1 space-y-0">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Key className="w-3 h-3" />
              {t('auth.changePassword') || 'Change Password'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 p-1.5 pt-0">
            {passwordSuccess && (
              <div className="flex items-center gap-1.5 p-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-green-300">{t('auth.passwordChanged') || 'Password changed successfully!'}</span>
              </div>
            )}

            {passwordError && (
              <div className="flex items-center gap-1.5 p-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-300">{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-1">
              <div className="space-y-0.5">
                <Label htmlFor="currentPassword" className="text-xs">{t('auth.currentPassword') || 'Current Password'}</Label>
                <div className="relative">
                  <Input 
                    id="currentPassword" 
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="h-6 pr-8" 
                    value={passwordForm.currentPassword} 
                    onChange={(e) => setPasswordForm((s) => ({ ...s, currentPassword: e.target.value }))}
                    disabled={passwordLoading}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="newPassword" className="text-xs">{t('auth.newPassword') || 'New Password'}</Label>
                <div className="relative">
                  <Input 
                    id="newPassword" 
                    type={showNewPassword ? 'text' : 'password'}
                    className="h-6 pr-8" 
                    value={passwordForm.newPassword} 
                    onChange={(e) => setPasswordForm((s) => ({ ...s, newPassword: e.target.value }))}
                    disabled={passwordLoading}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="confirmPassword" className="text-xs">{t('auth.confirmPassword') || 'Confirm New Password'}</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  className="h-6" 
                  value={passwordForm.confirmPassword} 
                  onChange={(e) => setPasswordForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                  disabled={passwordLoading}
                />
              </div>
              <Button type="submit" disabled={passwordLoading} className="w-full h-6" size="sm">
                {passwordLoading ? (
                  <>
                    <Loader className="w-3 h-3 mr-1 animate-spin" />
                    {t('common.saving') || 'Saving...'}
                  </>
                ) : (
                  <>
                    <Key className="w-3 h-3 mr-1" />
                    {t('auth.changePassword') || 'Change Password'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}
