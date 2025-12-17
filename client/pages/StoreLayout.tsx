import React from "react";
import { Outlet } from "react-router-dom";

export default function StoreLayout() {
  // Each template now has its own header, so we don't need a shared header here
  return (
    <div className="min-h-screen bg-[#0a0c15]">
      <Outlet />
    </div>
  );
}
