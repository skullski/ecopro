import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/lib/i18n";
import { ShoppingBag, Menu, X, LogOut, Package, User as UserIcon, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function MarketplaceHeader() {
  const { toggle, theme } = useTheme();
  const { locale, setLocale } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
  const isMarketplaceUser = user?.role === "seller" || user?.role === "admin";

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAdmin");
    navigate("/marketplace");
  }
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-cold-border bg-background backdrop-blur-lg shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <Link to="/marketplace" className="flex items-center gap-3 group z-10">
              <div className="relative">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cold-blue shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="w-5 h-5 text-cold-cyan" strokeWidth={2.5} />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-extrabold text-foreground drop-shadow-md">
                  Marketplace
                </span>
                <div className="text-[10px] text-foreground/80 font-medium -mt-1">Buy & Sell Locally</div>
              </div>
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link 
                to="/" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:text-cold-cyan hover:bg-cold-blue/30 transition-all"
              >
                Platform Home
              </Link>
              <Link 
                to="/marketplace" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:text-cold-cyan hover:bg-cold-blue/30 transition-all"
              >
                Marketplace
              </Link>
              <Link 
                to="/about" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:text-cold-cyan hover:bg-cold-blue/30 transition-all"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:text-cold-cyan hover:bg-cold-blue/30 transition-all"
              >
                Help
              </Link>
            </nav>
            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="hidden md:block relative">
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="px-4 py-2.5 rounded-lg border-2 border-accent/30 bg-accent/10 backdrop-blur-sm text-black dark:text-accent text-sm font-medium hover:border-accent/50 focus:border-accent/60 focus:outline-none transition-all flex items-center gap-2"
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
                      🇩🇿 AR
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
                aria-label="Toggle theme"
                className="p-2 rounded-lg border-2 border-accent/30 bg-accent/10 backdrop-blur-sm hover:bg-accent/20 hover:border-accent/50 transition-all"
              >
                {theme === "dark" ? (
                  <span className="text-base text-accent">🌙</span>
                ) : (
                  <span className="text-base text-accent">☀️</span>
                )}
              </button>
              {!isMarketplaceUser ? (
                <>
                  <Link to="/seller/login" className="hidden md:inline-block">
                    <Button 
                      variant="outline" 
                      className="text-foreground hover:bg-white/20 font-medium border border-white/30"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/seller/signup">
                    <Button className="bg-accent text-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all font-bold">
                      <Package className="w-4 h-4 mr-2" />
                      Start Selling
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/seller/dashboard">
                    <Button variant="outline" className="text-foreground hover:bg-accent/10 font-medium border border-accent/30">
                      <Package className="w-4 h-4 mr-2" />
                      My Products
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="text-foreground hover:bg-accent/10 font-medium border border-accent/30"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg border-2 border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:border-white/50 transition-all"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-6">
            <nav className="flex flex-col gap-2">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-white/20 transition-all"
              >
                Platform Home
              </Link>
              <Link 
                to="/marketplace" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-white/20 transition-all"
              >
                Marketplace
              </Link>
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-white/20 transition-all"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-white/20 transition-all"
              >
                Help
              </Link>
              {isMarketplaceUser ? (
                <>
                  <div className="h-px bg-white/20 my-2" />
                  <Link to="/seller/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="justify-start text-foreground hover:bg-white/20 font-medium w-full border border-white/30">
                      <Package className="w-4 h-4 mr-2" />
                      My Products
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="justify-start text-foreground hover:bg-white/20 font-medium w-full border border-white/30"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <div className="h-px bg-white/20 my-2" />
                  <Link to="/seller/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="justify-start text-foreground hover:bg-white/20 font-medium w-full border border-white/30">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/seller/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="justify-start bg-accent text-foreground hover:bg-accent/90 font-bold w-full">
                      <Package className="w-4 h-4 mr-2" />
                      Start Selling
                    </Button>
                  </Link>
                </>
              )}
              <div className="md:hidden mt-4">
                <select 
                  value={locale} 
                  onChange={(e) => setLocale(e.target.value as 'ar' | 'en' | 'fr')} 
                  className="w-full px-3 py-2 rounded-lg border-2 border-white/30 bg-white/20 backdrop-blur-sm text-foreground text-sm font-medium"
                >
                  <option value="ar" className="text-gray-900">🇩🇿 العربية</option>
                  <option value="en" className="text-gray-900">🇬🇧 English</option>
                  <option value="fr" className="text-gray-900">🇫🇷 Français</option>
                </select>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
