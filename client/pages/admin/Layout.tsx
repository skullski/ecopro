import { Outlet } from "react-router-dom";
import { EnhancedSidebar } from "@/components/admin/EnhancedSidebar";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { locale } = useTranslation();
  const isRTL = locale === "ar";

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
