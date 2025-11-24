import React from "react";
import { Navigate } from "react-router-dom";

// Marketplace login removed — redirect to home
export default function MarketplaceLogin() {
  return <Navigate to="/" replace />;
}
