import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { authApi } from "@/lib/auth";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      // Redirect based on role
      if (response.user.role === "admin") {
        navigate("/platform-control-x9k2m8p5q7w3"); // Secret platform admin URL
      } else {
        navigate("/dashboard"); // Vendor dashboard (store owner)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative container mx-auto py-20 min-h-[80vh] flex items-center justify-center overflow-hidden">
      <FloatingShapes variant="section" colors="cool" />
      
      <div className="relative z-10 mx-auto max-w-md w-full">
        <div className="rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-10 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("login")}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">مرحباً بعودتك! سجل دخولك للمتابعة</p>
          </div>
          
          {error && (
            <div className="p-4 bg-red-500/10 border-2 border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                {t("auth.email")}
              </label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="mt-1 w-full rounded-xl border-2 border-primary/20 bg-background px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                placeholder={t("auth.email")}
                type="email"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                {t("auth.password")}
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="mt-1 w-full rounded-xl border-2 border-primary/20 bg-background px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            <div className="flex items-center justify-between">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all py-6 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    {t("loading")}
                  </>
                ) : (
                  t("login")
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
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
