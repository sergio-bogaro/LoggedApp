import { useTranslation } from "react-i18next";

import { StatusBadge } from "../generic/badges";
import { Card } from "../generic/card";

import { RatingDisplay } from "./ratingDisplay";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MediaLogResponse } from "@/types/logged";
import { formatFromIsoDate } from "@/utils/date";

export const LogCard = ({ log }: { log: MediaLogResponse | null }) => {
  const { t } = useTranslation("media");

  if (!log) return null;

  return (
    <Card className="gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {log.date && (
            <span>{t("history.viewedOn")} {formatFromIsoDate(log.date)}</span>
          )}
        </div>

        {log.status && <StatusBadge status={log.status} />}
      </div>

      {typeof log.rating === "number" && log.rating > 0 && (
        <RatingDisplay rating={log.rating} />
      )}

      {log.review && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="review">
            <AccordionTrigger>{t("history.viewReview")}</AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {log.review}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </Card>
  );
}
