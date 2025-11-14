import { Outlet } from "react-router-dom";
import { EnhancedSidebar } from "@/components/admin/EnhancedSidebar";
import { useState } from "react";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <EnhancedSidebar onCollapseChange={setSidebarCollapsed} />
      {/* Adjust right margin based on sidebar state */}
      <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'mr-0 lg:mr-20' : 'mr-0 lg:mr-72'}`}>
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
