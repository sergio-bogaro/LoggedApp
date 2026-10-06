import { useTranslation } from "react-i18next";

import {
  SelectBase,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ImportFilterKey =
  | "log"
  | "backlog"
  | "validated"
  | "attention"
  | "errors";

export type ImportFilterValue = ImportFilterKey | "all";

const FILTERS: { key: ImportFilterKey; labelKey: string }[] = [
  { key: "log", labelKey: "filters.log" },
  { key: "backlog", labelKey: "filters.backlog" },
  { key: "validated", labelKey: "filters.validated" },
  { key: "attention", labelKey: "filters.attention" },
  { key: "errors", labelKey: "filters.errors" },
];

interface ImportFiltersProps {
  value: ImportFilterValue;
  counts: Record<ImportFilterKey, number>;
  onChange: (value: ImportFilterValue) => void;
}

export function ImportFilters({ value, counts, onChange }: ImportFiltersProps) {
  const { t } = useTranslation("import");

  return (
    <div className="flex flex-col gap-1">
      <label className="text-step-0 text-muted-foreground" htmlFor="import-filter">
        {t("filters.label")}
      </label>
      <SelectBase value={value} onValueChange={(next) => onChange(next as ImportFilterValue)}>
        <SelectTrigger size="sm" id="import-filter" className="w-full sm:w-64">
          <SelectValue placeholder={t("filters.all")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.all")}</SelectItem>
          {FILTERS.map(({ key, labelKey }) => (
            <SelectItem key={key} value={key}>
              {t(labelKey)}
              <span className="ml-1 tabular-nums text-muted-foreground">({counts[key]})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </SelectBase>
    </div>
  );
}
