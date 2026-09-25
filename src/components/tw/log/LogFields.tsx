import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { StatusMark } from "../generic/badges";
import { RatingDisplay } from "../media/ratingDisplay";

import { MediaLogResponse } from "@/types/logged";
import { MediaTypeEnum } from "@/types/media";
import { formatFromIsoDate } from "@/utils/date";

interface LogFieldRowProps {
  label: string;
  children: ReactNode;
}

/* The register's label/value rhythm: quiet label, value in the display face
   when it is a number. Shared by the log details dialog and the history
   entries so the three surfaces that show a log cannot drift. */
const LogFieldRow = ({ label, children }: LogFieldRowProps) => {
  return (
    <>
      <dt className="text-step-1 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-step-2">{children}</dd>
    </>
  );
};

interface LogFieldsProps {
  log: MediaLogResponse;
  mediaType?: MediaTypeEnum;
  /** Hide the date row when the caller already renders the date as a title. */
  showDate?: boolean;
  /** Hide the status row when the caller renders the status next to the title. */
  showStatus?: boolean;
  /** Render the review row even when the log has no review. */
  showEmptyReview?: boolean;
}

/*
 * The full contents of a single log, read as a definition list. Films are a
 * one-time consumption, so they show a single "viewed on" date instead of a
 * start/end period.
 */
export const LogFields = ({
  log,
  mediaType,
  showDate = true,
  showStatus = true,
  showEmptyReview = true,
}: LogFieldsProps) => {
  const { t } = useTranslation("media");

  const isOneTimeConsumption = mediaType === MediaTypeEnum.MOVIES;
  const hasRating = typeof log.rating === "number" && log.rating > 0;

  const dash = <span className="text-muted-foreground">—</span>;
  const date = log.date ? formatFromIsoDate(log.date) : null;

  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2">
      {showDate && (
        <LogFieldRow label={t("logCard.date")}>
          {date ? <span className="tabular-nums">{date}</span> : dash}
        </LogFieldRow>
      )}

      {showStatus && (
        <LogFieldRow label={t("details.status")}>
          {log.status ? <StatusMark status={log.status} /> : dash}
        </LogFieldRow>
      )}

      <LogFieldRow label={t("track.rating")}>
        {hasRating ? <RatingDisplay rating={log.rating!} /> : dash}
      </LogFieldRow>

      {isOneTimeConsumption
        ? log.endDate && (
          <LogFieldRow label={t("logCard.viewedOn")}>
            <span className="tabular-nums">{formatFromIsoDate(log.endDate)}</span>
          </LogFieldRow>
        )
        : (log.startDate || log.endDate) && (
          <>
            {log.startDate && (
              <LogFieldRow label={t("logCard.startDate")}>
                <span className="tabular-nums">{formatFromIsoDate(log.startDate)}</span>
              </LogFieldRow>
            )}

            {log.endDate && (
              <LogFieldRow label={t("logCard.endDate")}>
                <span className="tabular-nums">{formatFromIsoDate(log.endDate)}</span>
              </LogFieldRow>
            )}
          </>
        )}

      {(log.review || showEmptyReview) && (
        <LogFieldRow label={t("details.review")}>
          {log.review ? (
            <span className="whitespace-pre-wrap">{log.review}</span>
          ) : (
            <span className="text-muted-foreground">{t("logCard.noReview")}</span>
          )}
        </LogFieldRow>
      )}
    </dl>
  );
};
