import React from "react";
import { Navigate } from "react-router-dom";

// Marketplace signup removed — redirect to home
export default function MarketplaceSignup() {
  return <Navigate to="/" replace />;
}
