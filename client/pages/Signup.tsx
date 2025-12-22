import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { authApi } from "@/lib/auth";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { UserPlus, Mail, Lock, Sparkles, User, Loader2 } from "lucide-react";

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.register({ email, password, name, role: "user" });
      navigate("/dashboard"); // Redirect to client dashboard
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative container mx-auto py-8 sm:py-12 min-h-[70vh] flex items-center justify-center overflow-hidden">
      <FloatingShapes variant="section" colors="warm" />
      
      <div className="relative z-10 mx-auto max-w-sm sm:max-w-md w-full px-4">
        <div className="rounded-xl sm:rounded-2xl border-2 border-accent/20 bg-gradient-to-br from-card via-card to-accent/5 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-3 sm:mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-accent to-orange-500 mb-3 shadow-lg">
              <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-accent to-orange-600 bg-clip-text text-transparent">
              {t("signup") || "Sign up"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-accent" />
              {t('signup.subtitle')}
            </p>
          </div>
          
          {error && (
            <div className="p-3 mb-4 bg-red-500/10 border-2 border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent" />
                {t("auth.name") || "Name"}
              </label>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full rounded-lg border-2 border-accent/20 bg-background px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                placeholder={t("auth.namePlaceholder")}
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
                className="w-full rounded-lg border-2 border-accent/20 bg-background px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                placeholder={t('auth.emailPlaceholder')}
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
                className="w-full rounded-lg border-2 border-accent/20 bg-background px-3 py-2 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                placeholder={t('auth.passwordPlaceholder')}
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {t("auth.passwordHint")}
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 shadow-lg hover:shadow-xl transition-all py-4 sm:py-5 text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    {t("loading") || "Loading..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 ml-2" />
                    {t("signup") || "Sign up"}
                  </>
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
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
