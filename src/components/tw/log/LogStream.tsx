import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { LogRow } from "./LogRow";

import { LogDetailsDialog } from "@/components/tw/dialogs/logDetailsDialog";
import { EmptyState } from "@/components/tw/generic/EmptyState";
import { SectionHeading } from "@/components/tw/generic/SectionHeading";
import type { MediaLogWithMedia } from "@/querries/media/logged";
import { formatMonthLabel, monthKey } from "@/utils/date";

interface LogStreamProps {
  logs: MediaLogWithMedia[];
  /** True when a period filter is narrowing the view, for the empty message. */
  filtered?: boolean;
}

/*
 * The register: entries in reverse chronological order, grouped by month.
 * Time is the spine, so the month is the only structural break and rows are
 * separated by rhythm and hover rather than by rules.
 */
export const LogStream = ({ logs, filtered = false }: LogStreamProps) => {
  const { i18n, t } = useTranslation("media");

  const [selectedLog, setSelectedLog] = useState<MediaLogWithMedia | null>(null);

  const groups = useMemo(() => {
    const ordered = [...logs].sort((a, b) => b.date.localeCompare(a.date));

    const buckets = new Map<string, MediaLogWithMedia[]>();
    for (const log of ordered) {
      const key = monthKey(log.date);
      const bucket = buckets.get(key);
      if (bucket) bucket.push(log);
      else buckets.set(key, [log]);
    }

    return [...buckets.entries()];
  }, [logs]);

  if (logs.length === 0) {
    return filtered ? (
      <EmptyState title={t("log.emptyPeriod")} description={t("log.emptyPeriodHint")} />
    ) : (
      <EmptyState title={t("log.empty")} description={t("log.emptyHint")} />
    );
  }

  return (
    <>
      <div className="space-y-8">
        {groups.map(([key, group]) => (
          <section key={key}>
            <SectionHeading>{formatMonthLabel(group[0].date, i18n.language)}</SectionHeading>

            <ul className="mt-2">
              {group.map((log) => (
                <li key={log.id}>
                  <LogRow log={log} onOpenDetails={() => setSelectedLog(log)} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <LogDetailsDialog
        log={selectedLog}
        mediaType={selectedLog?.media?.type}
        open={!!selectedLog}
        onOpenChange={(next) => {
          if (!next) setSelectedLog(null);
        }}
      />
    </>
  );
};
