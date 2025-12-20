import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/lib/i18n";
import { Sparkles, Menu, X, LogOut, LayoutDashboard, ShoppingBag, Crown, PlusCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { authApi } from "@/lib/auth";

export default function Header() {
  const { toggle, theme } = useTheme();
  const { locale, setLocale, t } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";
  const isClient = !isAdmin && !isSeller;

  function handleLogout() {
    try {
      authApi.logout();
    } catch {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("isAdmin");
      navigate("/");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-2 border-primary/25 bg-gradient-to-r from-primary/12 via-accent/8 to-primary/12 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/88 shadow-2xl shadow-primary/15 dark:bg-gradient-to-r dark:from-primary/18 dark:via-accent/12 dark:to-primary/18 dark:shadow-2xl dark:shadow-primary/25 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/3 before:to-transparent dark:before:from-white/5 before:pointer-events-none">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-3 group z-10">
              {/* Modern Logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-accent/40 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-70 dark:from-primary/50 dark:to-accent/50"></div>
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-purple-600 shadow-xl shadow-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/50 group-hover:scale-125 transition-all duration-300 border border-primary/20">
                  <ShoppingBag className="w-5 h-5 text-white drop-shadow-lg" strokeWidth={2.5} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse shadow-lg shadow-green-500/30"></div>
                </div>
              </div>
              
              <div className="hidden sm:block">
                <span className="text-xl font-black text-foreground drop-shadow-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t("brand")}
                </span>
                <div className="text-[10px] text-foreground/75 font-bold -mt-1 drop-shadow">منصة التجارة الإلكترونية</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {!user && (
                <Link 
                  to="/marketplace" 
                  className="px-4 py-2.5 rounded-lg text-sm font-bold text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/15 hover:to-accent/12 transition-all border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md"
                >
                  Marketplace
                </Link>
              )}
              <Link 
                to="/pricing" 
                className="px-4 py-2.5 rounded-lg text-sm font-bold text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/15 hover:to-accent/12 transition-all border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md"
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="px-4 py-2.5 rounded-lg text-sm font-bold text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/15 hover:to-accent/12 transition-all border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className="px-4 py-2.5 rounded-lg text-sm font-bold text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/15 hover:to-accent/12 transition-all border border-transparent hover:border-primary/20 shadow-sm hover:shadow-md"
              >
                Support
              </Link>
              {user && isClient && (
                <Link 
                  to="/dashboard/preview" 
                  className="px-4 py-2.5 rounded-lg text-sm font-bold text-accent hover:text-accent hover:bg-gradient-to-r hover:from-accent/20 hover:to-primary/15 transition-all border border-accent/20 hover:border-accent/30 shadow-sm hover:shadow-md"
                >
                  My Store
                </Link>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="hidden md:block relative">
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="px-4 py-2.5 rounded-lg border-2 border-primary/25 bg-gradient-to-br from-primary/10 to-accent/8 text-sm font-bold text-black dark:text-white hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/15 hover:to-accent/12 focus:border-primary/50 focus:outline-none transition-all shadow-md dark:bg-gradient-to-br dark:from-primary/12 dark:to-accent/10 flex items-center gap-2"
                >
                  <span>{locale === 'ar' ? '🇩🇿' : locale === 'en' ? '🇬🇧' : '🇫🇷'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {langMenuOpen && (
                  <div className="absolute top-full mt-1 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-max">
                    <button 
                      onClick={() => { setLocale('ar'); setLangMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 first:rounded-t-lg transition-colors"
                    >
                      🇩🇿 العربية
                    </button>
                    <button 
                      onClick={() => { setLocale('en'); setLangMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      🇬🇧 EN
                    </button>
                    <button 
                      onClick={() => { setLocale('fr'); setLangMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 last:rounded-b-lg transition-colors"
                    >
                      🇫🇷 FR
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={toggle} 
                aria-label="تبديل الوضع"
                className="p-2.5 rounded-lg border-2 border-primary/25 bg-gradient-to-br from-primary/10 to-accent/8 hover:bg-gradient-to-br hover:from-primary/18 hover:to-accent/14 hover:border-primary/40 transition-all shadow-md hover:shadow-lg dark:bg-gradient-to-br dark:from-primary/12 dark:to-accent/10"
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
                      className="font-bold text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/18 hover:to-accent/15 border border-transparent hover:border-primary/25 shadow-md hover:shadow-lg transition-all"
                    >
                      {t("auth.login")}
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-gradient-to-r from-primary via-accent to-purple-600 hover:from-primary/95 hover:via-accent/95 hover:to-purple-700 shadow-2xl shadow-primary/35 hover:shadow-3xl hover:shadow-primary/45 transition-all font-black text-white border border-primary/40 hover:border-primary/50">
                      <Sparkles className="w-5 h-5 ml-2 drop-shadow-lg" />
                      {t("auth.signup")}
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  {isAdmin ? (
                    <Link to="/platform-admin">
                      <Button variant="outline" className="border-2 border-primary/30 text-primary font-bold hover:bg-gradient-to-r hover:from-primary/18 hover:to-accent/15 hover:border-primary/45 shadow-md hover:shadow-lg transition-all">
                        <Crown className="w-5 h-5 ml-2 drop-shadow" />
                        Admin
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/dashboard">
                      <Button variant="outline" className="border-2 border-primary/30 text-primary font-bold hover:bg-gradient-to-r hover:from-primary/18 hover:to-accent/15 hover:border-primary/45 shadow-md hover:shadow-lg transition-all">
                        <LayoutDashboard className="w-5 h-5 ml-2 drop-shadow" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="border-2 border-destructive/30 text-destructive font-bold hover:bg-gradient-to-r hover:from-destructive/18 hover:to-destructive/15 hover:border-destructive/45 shadow-md hover:shadow-lg transition-all"
                  >
                    <LogOut className="w-5 h-5 ml-2 drop-shadow" />
                    {t("auth.logout")}
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-lg border-2 border-primary/25 bg-gradient-to-br from-primary/10 to-accent/8 hover:bg-gradient-to-br hover:from-primary/18 hover:to-accent/14 hover:border-primary/40 transition-all shadow-md hover:shadow-lg dark:bg-gradient-to-br dark:from-primary/12 dark:to-accent/10"
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
        <div className="lg:hidden fixed inset-0 top-20 z-40 bg-background/96 backdrop-blur-xl border-t border-primary/12">
          <div className="container mx-auto px-4 py-6">
            <nav className="flex flex-col gap-2">
              {!user && (
                <Link 
                  to="/marketplace" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-base font-bold text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/12 hover:to-accent/10 transition-all border border-transparent hover:border-primary/15 shadow-sm hover:shadow-md"
                >
                  Marketplace
                </Link>
              )}
              <Link 
                to="/pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-bold text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/12 hover:to-accent/10 transition-all border border-transparent hover:border-primary/15 shadow-sm hover:shadow-md"
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-bold text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/12 hover:to-accent/10 transition-all border border-transparent hover:border-primary/15 shadow-sm hover:shadow-md"
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-bold text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/12 hover:to-accent/10 transition-all border border-transparent hover:border-primary/15 shadow-sm hover:shadow-md"
              >
                Support
              </Link>

              {user && (
                <>
                  <div className="h-px bg-border/40 my-2" />
                  {isAdmin ? (
                    <Link to="/platform-admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="justify-start border-2 border-primary/30 text-primary hover:bg-gradient-to-r hover:from-primary/15 hover:to-accent/10 hover:border-primary/45 font-bold w-full shadow-sm hover:shadow-md">
                        <Crown className="w-5 h-5 ml-2 drop-shadow" />
                        Admin
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="justify-start border-2 border-primary/30 text-primary hover:bg-gradient-to-r hover:from-primary/15 hover:to-accent/10 hover:border-primary/45 font-bold w-full shadow-sm hover:shadow-md">
                        <LayoutDashboard className="w-5 h-5 ml-2 drop-shadow" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  {isClient && (
                    <Link to="/dashboard/preview" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="justify-start border-2 border-primary/30 text-primary hover:bg-gradient-to-r hover:from-primary/15 hover:to-accent/10 hover:border-primary/45 font-bold w-full shadow-sm hover:shadow-md">
                        <ShoppingBag className="w-5 h-5 ml-2 drop-shadow" />
                        My Store
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="justify-start border-2 border-destructive/30 text-destructive hover:bg-gradient-to-r hover:from-destructive/15 hover:to-destructive/10 hover:border-destructive/45 font-bold w-full shadow-sm hover:shadow-md"
                  >
                    <LogOut className="w-5 h-5 ml-2 drop-shadow" />
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
