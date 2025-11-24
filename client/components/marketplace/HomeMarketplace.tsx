import React from "react";
import { Navigate } from "react-router-dom";

// Marketplace removed — HomeMarketplace no longer used
export default function HomeMarketplace() {
  return <Navigate to="/" replace />;
}
