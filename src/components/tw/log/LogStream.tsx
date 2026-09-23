import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { LogRow } from "./LogRow";
import { MonthDivider } from "./MonthDivider";

import { EmptyState } from "@/components/tw/generic/EmptyState";
import { MediaResponse } from "@/types/logged";
import { formatMonthLabel, monthKey } from "@/utils/date";

interface LogStreamProps {
  items: MediaResponse[];
}

/*
 * The register: entries in reverse chronological order, grouped by month.
 * Time is the spine, so the month is the only structural break and rows are
 * separated by rhythm and hover rather than by rules.
 */
export const LogStream = ({ items }: LogStreamProps) => {
  const { i18n, t } = useTranslation("media");

  const groups = useMemo(() => {
    const ordered = [...items].sort((a, b) =>
      (b.lastLogDate ?? b.createdAt).localeCompare(a.lastLogDate ?? a.createdAt)
    );

    const buckets = new Map<string, MediaResponse[]>();
    for (const item of ordered) {
      const key = monthKey(item.lastLogDate ?? item.createdAt);
      const bucket = buckets.get(key);
      if (bucket) bucket.push(item);
      else buckets.set(key, [item]);
    }

    return [...buckets.entries()];
  }, [items]);

  if (items.length === 0) {
    return <EmptyState title={t("log.empty")} description={t("log.emptyHint")} />;
  }

  return (
    <div className="space-y-8">
      {groups.map(([key, group]) => (
        <section key={key}>
          <MonthDivider
            label={formatMonthLabel(group[0].lastLogDate ?? group[0].createdAt, i18n.language)}
          />

          <ul className="mt-2">
            {group.map((item) => (
              <li key={item.id}>
                <LogRow item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};
