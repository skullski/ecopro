import { Link, useLocation } from "react-router-dom";
import { 
  Home, Eye, Store, ShoppingCart, Tag, FileText,
  Truck, Megaphone, Star, Percent, Globe, BarChart3, 
  Users, Shield, Ban, Puzzle, CreditCard, Settings,
  ChevronDown, ChevronRight, Menu, X, Package, Bot,
  Divide, Palette
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/contexts/ThemeContext";

interface MenuItem {
  titleKey: string;
  path: string;
  icon: React.ReactNode;
  badgeKey?: string;
  children?: MenuItem[];
}

interface EnhancedSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

// Professional futuristic color themes for sidebar - 4 dark + 4 light
const SIDEBAR_THEMES = {
  // Light themes
  slate: { bg: '#f1f5f9', text: '#1e293b', accent: '#0f172a', border: '#e2e8f0' },
  frost: { bg: '#f0f9ff', text: '#0c2d57', accent: '#0369a1', border: '#bae6fd' },
  cream: { bg: '#fffbf0', text: '#7c2d12', accent: '#ea580c', border: '#fed7aa' },
  mint: { bg: '#f0fdf4', text: '#14532d', accent: '#15803d', border: '#bbf7d0' },
  
  // Dark themes
  navy: { bg: '#0f172a', text: '#f1f5f9', accent: '#3b82f6', border: '#1e293b' },
  cyberpunk: { bg: '#0a0e27', text: '#00ff88', accent: '#00ff88', border: '#1a4d2e' },
  neon: { bg: '#1a1a2e', text: '#e0ffff', accent: '#00d9ff', border: '#16213e' },
  matrix: { bg: '#000000', text: '#00ff00', accent: '#00ff00', border: '#003300' },
};

// Professional category colors
const CATEGORY_COLORS: { [key: string]: string } = {
  home: '#3b82f6',      // Blue
  store: '#10b981',     // Green
  stock: '#f59e0b',     // Amber
  orders: '#ef4444',    // Red
  delivery: '#8b5cf6',  // Purple
  addons: '#ec4899',    // Pink
  wasselni: '#06b6d4',  // Cyan
  analytics: '#6366f1', // Indigo
  billing: '#14b8a6',   // Teal
  settings: '#6b7280',  // Gray
};

const menuItems: MenuItem[] = [
  { titleKey: "sidebar.home", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
  { titleKey: "sidebar.store", path: "/dashboard/preview", icon: <Eye className="w-5 h-5" /> },
  { titleKey: "sidebar.stock", path: "/dashboard/stock", icon: <Package className="w-5 h-5" /> },
  { titleKey: "sidebar.products", path: "/dashboard/products", icon: <Tag className="w-5 h-5" /> },
  { titleKey: "sidebar.orders", path: "/dashboard/orders", icon: <ShoppingCart className="w-5 h-5" /> },
  { 
    titleKey: "sidebar.delivery", 
    path: "/dashboard/delivery/companies", 
    icon: <Truck className="w-5 h-5" />,
  },
  { 
    titleKey: "sidebar.addons", 
    path: "/dashboard/addons/google-sheets", 
    icon: <Puzzle className="w-5 h-5" />,
  },
  { 
    titleKey: "sidebar.wasselni", 
    path: "/dashboard/wasselni-settings", 
    icon: <Bot className="w-5 h-5" />,
  },
  { titleKey: "sidebar.analytics", path: "/dashboard/analytics", icon: <BarChart3 className="w-5 h-5" /> },
  { titleKey: "sidebar.staff", path: "/dashboard/staff", icon: <Users className="w-5 h-5" /> },
  { titleKey: "sidebar.billing", path: "/dashboard/billing", icon: <CreditCard className="w-5 h-5" /> },
  { titleKey: "sidebar.settingsOwner", path: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
];

export function EnhancedSidebar({ onCollapseChange }: EnhancedSidebarProps = {}) {
  const { t, locale } = useTranslation();
  const { theme: platformTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  
  // Load theme state from localStorage
  const [themeCustomizationEnabled, setThemeCustomizationEnabled] = useState(() => {
    const saved = localStorage.getItem('sidebarThemeCustomizationEnabled');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [sidebarTheme, setSidebarTheme] = useState<keyof typeof SIDEBAR_THEMES>(() => {
    const saved = localStorage.getItem('sidebarTheme');
    return saved ? JSON.parse(saved) : 'slate';
  });
  
  const location = useLocation();
  
  // Save theme state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarThemeCustomizationEnabled', JSON.stringify(themeCustomizationEnabled));
  }, [themeCustomizationEnabled]);
  
  useEffect(() => {
    localStorage.setItem('sidebarTheme', JSON.stringify(sidebarTheme));
  }, [sidebarTheme]);
  
  const isRTL = locale === "ar";

  // Determine active theme based on customization toggle and platform theme
  const getActiveTheme = (): keyof typeof SIDEBAR_THEMES => {
    if (themeCustomizationEnabled) {
      return sidebarTheme; // Use user's selected custom theme
    }
    // When customization is OFF, sync with platform theme
    return platformTheme === 'dark' ? 'navy' : 'slate';
  };

  const activeTheme = getActiveTheme();

  const handleCollapse = (newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const toggleExpand = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (item: MenuItem) => 
    item.children?.some(child => location.pathname === child.path);

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const active = isActive(item.path) || isParentActive(item);
    
    // Get category color based on menu item
    const categoryKey = item.titleKey.split('.')[1] || 'home';
    const categoryColor = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.home;
    const theme = SIDEBAR_THEMES[activeTheme];

    return (
      <div key={item.path}>
        <Link
          to={hasChildren ? "#" : item.path}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              toggleExpand(item.path);
            } else {
              setMobileOpen(false);
            }
          }}
          className={cn(
            "group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
            level > 0 && (isRTL ? "mr-4" : "ml-4"),
            active 
              ? "shadow-sm font-medium"
              : "hover:bg-white hover:bg-opacity-50 text-muted-foreground hover:text-foreground",
            collapsed && level === 0 && "justify-center"
          )}
          style={{
            backgroundColor: active ? `${categoryColor}20` : 'transparent',
            color: active ? categoryColor : theme.text,
            borderLeft: active && !isRTL ? `3px solid ${categoryColor}` : 'none',
            borderRight: active && isRTL ? `3px solid ${categoryColor}` : 'none',
          }}
        >
          {/* Icon with category color */}
          <div className="flex-shrink-0 transition-colors rounded-md p-1.5" 
            style={{
              backgroundColor: `${categoryColor}20`,
              color: categoryColor,
            }}>
            {item.icon}
          </div>
          
          {!collapsed && (
            <>
              <span className="flex-1 font-bold" style={{ fontSize: '13px' }}>{t(item.titleKey)}</span>
              
              {item.badgeKey && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full text-white shadow-sm"
                  style={{ backgroundColor: categoryColor }}>
                  {t(item.badgeKey)}
                </span>
              )}
              
              {hasChildren && (
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform",
                  isExpanded && "rotate-90"
                )} />
              )}
            </>
          )}
        </Link>

        {hasChildren && isExpanded && !collapsed && (
          <div className={cn(
            "mt-1 space-y-1",
            isRTL ? "mr-2" : "ml-2"
          )}>
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full pt-20 transition-all duration-300"
      style={{
        backgroundColor: SIDEBAR_THEMES[activeTheme].bg,
        color: SIDEBAR_THEMES[activeTheme].text,
        borderColor: SIDEBAR_THEMES[activeTheme].border,
      }}>
      {/* Header with unique design */}
      <div className="p-2 border-b flex items-center justify-between transition-all duration-300"
        style={{
          backgroundColor: SIDEBAR_THEMES[activeTheme].bg,
          borderColor: SIDEBAR_THEMES[activeTheme].border,
          lineHeight: '1.2',
        }}>
        {!collapsed && (
          <div>
            <span className="font-bold block transition-colors duration-200" 
              style={{ color: SIDEBAR_THEMES[activeTheme].accent, fontSize: '14px' }}>
              {t('sidebar.brand')}
            </span>
            <span className="transition-colors duration-200" 
              style={{ color: SIDEBAR_THEMES[activeTheme].text, fontSize: '16px' }}>
              {t("sidebar.controlPanel")}
            </span>
          </div>
        )}
        
        {/* Toggle button for desktop (collapse/expand) */}
        <button
          onClick={() => handleCollapse(!collapsed)}
          className="hidden lg:flex items-center justify-center p-2.5 rounded-lg transition-all border duration-200"
          style={{
            borderColor: SIDEBAR_THEMES[activeTheme].border,
            color: SIDEBAR_THEMES[activeTheme].accent,
            backgroundColor: `${SIDEBAR_THEMES[activeTheme].accent}10`,
          }}
          title={collapsed ? t("sidebar.expandMenu") : t("sidebar.collapseMenu")}
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Close button for mobile drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg transition-all"
          style={{ color: SIDEBAR_THEMES[activeTheme].accent }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Color Picker and User Section */}
      {!collapsed && (
        <div className="p-4 border-t space-y-3 transition-all duration-300"
          style={{
            borderColor: SIDEBAR_THEMES[activeTheme].border,
          }}>
          
          {/* Theme Customization Toggle */}
          <div className="flex items-center justify-between px-2">
            <span className="font-semibold uppercase tracking-wide" style={{ color: SIDEBAR_THEMES[activeTheme].text, fontSize: '11px' }}>
              {t("sidebar.customizeColor") || "Theme"}
            </span>
            <button
              onClick={() => setThemeCustomizationEnabled(!themeCustomizationEnabled)}
              className={cn(
                "relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0",
                themeCustomizationEnabled 
                  ? "bg-green-500 shadow-lg shadow-green-500/50" 
                  : "bg-gray-400"
              )}
              title={themeCustomizationEnabled ? "Disable theme" : "Enable theme"}
            >
              <div
                className={cn(
                  "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md",
                  themeCustomizationEnabled && "translate-x-5"
                )}
              />
            </button>
          </div>
          
          {/* Color Picker Button - Only visible when enabled */}
          {themeCustomizationEnabled && (
            <div className="relative">
              <button
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-200 font-medium text-sm"
                style={{
                  backgroundColor: `${SIDEBAR_THEMES[activeTheme].accent}10`,
                  borderColor: SIDEBAR_THEMES[activeTheme].accent,
                  color: SIDEBAR_THEMES[activeTheme].accent,
                }}
              >
                <Palette className="w-4 h-4" />
                {t("sidebar.selectTheme") || "Select Theme"}
              </button>
              
              {/* Color Picker Dropdown */}
              {colorPickerOpen && (
                <div className="absolute bottom-full mb-2 left-0 right-0 rounded-lg p-2 shadow-lg border z-50 backdrop-blur"
                  style={{
                    backgroundColor: SIDEBAR_THEMES[activeTheme].bg,
                    borderColor: SIDEBAR_THEMES[activeTheme].border,
                  }}>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(SIDEBAR_THEMES).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSidebarTheme(key as keyof typeof SIDEBAR_THEMES);
                          setColorPickerOpen(false);
                        }}
                        className="w-full h-12 rounded-lg border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: theme.bg,
                          borderColor: sidebarTheme === key ? theme.accent : theme.border,
                          borderWidth: sidebarTheme === key ? '3px' : '2px',
                        }}
                        title={key.charAt(0).toUpperCase() + key.slice(1)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Section with unique card design */}
          <div className="rounded-lg p-2 border transition-all duration-200"
            style={{
              backgroundColor: `${SIDEBAR_THEMES[activeTheme].accent}10`,
              borderColor: SIDEBAR_THEMES[activeTheme].border,
              lineHeight: '1.1',
            }}>
            <div className="relative flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200" 
                style={{
                  backgroundColor: SIDEBAR_THEMES[activeTheme].accent,
                  color: SIDEBAR_THEMES[activeTheme].bg,
                  fontSize: '11px',
                }}>
                WW
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate transition-colors duration-200" 
                  style={{ 
                    color: SIDEBAR_THEMES[activeTheme].accent,
                    fontSize: '13px',
                  }}>
                  SAHL
                </div>
                <div className="truncate transition-colors duration-200"
                  style={{
                    fontSize: '11px',
                    color: SIDEBAR_THEMES[activeTheme].text,
                    opacity: 0.7,
                  }}>
                  sahlsupport@gmail.com
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:block fixed top-0 h-screen transition-all duration-300 z-40",
        isRTL ? "right-0 border-l shadow-2xl" : "left-0 border-r shadow-2xl",
        collapsed ? "w-20" : "w-72"
      )}
      style={{
        backgroundColor: SIDEBAR_THEMES[activeTheme].bg,
        borderColor: SIDEBAR_THEMES[activeTheme].border,
        boxShadow: isRTL 
          ? '-8px 0 32px rgba(0, 0, 0, 0.15)' 
          : '8px 0 32px rgba(0, 0, 0, 0.15)',
      }}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-colors duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside className={cn(
            "lg:hidden fixed top-0 h-screen w-72 z-[70] border-r transition-all duration-300",
            isRTL ? "right-0" : "left-0"
          )}
          style={{
            backgroundColor: SIDEBAR_THEMES[activeTheme].bg,
            borderColor: SIDEBAR_THEMES[activeTheme].border,
            boxShadow: isRTL 
              ? '-8px 0 32px rgba(0, 0, 0, 0.2)' 
              : '8px 0 32px rgba(0, 0, 0, 0.2)',
          }}>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className={cn(
          "lg:hidden fixed bottom-6 p-4 rounded-full text-white shadow-2xl z-[60] hover:scale-110 transition-transform",
          isRTL ? "left-6" : "right-6"
        )}
        style={{
          backgroundColor: SIDEBAR_THEMES[activeTheme].accent,
        }}
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}
