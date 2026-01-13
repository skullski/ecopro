import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { authApi } from "@/lib/auth";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { LogIn, Mail, Lock, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";

// Google icon SVG component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  // Check for OAuth errors in URL
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      const errorMessages: Record<string, string> = {
        invalid_state: 'Security verification failed. Please try again.',
        no_code: 'Authentication was cancelled.',
        no_email: 'Could not retrieve email from Google.',
        oauth_failed: 'Authentication failed. Please try again.',
        account_locked: 'Your account has been locked.',
      };
      setError(errorMessages[oauthError] || 'Authentication failed');
      if (oauthError === 'account_locked') setIsLocked(true);
    }
  }, [searchParams]);

  // Check if Google OAuth is enabled
  useEffect(() => {
    fetch('/api/oauth/config')
      .then(res => res.json())
      .then(data => {
        setGoogleEnabled(data.google?.enabled || false);
      })
      .catch(() => setGoogleEnabled(false));
  }, []);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");
    try {
      const res = await fetch('/api/oauth/google/url');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Google login is not available');
        setGoogleLoading(false);
      }
    } catch {
      setError('Failed to initiate Google login');
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLocked(false);
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      // Redirect based on user type and role
      if (response.user.role === "admin") {
        navigate("/platform-admin");
      } else if (response.user.role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      // Check if this is a locked account error
      if (errorMessage.toLowerCase().includes("locked")) {
        setIsLocked(true);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative container mx-auto py-6 sm:py-10 min-h-[70vh] flex items-center justify-center overflow-hidden">
      <FloatingShapes variant="section" colors="cool" />
      
      <div className="relative z-10 mx-auto max-w-sm sm:max-w-sm w-full px-3">
        <div className="rounded-xl sm:rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-5 sm:p-7 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-2 sm:mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-accent mb-2 shadow-lg">
              <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("login") || "Log in"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('login.subtitle') || "Welcome back! Sign in to continue"}</p>
          </div>
          
          {error && (
            <div className={`p-3 rounded-xl text-sm ${isLocked 
              ? 'bg-orange-500/10 border-2 border-orange-500/30' 
              : 'bg-red-500/10 border-2 border-red-500/20'}`}>
              {isLocked ? (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-600 dark:text-orange-400 mb-1">Account Locked</p>
                    <p className="text-orange-600/80 dark:text-orange-400/80">{error.replace('Account locked: ', '')}</p>
                    <p className="text-xs text-muted-foreground mt-2">Contact support if you believe this is an error.</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Google Sign-In Button */}
            {googleEnabled && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 py-4 border-2 hover:bg-muted/50 transition-all"
                  onClick={handleGoogleLogin}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <GoogleIcon className="w-4 h-4" />
                  )}
                  <span>{t('login.google') || 'Continue with Google'}</span>
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
                <Mail className="w-3.5 h-3.5 text-primary" />
                {t("auth.email") || "Email"}
              </label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full rounded-lg border-2 border-primary/20 bg-background px-3 py-1.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                placeholder={t("auth.email")}
                type="email"
                required
                disabled={loading}
                autoComplete="off"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  {t("auth.password") || "Password"}
                </label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  {t("auth.forgotPassword") || "Forgot Password?"}
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full rounded-lg border-2 border-primary/20 bg-background px-3 py-1.5 pr-10 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                  disabled={loading}
                  autoComplete="current-password"
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
            </div>
            <div className="flex items-center justify-between pt-1">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all py-3 sm:py-4 text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    {t("loading") || "Loading..."}
                  </>
                ) : (
                  t("login") || "Log in"
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-3 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('login.noAccount')}{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                {t("signup")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
