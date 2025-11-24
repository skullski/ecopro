import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/lib/i18n";
import { Sparkles, Menu, X, LogOut, LayoutDashboard, ShoppingBag, Crown, PlusCircle } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { toggle, theme } = useTheme();
  const { locale, setLocale, t } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;

  const isAdmin = typeof window !== "undefined" ? localStorage.getItem("isAdmin") === 'true' : false;
  const isSeller = user?.role === "seller";

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    navigate("/");
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-gradient-to-r from-background/80 via-primary/5 to-accent/5 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 shadow-lg shadow-primary/5">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-3 group z-10">
              {/* Modern Logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-accent/40 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-accent to-purple-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="w-6 h-6 text-white" strokeWidth={2.5} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
                </div>
              </div>
              
              <div className="hidden sm:block">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-transparent">
                  {t("brand")}
                </span>
                <div className="text-xs text-muted-foreground font-medium">منصة التجارة الإلكترونية</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link 
                to="/store" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-all"
              >
                {t("menu.store")}
              </Link>
              <Link 
                to="/pricing" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-all"
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-all"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-all"
              >
                Support
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="hidden md:block">
                <select 
                  value={locale} 
                  onChange={(e) => setLocale(e.target.value as 'ar' | 'en' | 'fr')} 
                  className="px-3 py-2 rounded-lg border-2 border-primary/20 bg-background/50 text-sm font-medium hover:border-primary/40 focus:border-primary/60 focus:outline-none transition-all"
                >
                  <option value="ar">🇩🇿 العربية</option>
                  <option value="en">🇬🇧 EN</option>
                  <option value="fr">🇫🇷 FR</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={toggle} 
                aria-label="تبديل الوضع"
                className="p-2.5 rounded-lg border-2 border-primary/20 bg-background/50 hover:bg-primary/10 hover:border-primary/40 transition-all"
              >
                {theme === "dark" ? (
                  <span className="text-lg">🌙</span>
                ) : (
                  <span className="text-lg">☀️</span>
                )}
              </button>

              {!user ? (
                <>
                  <Link to="/login" className="hidden md:inline-block">
                    <Button 
                      variant="ghost" 
                      className="hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 font-medium"
                    >
                      {t("auth.login")}
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-gradient-to-r from-primary via-accent to-purple-600 hover:from-primary/90 hover:via-accent/90 hover:to-purple-700 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all font-bold">
                      <Sparkles className="w-4 h-4 ml-2" />
                      {t("auth.signup")}
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/dashboard">
                    <Button variant="outline" className="border-2 border-primary/40 text-primary hover:bg-primary/10 font-medium">
                      <LayoutDashboard className="w-4 h-4 ml-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="border-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 font-medium"
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    {t("auth.logout")}
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-lg border-2 border-primary/20 bg-background/50 hover:bg-primary/10 hover:border-primary/40 transition-all"
                aria-label="القائمة"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 z-40 bg-background/95 backdrop-blur-xl border-t border-primary/10">
          <div className="container mx-auto px-4 py-6">
            <nav className="flex flex-col gap-2">
              <Link 
                to="/store" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-medium text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-all"
              >
                {t("menu.store")}
              </Link>
              <Link 
                to="/pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-medium text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-all"
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-medium text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-all"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-medium text-foreground/80 hover:text-foreground hover:bg-primary/10 transition-all"
              >
                Support
              </Link>

              {user && (
                <>
                  <div className="h-px bg-border my-2" />
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="justify-start border-2 border-primary/40 text-primary hover:bg-primary/10 font-medium w-full">
                      <LayoutDashboard className="w-4 h-4 ml-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="justify-start border-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 font-medium w-full"
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    {t("auth.logout")}
                  </Button>
                </>
              )}

              <div className="md:hidden mt-4">
                <select 
                  value={locale} 
                  onChange={(e) => setLocale(e.target.value as 'ar' | 'en' | 'fr')} 
                  className="w-full px-3 py-2 rounded-lg border-2 border-primary/20 bg-background/50 text-sm font-medium"
                >
                  <option value="ar">🇩🇿 العربية</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="fr">🇫🇷 Français</option>
                </select>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
