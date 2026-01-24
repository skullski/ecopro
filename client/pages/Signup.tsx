import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { UserPlus, Mail, Lock, Sparkles, User, Loader2, CheckCircle2, Eye, EyeOff, Tag, Gift } from "lucide-react";

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherValid, setVoucherValid] = useState<boolean | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  // Check for OAuth errors
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
    }
  }, [searchParams]);

  // Check if Google OAuth is enabled
  useEffect(() => {
    fetch('/api/oauth/config')
      .then(res => res.json())
      .then(data => setGoogleEnabled(data.google?.enabled || false))
      .catch(() => setGoogleEnabled(false));
  }, []);

  // Validate voucher code when it changes
  useEffect(() => {
    if (!voucherCode.trim()) {
      setVoucherValid(null);
      setVoucherDiscount(0);
      return;
    }

    const timer = setTimeout(async () => {
      setVoucherLoading(true);
      try {
        const res = await fetch(`/api/affiliates/validate/${encodeURIComponent(voucherCode.trim())}`);
        const data = await res.json();
        setVoucherValid(data.valid);
        setVoucherDiscount(data.valid ? data.discount_percent : 0);
      } catch {
        setVoucherValid(false);
        setVoucherDiscount(0);
      } finally {
        setVoucherLoading(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [voucherCode]);

  function isGmailSignup(value: string) {
    return value.trim().toLowerCase().endsWith('@gmail.com');
  }

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    try {
      const res = await fetch('/api/oauth/google/url');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Google signup unavailable');
        setGoogleLoading(false);
      }
    } catch {
      setError('Failed to connect to Google');
      setGoogleLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!isGmailSignup(email)) {
        throw new Error('Only @gmail.com email addresses are allowed');
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          role: 'client',
          voucher_code: voucherCode.trim() || undefined 
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.role === 'admin' || data.user.user_type === 'admin') {
          localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.removeItem('isAdmin');
        }
      } else {
        // Safety: ensure we don't keep a stale admin flag
        localStorage.removeItem('isAdmin');
      }

      setSuccess('Account created successfully');
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative container mx-auto py-6 sm:py-10 min-h-[70vh] flex items-center justify-center overflow-hidden">
      <FloatingShapes variant="section" colors="warm" />
      
      <div className="relative z-10 mx-auto max-w-sm sm:max-w-sm w-full px-3">
        <div className="rounded-xl sm:rounded-2xl border-2 border-accent/20 bg-gradient-to-br from-card via-card to-accent/5 p-5 sm:p-7 shadow-2xl backdrop-blur-sm">
          <div className="text-center mb-2 sm:mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-accent to-orange-500 mb-2 shadow-lg">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-accent to-orange-600 bg-clip-text text-transparent">
              {t("signup") || "Sign up"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-accent" />
              {t('signup.subtitle') || "Create your account"}
            </p>
          </div>
          
          {error && (
            <div className="p-3 mb-4 bg-red-500/10 border-2 border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 mb-4 bg-green-500/10 border-2 border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* Step 1: Registration Form */}
          <form onSubmit={handleSignup} className="space-y-2">
              {/* Google Sign-Up Button */}
              {googleEnabled && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 py-4 border-2 hover:bg-muted/50 transition-all"
                    onClick={handleGoogleSignup}
                    disabled={loading || googleLoading}
                  >
                    {googleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <GoogleIcon className="w-4 h-4" />
                    )}
                    <span>{t('signup.google') || 'Sign up with Google'}</span>
                  </Button>
                  
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted-foreground/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">{t('login.or') || 'or'}</span>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-accent" />
                  {t("auth.name") || "Name"}
                </label>
                <input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full rounded-lg border-2 border-accent/20 bg-background px-3 py-1.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                  placeholder={t("auth.namePlaceholder") || "Enter your name"}
                  type="text"
                  required
                  disabled={loading}
                  minLength={2}
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-accent" />
                  {t("auth.email") || "Email"}
                </label>
                <input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full rounded-lg border-2 border-accent/20 bg-background px-3 py-1.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                  placeholder={t('auth.emailPlaceholder') || "Enter your email"}
                  type="email"
                  required
                  disabled={loading}
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  Only <span className="font-medium">@gmail.com</span> addresses can sign up right now.
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-accent" />
                  {t("auth.password") || "Password"}
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full rounded-lg border-2 border-accent/20 bg-background px-3 py-1.5 pr-10 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                    placeholder={t('auth.passwordPlaceholder') || "Enter your password"}
                    required
                    disabled={loading}
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? (t('auth.hidePassword') || 'Hide password') : (t('auth.showPassword') || 'Show password')}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {t("auth.passwordHint") || "At least 8 characters"}
                </p>
              </div>
              
              {/* Voucher Code Input */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-accent" />
                  Voucher Code <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={voucherCode} 
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} 
                    className={`w-full rounded-lg border-2 bg-background px-3 py-1.5 pr-10 text-sm transition-all uppercase ${
                      voucherValid === true 
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' 
                        : voucherValid === false 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-accent/20 focus:border-accent focus:ring-accent/20'
                    } focus:ring-2`}
                    placeholder="e.g., AHMED20"
                    disabled={loading}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {voucherLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : voucherValid === true ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : voucherValid === false ? (
                      <Tag className="w-4 h-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {voucherValid === true && voucherDiscount > 0 && (
                  <p className="text-[10px] sm:text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {voucherDiscount}% discount on your first month!
                  </p>
                )}
                {voucherValid === false && voucherCode.trim() && (
                  <p className="text-[10px] sm:text-xs text-red-500 mt-1">
                    Invalid or expired voucher code
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-1">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 shadow-lg hover:shadow-xl transition-all py-3 sm:py-4 text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      {t("signup") || "Sign up"}
                    </>
                  )}
                </Button>
              </div>
          </form>
          
          <div className="mt-3 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("auth.haveAccount") || "Already have an account?"}{" "}
              <Link to="/login" className="text-accent hover:underline font-medium">
                {t("login") || "Log in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
