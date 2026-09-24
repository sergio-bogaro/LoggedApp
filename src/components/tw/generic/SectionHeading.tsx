import { ReactNode } from "react";

import { cn } from "@/lib/utils";

/*
 * The one section heading in the app: serif, sentence case, with a hairline
 * that delimits the block below it. The month in the register, the groups in
 * statistics and the settings sections all use this, so they cannot drift.
 */
export const SectionHeading = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <h2 className={cn("border-b border-border pb-2 font-serif text-step-4 font-medium", className)}>
      {children}
    </h2>
  );
};
