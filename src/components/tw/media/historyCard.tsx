import { useTranslation } from "react-i18next";

import { StatusMark } from "../generic/badges";
import { Card } from "../generic/card";

import { RatingDisplay } from "./ratingDisplay";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MediaLogResponse } from "@/types/logged";
import { formatFromIsoDate } from "@/utils/date";
import { formatProgress } from "@/utils/mediaText";

interface MediaLogCardProps {
  log: MediaLogResponse;
  isOneTimeConsuption: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const MediaLogCard = ({ log, isOneTimeConsuption, onEdit, onDelete }: MediaLogCardProps) => {
  const { t } = useTranslation("media");
  const progressLabel = formatProgress(log.progress, log.progressTotal);

  return (
    <Card className="gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {(log.startDate || log.endDate) && isOneTimeConsuption ? (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-step-1 text-muted-foreground">
            {log.endDate && <span>{t("history.viewedOn")} {formatFromIsoDate(log.endDate)}</span>}
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-step-1 text-muted-foreground">
            {log.startDate && <span>{t("history.startedOn")} {formatFromIsoDate(log.startDate)}</span>}
            {log.endDate && <span>{t("history.endedOn")} {formatFromIsoDate(log.endDate)}</span>}
          </div>
        )}

        {log.status && <StatusMark status={log.status} />}
      </div>

      {progressLabel && (
        <div className="text-step-1 tabular-nums text-muted-foreground">
          {t("track.progress")}: {progressLabel}
        </div>
      )}

      {typeof log.rating === "number" && log.rating > 0 && (
        <RatingDisplay rating={log.rating} />
      )}

      {log.review && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={`review-${log.id}`}>
            <AccordionTrigger>{t("history.viewReview")}</AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-wrap text-step-1 text-muted-foreground">
                {log.review}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-2">
          {onEdit && (
            <Button type="button" variant="ghost" size="xs" onClick={onEdit}>
              {t("actions.editLog")}
            </Button>
          )}

          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              {t("actions.deleteLog")}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
