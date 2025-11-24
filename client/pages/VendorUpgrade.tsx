import React from "react";
import { Link } from "react-router-dom";

export default function VendorUpgrade(): any {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upgrades Removed</h1>
      <p className="text-muted-foreground mb-4">The platform is 100% free for all users — paid VIP upgrades are no longer supported.</p>
      <p>
        You can continue to manage your store from the <Link to="/vendor-dashboard" className="text-primary underline">Vendor Dashboard</Link> or visit <Link to="/pricing" className="text-primary underline">Pricing</Link> to learn about optional future services.
      </p>
    </div>
  );
}
