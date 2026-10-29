import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { LogRow } from "./LogRow";

import { LogDetailsDialog } from "@/components/tw/dialogs/logDetailsDialog";
import { EmptyState } from "@/components/tw/generic/EmptyState";
import { SectionHeading } from "@/components/tw/generic/SectionHeading";
import { POSTER_GRID } from "@/components/tw/media/gridSkeleton";
import { LogCard } from "@/components/tw/media/LogCard";
import { Button } from "@/components/ui/button";
import type { MediaLogWithMedia } from "@/querries/media/logged";
import type { ViewMode } from "@/store/settings/slice";
import { formatMonthLabel, monthKey } from "@/utils/date";

interface LogStreamProps {
  logs: MediaLogWithMedia[];
  /** True when a period filter is narrowing the view, for the empty message. */
  filtered?: boolean;
  /** "grid" turns each entry into a poster card; defaults to the register rows. */
  viewMode?: ViewMode;
}

/*
 * The register: entries in reverse chronological order, grouped by month.
 * Time is the spine; the month is the only structural break and the hairline
 * between rows is the ledger rule. The same spine holds in card mode, where
 * only the unit inside each month changes.
 */
export const LogStream = ({ logs, filtered = false, viewMode = "list" }: LogStreamProps) => {
  const { i18n, t } = useTranslation("media");

  const [selectedLog, setSelectedLog] = useState<MediaLogWithMedia | null>(null);
  const isGrid = viewMode === "grid";

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
      <EmptyState
        title={t("log.emptyPeriod")}
        description={t("log.emptyPeriodHint")}
      />
    ) : (
      <EmptyState
        icon={<Search aria-hidden="true" className="size-4" />}
        title={t("log.empty")}
        description={t("log.emptyHint")}
        action={
          <Button asChild size="sm">
            <Link to="/search">{t("navigation.search", { ns: "common" })}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-10">
        {!isGrid && (
          <div className="hidden grid-cols-[56px_minmax(0,1fr)_150px_110px_72px] gap-x-4 border-b border-border pb-2 pl-2 pr-12 text-step-0 text-muted-foreground md:grid">
            <span aria-hidden="true" />
            <span>{t("register.columns.title")}</span>
            <span>{t("register.columns.status")}</span>
            <span>{t("register.columns.date")}</span>
            <span className="text-right">{t("register.columns.rating")}</span>
          </div>
        )}

        {groups.map(([key, group]) => (
          <section key={key}>
            <SectionHeading className="sticky top-12 z-10 -mx-1 bg-background/95 px-1 pt-2 backdrop-blur-sm">
              {formatMonthLabel(group[0].date, i18n.language)}
            </SectionHeading>

            {isGrid ? (
              <ul className={`mt-4 ${POSTER_GRID}`}>
                {group.map((log) => (
                  <li key={log.id}>
                    <LogCard log={log} onOpenDetails={() => setSelectedLog(log)} />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="divide-y divide-border/60">
                {group.map((log) => (
                  <li key={log.id}>
                    <LogRow log={log} onOpenDetails={() => setSelectedLog(log)} />
                  </li>
                ))}
              </ul>
            )}
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
