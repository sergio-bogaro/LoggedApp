import { useTranslation } from "react-i18next";

import { StatusMark } from "../generic/badges";
import { LogFields } from "../log/LogFields";

import { Button } from "@/components/ui/button";
import { MediaLogResponse } from "@/types/logged";
import { MediaTypeEnum } from "@/types/media";
import { formatFromIsoDate } from "@/utils/date";

interface MediaLogCardProps {
  log: MediaLogResponse;
  mediaType?: MediaTypeEnum;
  onEdit?: () => void;
  onDelete?: () => void;
}

/*
 * One entry in the log history. The date is the entry's identity, so it leads
 * in the display face; the rest of the log reads as the same definition list
 * used everywhere else. Plain sections divided by hairlines — no cards inside
 * the dialog plane.
 */
export const MediaLogCard = ({ log, mediaType, onEdit, onDelete }: MediaLogCardProps) => {
  const { t } = useTranslation("media");

  const date = log.date ? formatFromIsoDate(log.date) : null;

  return (
    <section className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-step-3 font-medium tabular-nums">{date ?? "—"}</h3>
        {log.status && <StatusMark status={log.status} />}
      </div>

      <div className="mt-3">
        <LogFields log={log} mediaType={mediaType} showDate={false} showStatus={false} showEmptyReview={false} />
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-3 flex justify-end gap-2">
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
    </section>
  );
};
