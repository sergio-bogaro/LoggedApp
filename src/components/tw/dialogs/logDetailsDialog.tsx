import { useTranslation } from "react-i18next";

import { StatusMark } from "../generic/badges";
import { RatingDisplay } from "../media/ratingDisplay";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaLogResponse } from "@/types/logged";
import { MediaTypeEnum } from "@/types/media";
import { formatFromIsoDate } from "@/utils/date";
import { formatProgress } from "@/utils/mediaText";

interface LogDetailsDialogProps {
  log: MediaLogResponse | null;
  mediaType?: MediaTypeEnum;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogDetailsDialog({ log, mediaType, open, onOpenChange }: LogDetailsDialogProps) {
  const { t } = useTranslation("media");

  if (!log) return null;

  const isOneTimeConsumption = mediaType === MediaTypeEnum.MOVIES;
  const progressLabel = formatProgress(log.progress, log.progressTotal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("logCard.logDetails")}</DialogTitle>
          <DialogDescription>
            {log.date && formatFromIsoDate(log.date)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-step-1 font-medium text-muted-foreground">
                {t("details.status")}
              </span>
              <StatusMark status={log.status} />
              {!log.status && <span className="text-step-1 text-muted-foreground">-</span>}
            </div>
          </div>

          {progressLabel && (
            <div className="space-y-2">
              <span className="text-step-1 font-medium text-muted-foreground">
                {t("track.progress")}
              </span>
              <span className="text-step-1 tabular-nums">{progressLabel}</span>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-step-1 font-medium text-muted-foreground">
              {t("track.rating")}
            </span>
            {typeof log.rating === "number" && log.rating > 0 ? (
              <RatingDisplay rating={log.rating} />
            ) : (
              <span className="text-step-1 text-muted-foreground">-</span>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-step-1 font-medium text-muted-foreground">
              {t("details.review")}
            </span>

            {log.review ? (
              <p className="whitespace-pre-wrap text-step-1">{log.review}</p>
            ) : (
              <span className="text-step-1 text-muted-foreground">{t("logCard.noReview")}</span>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-step-1 font-medium text-muted-foreground">
              {t("logCard.date")}
            </span>
            <span className="text-step-1">{log.date ? formatFromIsoDate(log.date) : "-"}</span>
          </div>

          {(log.startDate || log.endDate) && (
            <div className="grid grid-cols-2 gap-4">
              {log.startDate && (
                <div className="space-y-1">
                  <span className="text-step-1 font-medium text-muted-foreground">
                    {t("logCard.startDate")}
                  </span>
                  <span className="text-step-1">{formatFromIsoDate(log.startDate)}</span>
                </div>
              )}

              {log.endDate && (
                <div className="space-y-1">
                  <span className="text-step-1 font-medium text-muted-foreground">
                    {isOneTimeConsumption ? t("logCard.viewedOn") : t("logCard.endDate")}
                  </span>
                  <span className="text-step-1">{formatFromIsoDate(log.endDate)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
