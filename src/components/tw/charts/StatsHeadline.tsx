import { ReactNode } from "react";

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
}

/*
 * One figure carries the screen and everything else is a typographic index
 * under it. Numbers are set in the display face with tabular figures so the
 * index aligns as a column instead of scattering into a row of badges.
 */
export const StatsHeadline = ({ label, value, caption, index }: StatsHeadlineProps) => {
  return (
    <div className="border-t border-border pt-5">
      <p className="text-step-1 text-muted-foreground">{label}</p>

      <p className="font-serif text-step-7 leading-none tabular-nums">{value}</p>

      {caption && <p className="mt-2 text-step-1 text-muted-foreground">{caption}</p>}

      {index.length > 0 && (
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
