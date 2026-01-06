import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { authApi } from "@/lib/auth";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { LogIn, Mail, Lock, Loader2, AlertTriangle } from "lucide-react";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);

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
    <section className="relative container mx-auto py-8 sm:py-12 min-h-[70vh] flex items-center justify-center overflow-hidden">
      <FloatingShapes variant="section" colors="cool" />
      
      <div className="relative z-10 mx-auto max-w-sm sm:max-w-md w-full px-4">
        <div className="rounded-xl sm:rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-3 sm:mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary to-accent mb-3 shadow-lg">
              <LogIn className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("login") || "Log in"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('login.subtitle') || "Welcome back! Sign in to continue"}</p>
          </div>
          
          {error && (
            <div className={`p-4 rounded-xl text-sm ${isLocked 
              ? 'bg-orange-500/10 border-2 border-orange-500/30' 
              : 'bg-red-500/10 border-2 border-red-500/20'}`}>
              {isLocked ? (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
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

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                {t("auth.email") || "Email"}
              </label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full rounded-lg border-2 border-primary/20 bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
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
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full rounded-lg border-2 border-primary/20 bg-background px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                placeholder={t('auth.passwordPlaceholder')}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all py-4 sm:py-5 text-sm sm:text-base"
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
          
          <div className="mt-4 text-center">
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
