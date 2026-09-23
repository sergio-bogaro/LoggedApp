import { ReactNode } from "react";

/*
 * A definition row for third-party metadata. Unlike the register — where rows
 * are entries and rhythm alone is enough — these are table rows, so the rule
 * between them helps the eye track label to value.
 */
export const DetailsLabel = ({ label, value }: { label: string; value: string | ReactNode }) => {
  return (
    <div className="flex items-start justify-between gap-6 py-2">
      <span className="shrink-0 pt-0.5 text-step-1 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-step-2 wrap-break-word">{value}</span>
    </div>
  )
}
