import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
}

/*
 * Empty is a state, not an absence of design. The plane keeps the page from
 * collapsing into a blank sheet; the icon and action tell the visitor what to
 * do next.
 */
export const EmptyState = ({
  title,
  description,
  icon,
  action,
  children,
  className,
  titleClassName,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex min-h-60 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-12 text-center",
        className
      )}
    >
      {icon && (
        <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          {icon}
        </span>
      )}

      <p className={cn("font-serif text-step-3 font-medium text-foreground", titleClassName)}>
        {title}
      </p>

      {description && (
        <p className="mt-1.5 max-w-sm text-step-1 text-muted-foreground">{description}</p>
      )}

      {action && <div className="mt-4">{action}</div>}

      {children}
    </div>
  );
};
