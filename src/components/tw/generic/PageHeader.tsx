import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  leading?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  leading,
  actions,
  className,
}: PageHeaderProps) => {
  return (
    <header className={cn("mb-4", className)}>
      <div className="flex items-center gap-3">
        {leading}
        <h1 className="min-w-0 truncate font-serif text-step-4 font-medium">{title}</h1>
        {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {description && (
        <p className="mt-1 text-step-1 text-muted-foreground">{description}</p>
      )}
    </header>
  );
};
