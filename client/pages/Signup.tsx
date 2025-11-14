import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { UserPlus, Mail, Lock, Sparkles } from "lucide-react";

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = { email };
    localStorage.setItem("user", JSON.stringify(user));
    alert(t("signup") + " successful");
    navigate("/app");
  }

  return (
    <section className="relative container mx-auto py-20 min-h-[80vh] flex items-center justify-center overflow-hidden">
      <FloatingShapes variant="section" colors="warm" />
      
      <div className="relative z-10 mx-auto max-w-md w-full">
        <div className="rounded-3xl border-2 border-accent/20 bg-gradient-to-br from-card via-card to-accent/5 p-10 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-orange-500 mb-4 shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-orange-600 bg-clip-text text-transparent">
              {t("signup")}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-accent" />
              ابدأ رحلتك معنا اليوم
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                البريد الإلكتروني
              </label>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="mt-1 w-full rounded-xl border-2 border-accent/20 bg-background px-4 py-3 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                placeholder="example@email.com"
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent" />
                كلمة المرور
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="mt-1 w-full rounded-xl border-2 border-accent/20 bg-background px-4 py-3 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between">
              <Button type="submit" className="w-full bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 shadow-lg hover:shadow-xl transition-all py-6 text-lg">
                <Sparkles className="w-5 h-5 ml-2" />
                {t("signup")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
