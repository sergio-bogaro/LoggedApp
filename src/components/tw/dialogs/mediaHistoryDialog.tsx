import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { MediaLogCard } from "../media/historyCard";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMediaLogs } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaResponse } from "@/types/logged";
import { MediaTypeEnum } from "@/types/media";

interface MediaHistoryDialogProps {
  media?: MediaResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaHistoryDialog({
  media,
  open,
  onOpenChange,
}: MediaHistoryDialogProps) {
  const { t } = useTranslation("media");
  const isOneTimeConsumption = useMemo(() => media?.type === MediaTypeEnum.MOVIES, [media]);

  const { user } = useAppSelector((state) => state.auth);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["media-logs", media?.id],
    queryFn: () => getMediaLogs(media!.id, user!.id),
    enabled: open && !!media && !!user,
  });

  const logs = useMemo(() => {
    if (!data) return [];

    return [...data].sort((a, b) =>
      new Date(b.date || b.createdAt).getTime() -
      new Date(a.date || a.createdAt).getTime(),
    );
  }, [data]);

  if (!media) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90%] max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("history.dialogTitle")}</DialogTitle>
          <DialogDescription>{media.title}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-2">
          {isLoading && (
            <p className="text-sm text-muted-foreground">
              {t("history.loading")}
            </p>
          )}

          {isError && (
            <p className="text-sm text-destructive">
              {t("history.errorPrefix")} {error.message}
            </p>
          )}

          {!isLoading && !isError && logs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("history.empty")}
            </p>
          )}

          {logs.map((log) => (
            <MediaLogCard key={log.id} log={log} isOneTimeConsuption={isOneTimeConsumption} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
