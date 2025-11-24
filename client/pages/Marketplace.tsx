
import React from "react";
import { Navigate } from "react-router-dom";

// Marketplace feature removed — redirect to home
export default function Marketplace() {
  return <Navigate to="/" replace />;
}
