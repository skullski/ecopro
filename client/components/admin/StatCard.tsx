import { LucideIcon, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  badge?: {
    text: string;
    type?: "success" | "warning" | "info";
  };
}

export function StatCard({ title, value, subtitle, icon: Icon, gradient, badge }: StatCardProps) {
  const badgeColors = {
    success: "text-green-600 bg-green-50 dark:bg-green-900/20",
    warning: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    info: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center text-white shadow-lg`}>
            <Icon className="w-6 h-6" />
          </div>
          {badge && (
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${badgeColors[badge.type ?? "success"]}`}>
              <ArrowUpRight className="w-3 h-3" />
              {badge.text}
            </div>
          )}
        </div>
        <div className="text-sm text-muted-soft mb-1">{title}</div>
        <div className="text-xl md:text-2xl font-black">{value}</div>
        <div className="text-xs text-muted-soft mt-2">{subtitle}</div>
      </div>
    </Card>
  );
}
