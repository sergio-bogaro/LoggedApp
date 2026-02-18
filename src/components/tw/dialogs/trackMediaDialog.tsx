import { t } from "i18next"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { TextArea } from "@/components/ui/textarea"
import { MediaResponse } from "@/types/logged"
import { MediaStatusEnum, MediaTypeEnum } from "@/types/media"
import { getMediaData } from "@/utils/mediaDataResponse"
import { useTrackMedia } from "@/utils/mediaStore"
import { statusAnimeOptions } from "@/utils/selectOptions"

interface TrackMediaDialogProps {
  existingMedia?: MediaResponse;
  title: string;
  mediaType: MediaTypeEnum;
  defaultImage: string;
  mediaData: any;
}

interface FormType {
  startDate?: string;
  endDate?: string;
  rating?: number;
  review?: string;
}

export function TrackMediaDialog({ mediaType, defaultImage, title, mediaData, existingMedia }: TrackMediaDialogProps) {
  const isOneTimeConsumption = useMemo(() => mediaType === MediaTypeEnum.MOVIES || mediaType === MediaTypeEnum.GAME, [mediaType]);
  const endDateLabel = useMemo(() => isOneTimeConsumption ? "track.viewedOn" : "track.finishDate", [isOneTimeConsumption]);

  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const [open, setOpen] = useState(false);
  
  const trackMedia = useTrackMedia();
  const form = useForm<FormType>();
  const { control, handleSubmit } = form;

  const onSubmit = (data: FormType) => {
    const mediaDataFormated = getMediaData(mediaType, mediaData);
    const formData = {
      startDate: data.startDate,
      endDate: data.endDate,
      status: isOneTimeConsumption ? MediaStatusEnum.FINISHED : data.endDate ? MediaStatusEnum.FINISHED : MediaStatusEnum.IN_PROGRESS,
      rating: data.rating ? Number(data.rating) : undefined,
      review: data.review,
    }

    trackMedia(mediaDataFormated, existingMedia, formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          {t("track.label", { ns: "media" })}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[1000px]">
        <DialogHeader>
          <DialogTitle>
            {t("track.dialogTitle", { ns: "media", mediaType: t(`type.${mediaType}`, { ns: "media" }) })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row w-full">
          <div className="w-full lg:w-1/3 flex flex-col gap-2 items-center text-center">
            <img src={selectedImage} alt="sistemImage" className="rounded" />
            
            <h3 className="text-wrap">
              {title}
            </h3>

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  {t("track.changeImage", { ns: "media" })}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[1000px] max-h-10/12 overflow-auto ">

                <DialogHeader>
                  <DialogTitle>{t("track.changeImage", { ns: "media" })}</DialogTitle>
                  <DialogDescription>{t("track.changeImageDescription", { ns: "media" })}</DialogDescription>
                </DialogHeader>

                {/* <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {alternateImages?.map((imgUrl, index) => (
                    <DialogClose key={index} asChild>
                      <img
                        src={imgUrl}
                        alt={imgUrl}
                        onClick={() => setSelectedImage(imgUrl)}
                        className="rounded hover:scale-105 transition-transform cursor-pointer"
                      />
                    </DialogClose>
                  ))}
                </div> */}

              </DialogContent>

            </Dialog>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full lg:w-2/3">
              <Select
                name="status"
                label={t("track.status", { ns: "media" })}
                control={control}
                options={statusAnimeOptions}
              />       


              <div className="grid grid-cols-2 gap-4">
                {!isOneTimeConsumption && (
                  <Input
                    label={t("track.startDate", { ns: "media" })}
                    name="startDate"
                    type="date"
                    control={control}
                  />
                )}

                <Input
                  label={t(endDateLabel, { ns: "media" })}
                  name="endDate"
                  control={control}
                  type="date"
                />
              </div>

              <Input
                label={t("track.rating", { ns: "media" })}
                name="rating"
                control={control}
                type="number"
                min="0"
                max="10"
                step="0.1"
              />

              <TextArea
                label={t("track.review", { ns: "media" })}
                name="review"
                control={control}
              />

              <div className="flex justify-end gap-2 mt-4">
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
  )
}