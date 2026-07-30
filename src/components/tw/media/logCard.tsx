import { useTranslation } from "react-i18next";

import { Card } from "../generic/card";

import { RatingDisplay } from "./ratingDisplay";

import { MediaLogResponse } from "@/types/logged";
import { formatFromIsoDate } from "@/utils/date";

interface LogCardProps {
  log: MediaLogResponse | null;
  onClick?: () => void;
}

export const LogCard = ({ log, onClick }: LogCardProps) => {
  const { t } = useTranslation("media");

  if (!log) return null;

  const hasRating = typeof log.rating === "number" && log.rating > 0;

  return (
    <div
      className={`rounded ${onClick ? "cursor-pointer transition-colors hover:bg-accent/50" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      <Card className="gap-3">
        <span className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {hasRating ? (
            <>
              {t("logCard.youRatedThis")}
              <span className="inline-flex items-center">
                <RatingDisplay rating={log.rating!} discrete />
              </span>
              {log.date && (
                <span>- {formatFromIsoDate(log.date)}</span>
              )}
            </>
          ) : (
            <>
              {t("logCard.youLoggedThisOn")} {log.date && formatFromIsoDate(log.date)}
            </>
          )}
        </span>
      </Card>
    </div>
  );
};
