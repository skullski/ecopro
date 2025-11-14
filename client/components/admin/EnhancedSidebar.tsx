import { Link, useLocation } from "react-router-dom";
import { 
  Home, Eye, Store, ShoppingCart, Tag, FileText, Layers, 
  Truck, Megaphone, Star, Percent, Globe, BarChart3, 
  Users, Shield, Ban, Puzzle, CreditCard, Settings,
  ChevronDown, ChevronRight, Menu, X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedLogo } from "@/components/ui/animated-logo";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  children?: MenuItem[];
}

interface EnhancedSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

const menuItems: MenuItem[] = [
  { title: "الرئيسية", path: "/admin", icon: <Home className="w-5 h-5" /> },
  { title: "غرض المتجر", path: "/admin/preview", icon: <Eye className="w-5 h-5" /> },
  { 
    title: "المتجر", 
    path: "/admin/stores", 
    icon: <Store className="w-5 h-5" />,
    children: [
      { title: "الشعار", path: "/admin/store/logo", icon: <Store className="w-4 h-4" /> },
      { title: "القالب", path: "/admin/store/template", icon: <FileText className="w-4 h-4" /> },
      { title: "الصفحة الرئيسية", path: "/admin/store/homepage", icon: <Home className="w-4 h-4" /> },
      { title: "معلومات الإتصال", path: "/admin/store/contact", icon: <Globe className="w-4 h-4" /> },
      { title: "الأسئلة الشائعة", path: "/admin/store/faq", icon: <FileText className="w-4 h-4" /> },
      { title: "حول المتجر", path: "/admin/store/about", icon: <FileText className="w-4 h-4" /> },
      { title: "إعدادات استمارة الطلب و سلة التسوّق", path: "/admin/store/checkout-settings", icon: <Settings className="w-4 h-4" /> },
    ]
  },
  { 
    title: "الطلبات", 
    path: "/admin/orders", 
    icon: <ShoppingCart className="w-5 h-5" />,
    children: [
      { title: "الكل", path: "/admin/orders", icon: <ShoppingCart className="w-4 h-4" /> },
      { title: "إضافة طلب", path: "/admin/orders/add", icon: <Tag className="w-4 h-4" /> },
      { title: "واش نوَجَّد ؟", path: "/admin/orders/wasselni", icon: <Truck className="w-4 h-4" /> },
      { title: "الطلبات المتروكة", path: "/admin/orders/abandoned", icon: <Ban className="w-4 h-4" /> },
      { title: "Flex Scan", path: "/admin/orders/flex-scan", icon: <BarChart3 className="w-4 h-4" /> },
    ]
  },
  { 
    title: "المنتجات", 
    path: "/admin/products", 
    icon: <Tag className="w-5 h-5" />,
    children: [
      { title: "الكل", path: "/admin/products", icon: <Tag className="w-4 h-4" /> },
      { title: "إضافة منتج", path: "/admin/products/add", icon: <Layers className="w-4 h-4" /> },
      { title: "مدير المخزون", path: "/admin/products/inventory", icon: <Layers className="w-4 h-4" /> },
    ]
  },
  { title: "التصنيفات", path: "/admin/categories", icon: <Layers className="w-5 h-5" /> },
  { 
    title: "التوصيل", 
    path: "/admin/delivery", 
    icon: <Truck className="w-5 h-5" />,
    children: [
      { title: "ولايات التوصيل", path: "/admin/delivery/regions", icon: <Globe className="w-4 h-4" /> },
      { title: "شركات التوصيل", path: "/admin/delivery/companies", icon: <Truck className="w-4 h-4" /> },
    ]
  },
  { 
    title: "أدوات التسويق", 
    path: "/admin/marketing", 
    icon: <Megaphone className="w-5 h-5" />,
    badge: "جديد",
    children: [
      { title: "فيسبوك بيكسل", path: "/admin/marketing/facebook-pixel", icon: <BarChart3 className="w-4 h-4" /> },
      { title: "فيسبوك كتالوڨ", path: "/admin/marketing/facebook-catalog", icon: <Layers className="w-4 h-4" /> },
      { title: "تيكتوك بيكسل", path: "/admin/marketing/tiktok-pixel", icon: <BarChart3 className="w-4 h-4" /> },
      { title: "Google Analytics", path: "/admin/marketing/google-analytics", icon: <BarChart3 className="w-4 h-4" /> },
      { title: "Google Tag Manager", path: "/admin/marketing/google-tag-manager", icon: <BarChart3 className="w-4 h-4" /> },
    ]
  },
  { title: "آراء الزبائن", path: "/admin/reviews", icon: <Star className="w-5 h-5" /> },
  { title: "الرموز الترويجية", path: "/admin/promo-codes", icon: <Percent className="w-5 h-5" /> },
  { title: "الدومينات", path: "/admin/domains", icon: <Globe className="w-5 h-5" /> },
  { 
    title: "الإحصائيات", 
    path: "/admin/analytics", 
    icon: <BarChart3 className="w-5 h-5" />,
    children: [
      { title: "عام", path: "/admin/analytics", icon: <BarChart3 className="w-4 h-4" /> },
      { title: "المنتجات", path: "/admin/analytics/products", icon: <Tag className="w-4 h-4" /> },
      { title: "الزيارات", path: "/admin/analytics/visits", icon: <Eye className="w-4 h-4" /> },
    ]
  },
  { title: "غُشّال المتجر", path: "/admin/workers", icon: <Users className="w-5 h-5" /> },
  { title: "القوائم السوداء", path: "/admin/blacklist", icon: <Ban className="w-5 h-5" /> },
  { title: "الزبائن المشبوهين", path: "/admin/suspicious", icon: <Shield className="w-5 h-5" /> },
  { 
    title: "الإضافات", 
    path: "/admin/addons", 
    icon: <Puzzle className="w-5 h-5" />,
    children: [
      { title: "Google Sheets", path: "/admin/addons/google-sheets", icon: <FileText className="w-4 h-4" /> },
      { title: "إشعارات Telegram", path: "/admin/addons/telegram", icon: <Megaphone className="w-4 h-4" /> },
    ]
  },
  { title: "الدفع و الإشتراكات", path: "/admin/billing", icon: <CreditCard className="w-5 h-5" /> },
  { title: "إعدادات مالك المتجر", path: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
];

export function EnhancedSidebar({ onCollapseChange }: EnhancedSidebarProps = {}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

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
            level > 0 && "mr-4",
            active 
              ? "bg-gradient-to-l from-primary/20 to-accent/10 text-primary font-medium border-r-4 border-primary shadow-md" 
              : "hover:bg-muted/60 text-muted-foreground hover:text-foreground",
            collapsed && level === 0 && "justify-center"
          )}
        >
          {/* Active indicator */}
          {active && !collapsed && (
            <div className="absolute right-2 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          )}
          
          <div className={cn(
            "flex-shrink-0 transition-colors",
            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}>
            {item.icon}
          </div>
          
          {!collapsed && (
            <>
              <span className="flex-1 text-sm font-medium">{item.title}</span>
              
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">
                  {item.badge}
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
          <div className="mt-1 space-y-1 mr-2">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-l">
      {/* Header with unique design */}
      <div className="p-4 border-b flex items-center justify-between bg-gradient-to-br from-primary/5 to-accent/5">
        {!collapsed && (
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block">
              Wasselni
            </span>
            <span className="text-xs text-muted-foreground">لوحة التحكم</span>
          </div>
        )}
        
        {/* Toggle button for desktop (collapse/expand) */}
        <button
          onClick={() => handleCollapse(!collapsed)}
          className="hidden lg:flex items-center justify-center p-2.5 hover:bg-primary/20 rounded-lg transition-colors border-2 border-primary/30 hover:border-primary/50 bg-primary/10"
          title={collapsed ? "توسيع القائمة" : "تصغير القائمة"}
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
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg">
                WW
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">Walid Walid</div>
                <div className="text-xs text-muted-foreground truncate">admin@wasselni.com</div>
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
        "hidden lg:block fixed right-0 top-20 h-[calc(100vh-5rem)] bg-card border-l transition-all duration-300 z-40",
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
          <aside className="lg:hidden fixed right-0 top-0 h-screen w-72 bg-card shadow-2xl z-[70]">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 p-4 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-2xl z-[60] hover:scale-110 transition-transform"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}
