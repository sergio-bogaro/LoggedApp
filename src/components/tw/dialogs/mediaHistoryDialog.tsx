import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { MediaLogCard } from "../media/historyCard";

import { EditLogDialog } from "@/components/tw/dialogs/editLogDialog";
import { ConfirmDialog } from "@/components/tw/generic/confirmDialog";
import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMediaLogs } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaLogResponse, MediaResponse } from "@/types/logged";
import { MediaTypeEnum } from "@/types/media";
import { useDeleteLog } from "@/utils/mediaStore";

interface MediaHistoryDialogProps {
  media?: MediaResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MediaHistoryDialog({ media, open, onOpenChange }: MediaHistoryDialogProps) {
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);

  const [editingLog, setEditingLog] = useState<MediaLogResponse | null>(null);
  const [deletingLog, setDeletingLog] = useState<MediaLogResponse | null>(null);

  const deleteLog = useDeleteLog();

  const isOneTimeConsumption = useMemo(() => media?.type === MediaTypeEnum.MOVIES, [media]);

  const { data: logs, isLoading, isError, error } = useQuery({
    queryKey: ["media-logs", media?.id],
    queryFn: () => getMediaLogs(media!.id, user!.id),
    enabled: open && !!media && !!user,
  });

  if (!media) return null;

  const handleDelete = () => {
    if (!deletingLog) return;
    deleteLog.mutate(
      { logId: deletingLog.id },
      { onSuccess: () => setDeletingLog(null) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("history.dialogTitle")}</DialogTitle>
          <DialogDescription>{media.title}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-2">
          <DataExhibition
            isFetching={isLoading}
            isError={isError}
            errorMessage={`${t("history.errorPrefix")} ${error?.message ?? ""}`}
          >
            {logs?.length === 0 && (
              <p className="text-step-1 text-muted-foreground">
                {t("history.empty")}
              </p>
            )}

            {logs?.map((log) => (
              <MediaLogCard
                key={log.id}
                log={log}
                isOneTimeConsuption={isOneTimeConsumption}
                onEdit={() => setEditingLog(log)}
                onDelete={() => setDeletingLog(log)}
              />
            ))}
          </DataExhibition>
        </div>

        {editingLog && (
          <EditLogDialog
            key={editingLog.id}
            log={editingLog}
            mediaType={media.type}
            open
            onOpenChange={(next) => {
              if (!next) setEditingLog(null);
            }}
          />
        )}

        <ConfirmDialog
          open={!!deletingLog}
          onOpenChange={(next) => {
            if (!next) setDeletingLog(null);
          }}
          title={t("confirm.deleteLogTitle")}
          description={t("confirm.deleteLogDescription")}
          onConfirm={handleDelete}
          isPending={deleteLog.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
