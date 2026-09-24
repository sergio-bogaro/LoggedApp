import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { StatusMark } from "../generic/badges";

import { MediaLogResponse, MediaWithLogsResponse } from "@/types/logged";
import { formatLongDate } from "@/utils/date";
import { formatProgress } from "@/utils/mediaText";

interface RecordRowProps {
  label: string;
  children: ReactNode;
}

const RecordRow = ({ label, children }: RecordRowProps) => {
  return (
    <>
      <dt className="text-step-1 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-step-2">{children}</dd>
    </>
  );
};

interface MediaRecordProps {
  media?: MediaWithLogsResponse | null;
  lastLog?: MediaLogResponse | null;
  /** When given, the last-log date becomes a button that opens its details. */
  onOpenLogDetails?: () => void;
  /** Actions that belong to the record, rendered under the definition list. */
  children?: ReactNode;
}

/*
 * The app's own data, given visual priority over the third-party metadata.
 * Numbers are set in the display face with tabular figures so they line up as
 * a column, the way a register reads.
 */
export const MediaRecord = ({ media, lastLog, onOpenLogDetails, children }: MediaRecordProps) => {
  const { i18n, t } = useTranslation("media");

  const rating = media?.rating ?? lastLog?.rating ?? null;
  const hasRating = typeof rating === "number" && rating > 0;
  const logCount = media?.logCount ?? 0;
  const progressLabel = formatProgress(lastLog?.progress, lastLog?.progressTotal);

  const period = [lastLog?.startDate, lastLog?.endDate]
    .filter((value): value is string => Boolean(value))
    .map((value) => formatLongDate(value, i18n.language))
    .join(" → ");

  const dash = <span className="text-muted-foreground">—</span>;

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-step-3 font-medium">{t("record.title")}</h2>

      {media ? (
        <>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 border-t border-border pt-3">
            <RecordRow label={t("details.status")}>
              {media.status ? <StatusMark status={media.status} /> : dash}
            </RecordRow>

            <RecordRow label={t("track.rating")}>
              {hasRating ? (
                <span className="font-serif tabular-nums text-step-4">{rating!.toFixed(1)}</span>
              ) : (
                dash
              )}
            </RecordRow>

            <RecordRow label={t("record.logs")}>
              <span className="font-serif tabular-nums">{logCount}</span>
            </RecordRow>

            {progressLabel && (
              <RecordRow label={t("track.progress")}>
                <span className="font-serif tabular-nums">{progressLabel}</span>
              </RecordRow>
            )}

            <RecordRow label={t("record.lastLog")}>
              {media.lastLogDate ? (
                onOpenLogDetails ? (
                  <button
                    type="button"
                    onClick={onOpenLogDetails}
                    className="rounded-control tabular-nums underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/25"
                  >
                    {formatLongDate(media.lastLogDate, i18n.language)}
                  </button>
                ) : (
                  <span className="tabular-nums">
                    {formatLongDate(media.lastLogDate, i18n.language)}
                  </span>
                )
              ) : (
                dash
              )}
            </RecordRow>

            {period && <RecordRow label={t("record.period")}>{period}</RecordRow>}

            {media.tags && media.tags.length > 0 && (
              <RecordRow label={t("tags.label")}>
                <span className="flex flex-wrap justify-end gap-x-2 gap-y-1 text-muted-foreground">
                  {media.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </span>
              </RecordRow>
            )}
          </dl>

          {media.review && (
            <div className="border-t border-border pt-3">
              <p className="text-step-1 text-muted-foreground">{t("record.review")}</p>
              <p className="mt-1 max-w-[70ch] whitespace-pre-wrap text-step-2">{media.review}</p>
            </div>
          )}
        </>
      ) : (
        <div className="border-t border-border pt-3">
          <p className="text-step-2">{t("record.empty")}</p>
          <p className="mt-1 text-step-1 text-muted-foreground">{t("record.emptyHint")}</p>
        </div>
      )}

      {children && <div className="flex flex-col gap-2 pt-1">{children}</div>}
    </section>
  );
};
