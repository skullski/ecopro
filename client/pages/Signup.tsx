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
    <section className="relative container mx-auto py-20 min-h-[80vh] flex items-center justify-center overflow-hidden">
      <FloatingShapes variant="section" colors="warm" />
      
      <div className="relative z-10 mx-auto max-w-md w-full">
        <div className="rounded-2xl border-2 border-accent/20 bg-gradient-to-br from-card via-card to-accent/5 p-10 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-4 md:mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-orange-500 mb-4 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-accent to-orange-600 bg-clip-text text-transparent">
              {t("signup") || "Sign up"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-accent" />
              {t('signup.subtitle')}
            </p>
          </div>
          
          {error && (
            <div className="p-4 mb-6 bg-red-500/10 border-2 border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-accent" />
                {t("auth.name") || "Name"}
              </label>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="mt-1 w-full rounded-xl border-2 border-accent/20 bg-background px-4 py-3 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                placeholder={t("auth.namePlaceholder")}
                type="text"
                required
                disabled={loading}
                minLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                {t("auth.email") || "Email"}
              </label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="mt-1 w-full rounded-xl border-2 border-accent/20 bg-background px-4 py-3 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                placeholder={t('auth.emailPlaceholder')}
                type="email"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent" />
                {t("auth.password") || "Password"}
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="mt-1 w-full rounded-xl border-2 border-accent/20 bg-background px-4 py-3 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                placeholder={t('auth.passwordPlaceholder')}
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("auth.passwordHint")}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 shadow-lg hover:shadow-xl transition-all py-6 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    {t("loading") || "Loading..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 ml-2" />
                    {t("signup") || "Sign up"}
                  </>
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
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
