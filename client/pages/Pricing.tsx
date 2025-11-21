import React from "react";

export default function Pricing() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-transparent">Pricing</h1>
      <p className="text-lg mb-6 text-muted-foreground">
        <strong>Good news!</strong> Our marketplace is <span className="text-primary font-bold">100% free</span> for all users. There are no hidden fees, no subscriptions, and no premium barriers. You can list, sell, and grow your business with zero cost.
      </p>
      <div className="bg-primary/5 rounded-xl p-6 mb-6">
        <p className="text-base text-foreground">
          <span className="font-semibold">Future plans:</span> We are committed to keeping the core platform free. In the future, we may introduce optional paid tools or upgrades to help you grow even faster—such as advanced analytics, marketing boosts, or custom storefronts. But rest assured, selling and buying will always be accessible to everyone.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">Questions? <a href="/contact" className="text-primary underline">Contact support</a>.</p>
    </div>
  );
}
