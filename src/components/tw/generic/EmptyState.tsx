import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
}

export const EmptyState = ({
  title,
  description,
  children,
  className,
  titleClassName,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex min-h-72 flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground",
        className
      )}
    >
      <p className={cn("text-lg", titleClassName)}>{title}</p>
      {description && <p className="mt-1 text-sm">{description}</p>}
      {children}
    </div>
  );
};
