import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TagInput } from "@/components/tw/generic/tagInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { StarRating } from "@/components/ui/starRating";
import { TextArea } from "@/components/ui/textarea";
import { MediaWithLogsResponse } from "@/types/logged";
import { MediaStatusEnum, MediaTypeEnum } from "@/types/media";
import { useUpdateMedia } from "@/utils/mediaStore";
import { statusAnimeOptions } from "@/utils/selectOptions";

interface EditMediaDialogProps {
  media: MediaWithLogsResponse;
  mediaType: MediaTypeEnum;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormType {
  status: MediaStatusEnum;
  rating?: number;
  review?: string;
  tags?: string[];
}

export function EditMediaDialog({ media, mediaType, open, onOpenChange }: EditMediaDialogProps) {
  const { t } = useTranslation("media");
  const update = useUpdateMedia();

  const isOneTimeConsumption = useMemo(() => mediaType === MediaTypeEnum.MOVIES, [mediaType]);

  const form = useForm<FormType>({
    defaultValues: {
      status: media.status ?? MediaStatusEnum.IN_PROGRESS,
      rating: media.rating ?? 0,
      review: media.review ?? "",
      tags: media.tags ?? [],
    },
  });

  const { control, handleSubmit } = form;

  useEffect(() => {
    if (!open) return;
    form.reset({
      status: media.status ?? MediaStatusEnum.IN_PROGRESS,
      rating: media.rating ?? 0,
      review: media.review ?? "",
      tags: media.tags ?? [],
    });
  }, [open, media]);

  const onSubmit = (data: FormType) => {
    update.mutate(
      {
        mediaId: media.id,
        data: {
          status: data.status,
          rating: data.rating,
          review: data.review,
          tags: data.tags ?? [],
        },
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("editMedia.title")}</DialogTitle>
          <DialogDescription>
            {media.title} — {t("editMedia.description")}
          </DialogDescription>
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

            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagInput
                  label={t("tags.label")}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder={t("tags.placeholder")}
                />
              )}
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
