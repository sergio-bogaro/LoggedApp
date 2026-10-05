import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ImportFilterKey =
  | "log"
  | "backlog"
  | "validated"
  | "attention"
  | "errors";

const FILTERS: { key: ImportFilterKey; labelKey: string }[] = [
  { key: "log", labelKey: "filters.log" },
  { key: "backlog", labelKey: "filters.backlog" },
  { key: "validated", labelKey: "filters.validated" },
  { key: "attention", labelKey: "filters.attention" },
  { key: "errors", labelKey: "filters.errors" },
];

interface ImportFiltersProps {
  counts: Record<ImportFilterKey, number>;
  active: ImportFilterKey[];
  onToggle: (key: ImportFilterKey) => void;
  onClear: () => void;
}

export function ImportFilters({ counts, active, onToggle, onClear }: ImportFiltersProps) {
  const { t } = useTranslation("import");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map(({ key, labelKey }) => {
        const isActive = active.includes(key);
        return (
          <Button
            key={key}
            type="button"
            size="xs"
            variant={isActive ? "default" : "outline"}
            onClick={() => onToggle(key)}
          >
            {t(labelKey)}
            <span className={cn("tabular-nums", isActive ? "opacity-80" : "text-muted-foreground")}>
              {counts[key]}
            </span>
          </Button>
        );
      })}

      {active.length > 0 && (
        <Button type="button" size="xs" variant="ghost" onClick={onClear}>
          {t("filters.clear")}
        </Button>
      )}
    </div>
  );
}
