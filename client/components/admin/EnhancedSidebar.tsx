import { Link, useLocation } from "react-router-dom";
import { 
  Home, Eye, Store, ShoppingCart, Tag, FileText,
  Truck, Megaphone, Star, Percent, Globe, BarChart3, 
  Users, Shield, Ban, Puzzle, CreditCard, Settings,
  ChevronDown, ChevronRight, Menu, X, Package
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { useTranslation } from "@/lib/i18n";

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

const menuItems: MenuItem[] = [
  { titleKey: "sidebar.home", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
  { titleKey: "sidebar.store", path: "/dashboard/preview", icon: <Eye className="w-5 h-5" /> },
  { titleKey: "sidebar.stock", path: "/dashboard/stock", icon: <Package className="w-5 h-5" /> },
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
    titleKey: "sidebar.analytics", 
    path: "/admin/analytics", 
    icon: <BarChart3 className="w-5 h-5" />,
    children: [
      { titleKey: "sidebar.analyticsOverview", path: "/admin/analytics", icon: <BarChart3 className="w-4 h-4" /> },
    ]
  },
  { titleKey: "sidebar.billing", path: "/admin/billing", icon: <CreditCard className="w-5 h-5" /> },
  { titleKey: "sidebar.settingsOwner", path: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
];

export function EnhancedSidebar({ onCollapseChange }: EnhancedSidebarProps = {}) {
  const { t, locale } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  
  const isRTL = locale === "ar";

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
            "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
            level > 0 && (isRTL ? "mr-4" : "ml-4"),
            active 
              ? cn(
                  "bg-gradient-to-l from-primary/20 to-accent/10 text-primary font-medium shadow-md",
                  isRTL ? "border-r-4 border-primary" : "border-l-4 border-primary"
                )
              : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
            collapsed && level === 0 && "justify-center"
          )}
        >
          {/* Active indicator */}
          {active && !collapsed && (
            <div className={cn(
              "absolute w-2 h-2 rounded-full bg-primary animate-pulse",
              isRTL ? "right-2" : "left-2"
            )}></div>
          )}
          
          <div className={cn(
            "flex-shrink-0 transition-colors",
            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {item.icon}
          </div>
          
          {!collapsed && (
            <>
              <span className="flex-1 text-sm font-medium">{t(item.titleKey)}</span>
              
              {item.badgeKey && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">
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
    <div className={cn(
      "flex flex-col h-full bg-card",
      isRTL ? "border-l" : "border-r"
    )}>
      {/* Header with unique design */}
      <div className="p-4 border-b flex items-center justify-between bg-gradient-to-br from-primary/5 to-accent/5">
        {!collapsed && (
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
              Call Verification
            </span>
            <span className="text-xs text-muted-foreground">{t("sidebar.controlPanel")}</span>
          </div>
        )}
        
        {/* Toggle button for desktop (collapse/expand) */}
        <button
          onClick={() => handleCollapse(!collapsed)}
          className="hidden lg:flex items-center justify-center p-2.5 hover:bg-primary/20 rounded-lg transition-colors border-2 border-primary/30 hover:border-primary/50 bg-primary/10"
          title={collapsed ? t("sidebar.expandMenu") : t("sidebar.collapseMenu")}
        >
          <Menu className="w-5 h-5 text-primary" />
        </button>
        
        {/* Close button for mobile drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* User Section with unique card design */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-accent/5 to-purple-500/10 p-4 border border-primary/20">
            <div className={cn(
              "absolute top-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl",
              isRTL ? "right-0" : "left-0"
            )}></div>
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg">
                WW
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">Walid Walid</div>
                <div className="text-xs text-muted-foreground truncate">admin@ecopro.com</div>
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
        "hidden lg:block fixed top-20 h-[calc(100vh-5rem)] bg-card transition-all duration-300 z-40",
        isRTL ? "right-0 border-l" : "left-0 border-r",
        collapsed ? "w-20" : "w-72"
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className={cn(
            "lg:hidden fixed top-0 h-screen w-72 bg-card shadow-2xl z-[70]",
            isRTL ? "right-0" : "left-0"
          )}>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className={cn(
          "lg:hidden fixed bottom-6 p-4 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-2xl z-[60] hover:scale-110 transition-transform",
          isRTL ? "left-6" : "right-6"
        )}
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}
