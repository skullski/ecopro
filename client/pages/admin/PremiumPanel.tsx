import React from "react";

// Premium management removed — platform is 100% free.
const AdminPremiumPanel: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Premium Features Removed</h1>
      <p className="text-muted-foreground">This platform is 100% free — premium management has been removed.</p>
    </div>
  );
};

export default AdminPremiumPanel;
