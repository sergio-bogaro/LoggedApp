import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface StatIndexItem {
  label: string;
  value: ReactNode;
  hint?: string;
}

interface StatsHeadlineProps {
  label: string;
  value: ReactNode;
  caption?: string;
  index: StatIndexItem[];
  /** "below" stacks the index under the figure; "inline" sets it beside it. */
  indexPlacement?: "below" | "inline";
}

/*
 * One figure carries the screen and everything else is a typographic index
 * under it. Numbers are set in the display face with tabular figures so the
 * index aligns as a column instead of scattering into a row of badges.
 */
export const StatsHeadline = ({ label, value, caption, index, indexPlacement = "below" }: StatsHeadlineProps) => {
  const inline = indexPlacement === "inline";

  return (
    <div className="border-t border-border pt-6">
      <p className="text-step-1 text-muted-foreground">{label}</p>

      <div className={cn(
        inline ? "mt-1 flex flex-wrap items-end gap-x-10 gap-y-5" : undefined
      )}>
        <p className="font-serif text-step-8 leading-none tabular-nums sm:text-[4.25rem]">{value}</p>

        {inline && index.length > 0 && (
          <dl className="flex flex-wrap items-end gap-x-8 gap-y-4">
            {index.map((item) => (
              <div key={item.label} className="min-w-20">
                <dt className="text-step-1 text-muted-foreground">{item.label}</dt>

                <dd className="mt-0.5 font-serif text-step-4 tabular-nums">{item.value}</dd>

                {item.hint && <p className="mt-0.5 text-step-0 text-muted-foreground">{item.hint}</p>}
              </div>
            ))}
          </dl>
        )}
      </div>

      {caption && <p className="mt-3 text-step-1 text-muted-foreground">{caption}</p>}

      {!inline && index.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
          {index.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-step-1 text-muted-foreground">{item.label}</dt>

              <dd className="font-serif text-step-4 tabular-nums">{item.value}</dd>

              {item.hint && <p className="text-step-1 text-muted-foreground">{item.hint}</p>}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};
