import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ChartBlockProps {
  title: string;
  /** Defaults to the title. Pass a fuller sentence when the title is terse. */
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  chartClassName?: string;
}

/*
 * Charts carry no card chrome. The surface is the page, the title names the
 * chart, and separation comes from rhythm — wrapping every one in the same
 * rounded box is what makes a statistics screen read as a template.
 */
export const ChartBlock = ({ title, ariaLabel, children, className, chartClassName }: ChartBlockProps) => {
  return (
    <section className={cn("min-w-0", className)}>
      <h3 className="mb-3 text-step-2 font-medium">{title}</h3>

      <div role="img" aria-label={ariaLabel ?? title} className={cn("relative h-56", chartClassName)}>
        {children}
      </div>
    </section>
  );
};
