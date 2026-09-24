import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/dataPicker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StarRating } from "@/components/ui/starRating";
import { TextArea } from "@/components/ui/textarea";
import { MediaLogResponse } from "@/types/logged";
import { MediaStatusEnum, MediaTypeEnum } from "@/types/media";
import { useUpdateLog } from "@/utils/mediaStore";
import { getProgressLabelKey, mediaSupportsProgress } from "@/utils/mediaText";
import { statusAnimeOptions } from "@/utils/selectOptions";

interface EditLogDialogProps {
  log: MediaLogResponse;
  mediaType: MediaTypeEnum;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormType {
  status: MediaStatusEnum;
  startDate?: string;
  endDate?: string;
  rating?: number;
  review?: string;
  progress?: string | number;
  progressTotal?: string | number;
}

const toOptionalNumber = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildDefaults = (log: MediaLogResponse): FormType => ({
  status: log.status ?? MediaStatusEnum.IN_PROGRESS,
  startDate: log.startDate?.slice(0, 10),
  endDate: log.endDate?.slice(0, 10),
  rating: log.rating ?? 0,
  review: log.review ?? "",
  progress: log.progress,
  progressTotal: log.progressTotal,
});

export function EditLogDialog({ log, mediaType, open, onOpenChange }: EditLogDialogProps) {
  const { t } = useTranslation("media");
  const update = useUpdateLog();

  const isOneTimeConsumption = useMemo(() => mediaType === MediaTypeEnum.MOVIES, [mediaType]);
  const supportsProgress = useMemo(() => mediaSupportsProgress(mediaType), [mediaType]);
  const progressLabel = useMemo(() => {
    const key = getProgressLabelKey(mediaType);
    return t(key ?? "track.progress");
  }, [mediaType, t]);

  const form = useForm<FormType>({ defaultValues: buildDefaults(log) });
  const { control, handleSubmit } = form;

  useEffect(() => {
    if (!open) return;
    form.reset(buildDefaults(log));
  }, [open, log]);

  const onSubmit = (data: FormType) => {
    update.mutate(
      {
        logId: log.id,
        data: {
          status: data.status,
          startDate: data.startDate?.trim() ? data.startDate : undefined,
          endDate: data.endDate?.trim() ? data.endDate : undefined,
          rating: data.rating,
          review: data.review,
          progress: toOptionalNumber(data.progress),
          progressTotal: toOptionalNumber(data.progressTotal),
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("editLog.title")}</DialogTitle>
          <DialogDescription>{log.date}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {!isOneTimeConsumption && (
              <Select
                name="status"
                label={t("track.status")}
                control={control}
                options={statusAnimeOptions()}
              />
            )}

            {supportsProgress && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  min={0}
                  step="any"
                  name="progress"
                  label={progressLabel}
                  control={control}
                />

                <Input
                  type="number"
                  min={0}
                  step="any"
                  name="progressTotal"
                  label={t("track.progressTotal")}
                  control={control}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                label={isOneTimeConsumption ? t("track.viewedOn") : t("track.startDate")}
                name="startDate"
                control={control}
              />

              <DatePicker
                label={isOneTimeConsumption ? t("track.viewedOn") : t("track.finishDate")}
                name="endDate"
                control={control}
              />
            </div>

            <StarRating
              label={t("track.rating")}
              name="rating"
              control={control}
            />

            <TextArea
              label={t("track.review")}
              name="review"
              control={control}
            />

            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("cancel", { ns: "common" })}
                </Button>
              </DialogClose>

              <Button type="submit" disabled={update.isPending}>
                {t("save", { ns: "common" })}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
