import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type { ImportCommitItem, ImportMatchStatus } from "@/types/import";

/*
 * Match and commit status follow the same language as the rest of the app: a
 * small mark plus a label, never a colored pill. The categorical ramp already
 * owns hue (media types), so status only separates filled / hollow / muted and
 * the label carries the specific meaning.
 */
type MarkSpec = { mark: string; text: string };

const matchSpec: Record<ImportMatchStatus, MarkSpec> = {
  matched: { mark: "border-primary bg-primary", text: "text-foreground" },
  ambiguous: { mark: "border-foreground bg-transparent", text: "text-foreground" },
  already_in_library: {
    mark: "border-muted-foreground bg-muted-foreground",
    text: "text-muted-foreground",
  },
  not_found: { mark: "border-destructive bg-transparent", text: "text-destructive" },
};

export function ImportMatchMark({
  status,
  className,
}: {
  status: ImportMatchStatus;
  className?: string;
}) {
  const { t } = useTranslation("import");
  const spec = matchSpec[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-step-0", spec.text, className)}>
      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-[2px] border", spec.mark)} />
      {t(`match.status.${status}`)}
    </span>
  );
}

const outcomeSpec: Record<ImportCommitItem["outcome"], MarkSpec> = {
  imported: { mark: "border-primary bg-primary", text: "text-foreground" },
  merged: { mark: "border-foreground bg-foreground", text: "text-foreground" },
  skipped: { mark: "border-muted-foreground bg-transparent", text: "text-muted-foreground" },
  failed: { mark: "border-destructive bg-destructive", text: "text-destructive" },
};

export function ImportOutcomeMark({
  outcome,
  className,
}: {
  outcome: ImportCommitItem["outcome"];
  className?: string;
}) {
  const { t } = useTranslation("import");
  const spec = outcomeSpec[outcome];

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-step-0", spec.text, className)}>
      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-[2px] border", spec.mark)} />
      {t(`result.${outcome}`)}
    </span>
  );
}
