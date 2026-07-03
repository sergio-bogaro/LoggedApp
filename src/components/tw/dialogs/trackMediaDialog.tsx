import { t } from "i18next";
import { BookmarkPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { ImageWithSkeleton } from "../generic/imageSkeleton";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/dataPicker";
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
  mediaType: MediaTypeEnum;
  image: string;
  mediaData: unknown;
}

interface FormType {
  status: MediaStatusEnum;
  startDate?: string;
  endDate?: string;
  rating?: number;
  review?: string;
}

export function TrackMediaDialog({ mediaType, mediaData, existingMedia, image }: TrackMediaDialogProps) { 
  const [open, setOpen] = useState(false);

  const isOneTimeConsumption = useMemo( () => mediaType === MediaTypeEnum.MOVIES, [mediaType] );
  const endDateLabel = useMemo( () => (isOneTimeConsumption ? "track.viewedOn" : "track.finishDate"), [isOneTimeConsumption] );

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

  const isFinished = useMemo(() => finishedStatusEnumValues.includes(watchStatus), [watchStatus] );

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

    trackMedia(mediaDataFormated, existingMedia, formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          title={t("track.label", { ns: "media" })}
        >
          <BookmarkPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[80%] max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>
            {getMediaData(mediaType, mediaData).title}
          </DialogTitle>

          <DialogDescription>
            {t("track.dialogTitle", { ns: "media", mediaType: t(`type.${mediaType}`, { ns: "media" }) })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 lg:flex-row w-full">

          <ImageWithSkeleton
            alt={t("track.coverAlt", { ns: "media" })}
            className="w-full lg:w-1/3 max-w-[300px] aspect-2/3 flex flex-col items-center text-center"
            src={image}
          />

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
                  <DatePicker
                    label={t("track.startDate", { ns: "media" })}
                    name="startDate"
                    control={control}
                  />
                )}

                {isFinished && (
                  <DatePicker
                    label={t(endDateLabel, { ns: "media" })}
                    name="endDate"
                    control={control}
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
                
                <Button type="submit">
                  {t("save", { ns: "common" })}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
