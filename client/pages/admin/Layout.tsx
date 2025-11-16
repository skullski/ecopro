import { Outlet, useNavigate } from "react-router-dom";
import { EnhancedSidebar } from "@/components/admin/EnhancedSidebar";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { locale } = useTranslation();
  const isRTL = locale === "ar";
  const navigate = useNavigate();

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
    <div className="flex min-h-screen bg-background">
      <EnhancedSidebar onCollapseChange={setSidebarCollapsed} />
      {/* Adjust margin based on sidebar state and language direction */}
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300",
        isRTL 
          ? (sidebarCollapsed ? 'mr-0 lg:mr-20' : 'mr-0 lg:mr-72')
          : (sidebarCollapsed ? 'ml-0 lg:ml-20' : 'ml-0 lg:ml-72')
      )}>
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
