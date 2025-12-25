import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/lib/i18n";
import { Sparkles, Menu, X, LogOut, LayoutDashboard, ShoppingBag, Crown, PlusCircle, ChevronDown, MessageCircle } from "lucide-react";
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
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 backdrop-blur-xl supports-[backdrop-filter]:bg-background/90 shadow-lg shadow-primary/10 dark:bg-gradient-to-r dark:from-primary/15 dark:via-accent/10 dark:to-primary/15">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex h-12 sm:h-14 items-center justify-between">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-2 group z-10">
              {/* Modern Logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60"></div>
                <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-primary via-accent to-purple-600 shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border border-primary/20">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" strokeWidth={2.5} />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background animate-pulse"></div>
                </div>
              </div>
              
              <div className="hidden sm:block">
                <span className="text-base sm:text-lg font-black text-foreground drop-shadow bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t("brand")}
                </span>
                <div className="text-[9px] text-foreground/70 font-semibold -mt-0.5">منصة التجارة</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link 
                to="/pricing" 
                className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/10 transition-all"
              >
                Support
              </Link>
              {user && isClient && (
                <>
                  <Link 
                    to="/dashboard/preview" 
                    className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold text-accent hover:bg-accent/10 transition-all border border-accent/20"
                  >
                    My Store
                  </Link>
                </>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1.5">
              {/* Language Selector */}
              <div className="hidden md:block relative">
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="px-2.5 py-1.5 rounded-md border border-primary/20 bg-primary/5 text-xs font-semibold hover:bg-primary/10 transition-all flex items-center gap-1.5"
                >
                  <span>{locale === 'ar' ? '🇩🇿' : locale === 'en' ? '🇬🇧' : '🇫🇷'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {langMenuOpen && (
                  <div className="absolute top-full mt-1 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-max">
                    <button 
                      onClick={() => { setLocale('ar'); setLangMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 first:rounded-t-lg transition-colors"
                    >
                      🇩🇿 العربية
                    </button>
                    <button 
                      onClick={() => { setLocale('en'); setLangMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs sm:text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      🇬🇧 EN
                    </button>
                    <button 
                      onClick={() => { setLocale('fr'); setLangMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs sm:text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 last:rounded-b-lg transition-colors"
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
                className="p-1.5 rounded-md border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all"
              >
                {theme === "dark" ? (
                  <span className="text-sm">🌙</span>
                ) : (
                  <span className="text-sm">☀️</span>
                )}
              </button>

              {!user ? (
                <>
                  <Link to="/login" className="hidden md:inline-block">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-xs font-semibold text-foreground hover:text-primary hover:bg-primary/10"
                    >
                      {t("auth.login")}
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md text-xs font-semibold text-white">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      {t("auth.signup")}
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-1.5">
                  {isAdmin ? (
                    <>
                      <Link to="/platform-admin/chat">
                        <Button variant="outline" size="sm" className="text-xs border-blue-400/30 text-blue-600 font-semibold hover:bg-blue-400/10">
                          <MessageCircle className="w-3.5 h-3.5 mr-1" />
                          Chat
                        </Button>
                      </Link>
                      <Link to="/platform-admin">
                        <Button variant="outline" size="sm" className="text-xs border-primary/30 text-primary font-semibold hover:bg-primary/10">
                          <Crown className="w-3.5 h-3.5 mr-1" />
                          Admin
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link to="/dashboard">
                      <Button variant="outline" size="sm" className="text-xs border-primary/30 text-primary font-semibold hover:bg-primary/10">
                        <LayoutDashboard className="w-3.5 h-3.5 mr-1" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-xs border-destructive/30 text-destructive font-semibold hover:bg-destructive/10"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    {t("auth.logout")}
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-md border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all"
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
                    <>
                      <Link to="/platform-admin/chat" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="justify-start border-2 border-blue-400/30 text-blue-600 hover:bg-gradient-to-r hover:from-blue-400/15 hover:to-blue-400/10 hover:border-blue-400/45 font-bold w-full shadow-sm hover:shadow-md">
                          <MessageCircle className="w-5 h-5 ml-2 drop-shadow" />
                          Chat
                        </Button>
                      </Link>
                      <Link to="/platform-admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="justify-start border-2 border-primary/30 text-primary hover:bg-gradient-to-r hover:from-primary/15 hover:to-accent/10 hover:border-primary/45 font-bold w-full shadow-sm hover:shadow-md">
                          <Crown className="w-5 h-5 ml-2 drop-shadow" />
                          Admin
                        </Button>
                      </Link>
                    </>
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
