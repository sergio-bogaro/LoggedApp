import { t } from "i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StarRating } from "@/components/ui/starRating";
import { TextArea } from "@/components/ui/textarea";
import { MediaWithLogsResponse } from "@/types/logged";
import {
  finishedStatusEnumValues,
  MediaStatusEnum,
  MediaTypeEnum,
} from "@/types/media";
import { newIsoDate } from "@/utils/date";
import { getMediaData } from "@/utils/mediaDataResponse";
import { useTrackMedia } from "@/utils/mediaStore";
import { statusAnimeOptions } from "@/utils/selectOptions";

interface TrackMediaDialogProps {
  existingMedia?: MediaWithLogsResponse | null;
  title: string;
  mediaType: MediaTypeEnum;
  defaultImage: string;
  mediaData: unknown;
}

interface FormType {
  status: MediaStatusEnum;
  startDate?: string;
  endDate?: string;
  rating?: number;
  review?: string;
}

export function TrackMediaDialog({
  mediaType,
  defaultImage,
  title,
  mediaData,
  existingMedia,
}: TrackMediaDialogProps) {
  const isOneTimeConsumption = useMemo(
    () => mediaType === MediaTypeEnum.MOVIES,
    [mediaType],
  );
  const endDateLabel = useMemo(
    () => (isOneTimeConsumption ? "track.viewedOn" : "track.finishDate"),
    [isOneTimeConsumption],
  );

  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trackMedia = useTrackMedia();

  const form = useForm<FormType>({
    defaultValues: {
      status: isOneTimeConsumption ? MediaStatusEnum.FINISHED : MediaStatusEnum.IN_PROGRESS,
      startDate: isOneTimeConsumption ? undefined : newIsoDate(),
      endDate: isOneTimeConsumption ? newIsoDate() : undefined,
    },
  });
  const { control, handleSubmit } = form;
  const watchStatus = useWatch({ control, name: "status" });
  const isFinished = useMemo(
    () => finishedStatusEnumValues.includes(watchStatus),
    [watchStatus],
  );

  useEffect(() => {
    if (isFinished && !isOneTimeConsumption) {
      form.setValue("endDate", newIsoDate());
      form.setValue("startDate", "");
    } else {
      form.setValue("startDate", newIsoDate());
      form.setValue("endDate", undefined);
    }
  }, [isFinished]);

  const onSubmit = (data: FormType) => {
    const mediaDataFormated = getMediaData(mediaType, mediaData);

    const formData = {
      startDate: data.startDate && data.startDate.trim() !== "" ? data.startDate : undefined,
      endDate: isOneTimeConsumption ? data.endDate : data.status === MediaStatusEnum.FINISHED ? data.endDate : undefined,
      status:  data.status,
      rating: data.rating,
      review: data.review,
    };

    trackMedia(mediaDataFormated, existingMedia, formData, selectedFile);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t("track.label", { ns: "media" })}</Button>
      </DialogTrigger>

      <DialogContent className="w-[80%] max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>
            {t("track.dialogTitle", {
              ns: "media",
              mediaType: t(`type.${mediaType}`, { ns: "media" }),
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row w-full">
          <div className="w-full lg:w-1/3 flex flex-col gap-2 items-center text-center">
            <img
              src={selectedImage}
              alt={t("track.coverAlt", { ns: "media" })}
              className="rounded aspect-2/3 w-[80%]"
            />

            <h3 className="text-wrap">{title}</h3>

            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
              <DialogTrigger asChild>
                <Button>{t("track.changeImage", { ns: "media" })}</Button>
              </DialogTrigger>

              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>
                    {t("track.changeImage", { ns: "media" })}
                  </DialogTitle>
                  <DialogDescription>
                    {t("track.changeImageDescription", { ns: "media" })}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4">
                  <img
                    src={selectedImage}
                    alt={t("track.previewAlt", { ns: "media" })}
                    className="rounded aspect-2/3 w-[60%] object-cover"
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setSelectedFile(file);
                      setSelectedImage(URL.createObjectURL(file));
                      setImageDialogOpen(false);
                    }}
                  />

                  <Button onClick={() => fileInputRef.current?.click()}>
                    {t("track.selectFile", { ns: "media" })}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4 w-full lg:w-2/3"
            >
              {!isOneTimeConsumption && (
                <Select
                  name="status"
                  label={t("track.status", { ns: "media" })}
                  control={control}
                  options={statusAnimeOptions()}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                {!isOneTimeConsumption && (
                  <Input
                    label={t("track.startDate", { ns: "media" })}
                    name="startDate"
                    type="date"
                    control={control}
                  />
                )}

                {isFinished && (
                  <Input
                    label={t(endDateLabel, { ns: "media" })}
                    name="endDate"
                    control={control}
                    type="date"
                  />
                )}
              </div>

              {isFinished && (
                <>
                  <StarRating
                    label={t("track.rating", { ns: "media" })}
                    name="rating"
                    control={control}
                  />

                  <TextArea
                    label={t("track.review", { ns: "media" })}
                    name="review"
                    control={control}
                  />
                </>
              )}

              <div className="flex justify-end gap-2 mt-auto">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {t("cancel", { ns: "common" })}
                  </Button>
                </DialogClose>
                <Button type="submit">{t("save", { ns: "common" })}</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
