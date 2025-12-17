import React from "react";
import { Outlet } from "react-router-dom";

export default function StoreLayout() {
  // Each template now has its own header and styling, so we don't need a shared header here
  // Let child components control their own backgrounds
  return (
    <Outlet />
  );
}
