import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/lib/i18n";
import { Sparkles, Menu, X, LogOut, LayoutDashboard, ShoppingBag, Crown, PlusCircle, ChevronDown, MessageCircle } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { authApi } from "@/lib/auth";
import { notifyNewMessage } from "@/utils/browserNotifications";

// Key for storing last seen timestamp
const CHAT_LAST_SEEN_KEY = 'chat_last_seen_at';

export default function Header() {
  const { toggle, theme } = useTheme();
  const { locale, setLocale, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const prevUnreadCount = useRef(0);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";
  const isClient = !isAdmin && !isSeller;

  // Fetch store slug for clients
  useEffect(() => {
    if (user && isClient) {
      fetch('/api/client/store/settings', { credentials: 'include' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.store_slug) {
            setStoreSlug(data.store_slug);
          }
        })
        .catch(() => {});
    }
  }, [user, isClient]);

  // Fetch unread messages count for clients
  const fetchUnreadCount = useCallback(async () => {
    if (!user || isAdmin) return;
    
    try {
      const res = await fetch('/api/chat/unread-count');
      if (res.ok) {
        const data = await res.json();
        const newCount = data.unread_count || 0;
        
        // Show browser notification if there are new messages (more than before)
        if (newCount > prevUnreadCount.current && newCount > 0) {
          notifyNewMessage(newCount, () => {
            navigate('/chat');
          });
        }
        
        prevUnreadCount.current = newCount;
        setUnreadCount(newCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user, isAdmin, navigate]);

  // Mark chat as seen when visiting chat page
  useEffect(() => {
    if (location.pathname === '/chat' || location.pathname.startsWith('/chat/')) {
      localStorage.setItem(CHAT_LAST_SEEN_KEY, new Date().toISOString());
      setUnreadCount(0);
      prevUnreadCount.current = 0;
    }
  }, [location.pathname]);

  // Fetch unread count on mount and periodically
  useEffect(() => {
    if (user && !isAdmin) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchUnreadCount, user, isAdmin]);

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
        <div className="container mx-auto" style={{ padding: '0 clamp(0.75rem, 2vh, 1.25rem)' }}>
          <div className="flex items-center justify-between" style={{ height: 'clamp(3rem, 7vh, 4rem)' }}>
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center group z-10" style={{ gap: 'clamp(0.5rem, 1.2vh, 0.625rem)' }}>
              {/* Modern Logo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60"></div>
                <div 
                  className="relative flex items-center justify-center rounded-lg bg-gradient-to-br from-primary via-accent to-purple-600 shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border border-primary/20"
                  style={{ width: 'clamp(2rem, 4.5vh, 2.5rem)', height: 'clamp(2rem, 4.5vh, 2.5rem)' }}
                >
                  <ShoppingBag className="text-white drop-shadow" style={{ width: 'clamp(1rem, 2.2vh, 1.25rem)', height: 'clamp(1rem, 2.2vh, 1.25rem)' }} strokeWidth={2.5} />
                  <div className="absolute -top-0.5 -right-0.5 bg-green-500 rounded-full border border-background animate-pulse" style={{ width: 'clamp(0.5rem, 1vh, 0.5rem)', height: 'clamp(0.5rem, 1vh, 0.5rem)' }}></div>
                </div>
              </div>
              
              <div className="hidden sm:block">
                <span className="font-black text-foreground drop-shadow bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontSize: 'clamp(1rem, 2.2vh, 1.125rem)' }}>
                  {t("brand")}
                </span>
                <div className="text-foreground/70 font-semibold" style={{ fontSize: 'clamp(0.6rem, 1.1vh, 0.625rem)', marginTop: '-0.125rem' }}>E-commerce Platform</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center" style={{ gap: 'clamp(0.25rem, 0.6vh, 0.375rem)' }}>
              <Link 
                to="/pricing" 
                className="rounded-md font-semibold text-foreground hover:text-primary hover:bg-primary/10 transition-all"
                style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.625rem, 1.5vh, 0.875rem)', fontSize: 'clamp(0.8rem, 1.6vh, 0.875rem)' }}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="rounded-md font-semibold text-foreground hover:text-primary hover:bg-primary/10 transition-all"
                style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.625rem, 1.5vh, 0.875rem)', fontSize: 'clamp(0.8rem, 1.6vh, 0.875rem)' }}
              >
                About
              </Link>
              {user && isClient ? (
                <Link 
                  to="/chat" 
                  className="rounded-md font-semibold text-foreground hover:text-primary hover:bg-primary/10 transition-all relative flex items-center"
                  style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.625rem, 1.5vh, 0.875rem)', fontSize: 'clamp(0.8rem, 1.6vh, 0.875rem)', gap: 'clamp(0.25rem, 0.5vh, 0.375rem)' }}
                >
                  <MessageCircle style={{ width: 'clamp(0.9rem, 1.8vh, 1rem)', height: 'clamp(0.9rem, 1.8vh, 1rem)' }} />
                  Support
                  {unreadCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white font-bold animate-pulse"
                      style={{
                        minWidth: 'clamp(1rem, 2vh, 1.25rem)',
                        height: 'clamp(1rem, 2vh, 1.25rem)',
                        fontSize: 'clamp(0.5rem, 1vh, 0.625rem)',
                        padding: '0 clamp(0.125rem, 0.3vh, 0.25rem)',
                      }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              ) : (
                <Link 
                  to="/contact" 
                  className="rounded-md font-semibold text-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.625rem, 1.5vh, 0.875rem)', fontSize: 'clamp(0.8rem, 1.6vh, 0.875rem)' }}
                >
                  Support
                </Link>
              )}
              {user && isClient && (
                <>
                  <Link 
                    to={storeSlug ? `/store/${storeSlug}` : "/dashboard/preview"} 
                    className="rounded-md font-semibold text-accent hover:bg-accent/10 transition-all border border-accent/20"
                    style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.625rem, 1.5vh, 0.875rem)', fontSize: 'clamp(0.8rem, 1.6vh, 0.875rem)' }}
                  >
                    My Store
                  </Link>
                </>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center" style={{ gap: 'clamp(0.375rem, 1vh, 0.5rem)' }}>
              {/* Language Selector */}
              <div className="hidden md:block relative">
                <button 
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="rounded-md border border-primary/20 bg-primary/5 font-semibold hover:bg-primary/10 transition-all flex items-center"
                  style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.5rem, 1.2vh, 0.625rem)', fontSize: 'clamp(0.75rem, 1.4vh, 0.8rem)', gap: 'clamp(0.3rem, 0.6vh, 0.375rem)' }}
                >
                  <span>{locale === 'ar' ? '🇩🇿' : locale === 'en' ? '🇬🇧' : '🇫🇷'}</span>
                  <ChevronDown style={{ width: 'clamp(0.75rem, 1.4vh, 0.875rem)', height: 'clamp(0.75rem, 1.4vh, 0.875rem)' }} />
                </button>
                
                {langMenuOpen && (
                  <div className="absolute top-full mt-1 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-max">
                    <button 
                      onClick={() => { setLocale('ar'); setLangMenuOpen(false); }}
                      className="w-full text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 first:rounded-t-lg transition-colors"
                      style={{ padding: 'clamp(0.5rem, 1.2vh, 0.625rem) clamp(0.75rem, 1.5vh, 0.875rem)', fontSize: 'clamp(0.8rem, 1.6vh, 0.875rem)' }}
                    >
                      🇩🇿 العربية
                    </button>
                    <button 
                      onClick={() => { setLocale('en'); setLangMenuOpen(false); }}
                      className="w-full text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      style={{ padding: 'clamp(0.5rem, 1.2vh, 0.625rem) clamp(0.75rem, 1.5vh, 0.875rem)', fontSize: 'clamp(0.8rem, 1.6vh, 0.875rem)' }}
                    >
                      🇬🇧 EN
                    </button>
                    <button 
                      onClick={() => { setLocale('fr'); setLangMenuOpen(false); }}
                      className="w-full text-left text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 last:rounded-b-lg transition-colors"
                      style={{ padding: 'clamp(0.5rem, 1.2vh, 0.625rem) clamp(0.75rem, 1.5vh, 0.875rem)', fontSize: 'clamp(0.8rem, 1.6vh, 0.875rem)' }}
                    >
                      🇫🇷 FR
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={toggle} 
                aria-label="Toggle Theme"
                className="rounded-md border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all"
                style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem)' }}
              >
                {theme === "dark" ? (
                  <span style={{ fontSize: 'clamp(0.9rem, 1.8vh, 1rem)' }}>🌙</span>
                ) : (
                  <span style={{ fontSize: 'clamp(0.9rem, 1.8vh, 1rem)' }}>☀️</span>
                )}
              </button>

              {!user ? (
                <>
                  <Link to="/login" className="hidden md:inline-block">
                    <Button 
                      variant="ghost" 
                      className="font-semibold text-foreground hover:text-primary hover:bg-primary/10"
                      style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.625rem, 1.2vh, 0.75rem)', fontSize: 'clamp(0.8rem, 1.5vh, 0.875rem)', height: 'auto' }}
                    >
                      {t("auth.login")}
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button 
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md font-semibold text-white"
                      style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.625rem, 1.2vh, 0.75rem)', fontSize: 'clamp(0.8rem, 1.5vh, 0.875rem)', height: 'auto' }}
                    >
                      <Sparkles style={{ width: 'clamp(0.85rem, 1.6vh, 0.95rem)', height: 'clamp(0.85rem, 1.6vh, 0.95rem)', marginRight: 'clamp(0.2rem, 0.4vh, 0.25rem)' }} />
                      {t("auth.signup")}
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="hidden md:flex items-center" style={{ gap: 'clamp(0.375rem, 1vh, 0.5rem)' }}>
                  {isAdmin ? (
                    <>
                      <Link to="/platform-admin/chat">
                        <Button 
                          variant="outline" 
                          className="border-blue-400/30 text-blue-600 font-semibold hover:bg-blue-400/10"
                          style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.625rem, 1.2vh, 0.75rem)', fontSize: 'clamp(0.8rem, 1.5vh, 0.875rem)', height: 'auto' }}
                        >
                          <MessageCircle style={{ width: 'clamp(0.85rem, 1.6vh, 0.95rem)', height: 'clamp(0.85rem, 1.6vh, 0.95rem)', marginRight: 'clamp(0.2rem, 0.4vh, 0.25rem)' }} />
                          Chat
                        </Button>
                      </Link>
                      <Link to="/platform-admin">
                        <Button 
                          variant="outline" 
                          className="border-primary/30 text-primary font-semibold hover:bg-primary/10"
                          style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.625rem, 1.2vh, 0.75rem)', fontSize: 'clamp(0.8rem, 1.5vh, 0.875rem)', height: 'auto' }}
                        >
                          <Crown style={{ width: 'clamp(0.85rem, 1.6vh, 0.95rem)', height: 'clamp(0.85rem, 1.6vh, 0.95rem)', marginRight: 'clamp(0.2rem, 0.4vh, 0.25rem)' }} />
                          Admin
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link to="/dashboard">
                      <Button 
                        variant="outline" 
                        className="border-primary/30 text-primary font-semibold hover:bg-primary/10"
                        style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.625rem, 1.2vh, 0.75rem)', fontSize: 'clamp(0.8rem, 1.5vh, 0.875rem)', height: 'auto' }}
                      >
                        <LayoutDashboard style={{ width: 'clamp(0.85rem, 1.6vh, 0.95rem)', height: 'clamp(0.85rem, 1.6vh, 0.95rem)', marginRight: 'clamp(0.2rem, 0.4vh, 0.25rem)' }} />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline"
                    onClick={handleLogout}
                    className="border-destructive/30 text-destructive font-semibold hover:bg-destructive/10"
                    style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.625rem, 1.2vh, 0.75rem)', fontSize: 'clamp(0.8rem, 1.5vh, 0.875rem)', height: 'auto' }}
                  >
                    <LogOut style={{ width: 'clamp(0.85rem, 1.6vh, 0.95rem)', height: 'clamp(0.85rem, 1.6vh, 0.95rem)', marginRight: 'clamp(0.2rem, 0.4vh, 0.25rem)' }} />
                    {t("auth.logout")}
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden rounded-md border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all"
                aria-label="Menu"
                style={{ padding: 'clamp(0.375rem, 1vh, 0.5rem)' }}
              >
                {mobileMenuOpen ? (
                  <X style={{ width: 'clamp(1.25rem, 2.8vh, 1.5rem)', height: 'clamp(1.25rem, 2.8vh, 1.5rem)' }} />
                ) : (
                  <Menu style={{ width: 'clamp(1.25rem, 2.8vh, 1.5rem)', height: 'clamp(1.25rem, 2.8vh, 1.5rem)' }} />
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
              {user && isClient ? (
                <Link 
                  to="/chat" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-base font-bold text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/12 hover:to-accent/10 transition-all border border-transparent hover:border-primary/15 shadow-sm hover:shadow-md flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Support
                  </span>
                  {unreadCount > 0 && (
                    <span className="flex items-center justify-center rounded-full bg-red-500 text-white font-bold text-xs animate-pulse min-w-[1.25rem] h-5 px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              ) : (
                <Link 
                  to="/contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-base font-bold text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/12 hover:to-accent/10 transition-all border border-transparent hover:border-primary/15 shadow-sm hover:shadow-md"
                >
                  Support
                </Link>
              )}

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
                    <Link to={storeSlug ? `/store/${storeSlug}` : "/dashboard/preview"} onClick={() => setMobileMenuOpen(false)}>
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
