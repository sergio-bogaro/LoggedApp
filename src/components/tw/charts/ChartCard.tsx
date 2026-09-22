import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  chartClassName?: string;
}

export const ChartCard = ({
  title,
  ariaLabel,
  children,
  className,
  chartClassName,
}: ChartCardProps) => {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <h3 className="mb-4 text-sm font-medium">{title}</h3>
      <div role="img" aria-label={ariaLabel} className={cn("relative h-64", chartClassName)}>
        {children}
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export const StatCard = ({ label, children, className }: StatCardProps) => {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      {children}
    </div>
  );
};
