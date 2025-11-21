import React from "react";
import { BarChart, PieChart, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const PremiumDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Premium Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 shadow-md">
          <h2 className="text-lg font-bold mb-2">Sales Analytics</h2>
          <BarChart className="w-16 h-16 text-primary mx-auto" />
          <p className="text-sm text-gray-600 mt-2">Track your sales performance over time.</p>
        </div>
        <div className="border rounded-lg p-4 shadow-md">
          <h2 className="text-lg font-bold mb-2">Customer Insights</h2>
          <PieChart className="w-16 h-16 text-primary mx-auto" />
          <p className="text-sm text-gray-600 mt-2">Understand your customer demographics.</p>
        </div>
        <div className="border rounded-lg p-4 shadow-md">
          <h2 className="text-lg font-bold mb-2">Revenue Trends</h2>
          <LineChart className="w-16 h-16 text-primary mx-auto" />
          <p className="text-sm text-gray-600 mt-2">Analyze your revenue growth patterns.</p>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Button className="bg-primary text-white font-bold py-2 px-4 rounded">
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
};

export default PremiumDashboard;