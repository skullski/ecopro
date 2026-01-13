import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { UserPlus, Mail, Lock, Sparkles, User, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

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

type SignupStep = 'form' | 'verify';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<SignupStep>('form');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

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

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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

  // Step 1: Send verification code
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }
      
      setStep('verify');
      setSuccess('Verification code sent to your email!');
      setResendCooldown(60); // 60 seconds cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify code and complete registration
  async function handleVerifyAndRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-and-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name, code: verificationCode })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  // Resend verification code
  async function handleResendCode() {
    if (resendCooldown > 0) return;
    
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }
      
      setSuccess('New verification code sent!');
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
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
          {step === 'form' && (
            <form onSubmit={handleSendCode} className="space-y-2">
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
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-accent" />
                  {t("auth.password") || "Password"}
                </label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full rounded-lg border-2 border-accent/20 bg-background px-3 py-1.5 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                  placeholder={t('auth.passwordPlaceholder') || "Enter your password"}
                  required
                  disabled={loading}
                  minLength={8}
                  autoComplete="new-password"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {t("auth.passwordHint") || "At least 8 characters"}
                </p>
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
                      Sending code...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      {t("auth.sendCode") || "Send Verification Code"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-3">
              <button
                type="button"
                onClick={() => { setStep('form'); setError(''); setSuccess(''); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to
                </p>
                <p className="font-medium text-accent">{email}</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-accent" />
                  Verification Code
                </label>
                <input 
                  value={verificationCode} 
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                  className="w-full rounded-lg border-2 border-accent/20 bg-background px-3 py-2 text-center text-2xl font-mono tracking-widest focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                  placeholder="000000"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 shadow-lg hover:shadow-xl transition-all py-3 sm:py-4 text-sm sm:text-base"
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t("auth.verifyAndSignup") || "Verify & Create Account"}
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  className={`text-sm ${resendCooldown > 0 ? 'text-muted-foreground' : 'text-accent hover:underline'}`}
                >
                  {resendCooldown > 0 
                    ? `Resend code in ${resendCooldown}s` 
                    : "Didn't receive the code? Resend"}
                </button>
              </div>
            </form>
          )}
          
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
