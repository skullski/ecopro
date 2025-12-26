import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientCardProps {
  title: string;
  value?: ReactNode;
  icon?: ReactNode;
  className?: string;
  from?: string; // e.g. 'from-blue-500/20'
  to?: string;   // e.g. 'to-blue-500/5'
  border?: string; // e.g. 'border-blue-500/30'
  iconBg?: string; // e.g. 'bg-blue-500/20'
  titleClassName?: string;
  valueClassName?: string;
  children?: ReactNode;
  preset?: 'blue' | 'emerald' | 'purple' | 'orange';
}

const presets = {
  blue: {
    from: 'from-blue-500/20',
    to: 'to-cyan-500/5',
    border: 'border-blue-500/30',
    iconBg: 'bg-blue-500/20',
    value: 'text-blue-600 dark:text-blue-400',
  },
  emerald: {
    from: 'from-emerald-500/20',
    to: 'to-emerald-500/5',
    border: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/20',
    value: 'text-emerald-600 dark:text-emerald-400',
  },
  purple: {
    from: 'from-purple-500/20',
    to: 'to-pink-500/5',
    border: 'border-purple-500/30',
    iconBg: 'bg-purple-500/20',
    value: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    from: 'from-orange-500/20',
    to: 'to-red-500/5',
    border: 'border-orange-500/30',
    iconBg: 'bg-orange-500/20',
    value: 'text-orange-600 dark:text-orange-400',
  },
} as const;

export function GradientCard({
  title,
  value,
  icon,
  className,
  from = "from-primary/20",
  to = "to-primary/5",
  border = "border-primary/30",
  iconBg = "bg-primary/20",
  titleClassName,
  valueClassName,
  children,
  preset
}: GradientCardProps) {
  const theme = preset ? presets[preset] : null;
  return (
    <div
      className={cn(
        "relative rounded-xl bg-gradient-to-br border-2 p-5 md:p-6 shadow-lg overflow-hidden transition-all",
        theme?.from || from,
        theme?.to || to,
        theme?.border || border,
        // Dark mode: lift cards off black background for contrast
        "dark:from-gray-900 dark:to-gray-800 dark:border-gray-700",
        className
      )}
    >
      {/* subtle glossy shine */}
      <div className="pointer-events-none absolute inset-0 opacity-10 dark:opacity-7">
        <div className="absolute -top-8 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent dark:from-white/6 blur-md"></div>
        <div className="absolute -bottom-8 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent dark:from-white/4 blur-md"></div>
      </div>
      <div className="flex items-center gap-4">
        {icon && (
          <div className={cn("p-3 md:p-4 rounded-xl", theme?.iconBg || iconBg)}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className={cn("text-base md:text-lg text-muted-foreground truncate", titleClassName)}>{title}</div>
          {value !== undefined && (
            <div className={cn("text-2xl md:text-3xl font-bold", theme?.value || valueClassName, "dark:text-white")}>{value}</div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
