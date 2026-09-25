import { useTranslation } from "react-i18next";

import { LogFields } from "../log/LogFields";

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

interface LogDetailsDialogProps {
  log: MediaLogResponse | null;
  mediaType?: MediaTypeEnum;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogDetailsDialog({ log, mediaType, open, onOpenChange }: LogDetailsDialogProps) {
  const { t } = useTranslation("media");

  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("logCard.logDetails")}</DialogTitle>
          <DialogDescription>
            {log.date ? formatFromIsoDate(log.date) : ""}
          </DialogDescription>
        </DialogHeader>

        <LogFields log={log} mediaType={mediaType} showDate={false} />
      </DialogContent>
    </Dialog>
  );
}
