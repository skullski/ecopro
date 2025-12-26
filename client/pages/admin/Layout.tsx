import { Outlet, useNavigate } from "react-router-dom";
import { EnhancedSidebar } from "@/components/admin/EnhancedSidebar";
import { useState, useEffect } from "react";
import { useTranslation } from "../../lib/i18n";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { Bell, Search, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { locale } = useTranslation();
  const { toggle, theme } = useTheme();
  const isDark = theme === "dark";
  const isRTL = locale === "ar";
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
      // Not logged in - redirect to login
      navigate("/login");
      return;
    }
    if (user.role === "admin") {
      // Admins should not see the dashboard, redirect to admin panel
      navigate("/platform-control-x9k2m8p5q7w3");
      return;
    }
    // Only vendors/clients see the dashboard
  }, [navigate]);

  return (
    <div className={cn(
      "flex min-h-screen",
      isDark ? "bg-black" : "bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50"
    )}>
      <EnhancedSidebar onCollapseChange={setSidebarCollapsed} />
      {/* Adjust margin based on sidebar state and language direction - only on lg screens */}
      <main 
        className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          isDark ? "bg-black" : "bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50",
          // Add left/right margin on large screens to account for fixed sidebar
          isRTL 
            ? (sidebarCollapsed ? 'lg:mr-20' : 'lg:mr-72')
            : (sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72')
        )}
      >
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
