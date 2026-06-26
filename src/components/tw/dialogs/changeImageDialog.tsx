/* eslint-disable react-hooks/set-state-in-effect */
import { t } from "i18next";
import { ImagePlus } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { ImageWithSkeleton } from "../generic/imageSkeleton";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mediaImageUrl } from "@/querries/media/logged";
import { MediaWithLogsResponse } from "@/types/logged";
import { MediaTypeEnum } from "@/types/media";
import { getMediaData } from "@/utils/mediaDataResponse";
import { useChangeImage } from "@/utils/mediaStore";
import { getPosterUrl } from "@/utils/posterPaths";

interface ChangeImageDialogProps {
  existingMedia?: MediaWithLogsResponse | null;
  mediaType: MediaTypeEnum;
  mediaData: unknown;
  onImageChange?: (objectUrl: string) => void;
}

export function ChangeImageDialog({ existingMedia, mediaData, mediaType, onImageChange }: ChangeImageDialogProps) {
  const originalCover = useMemo(() => getPosterUrl(mediaType, mediaData), [mediaData, mediaType])

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasCustomImage = selectedImage !== originalCover;

  const { changeImage, removeImage, isPending } = useChangeImage();

  useEffect(() => {
    setSelectedImage(existingMedia?.imagePath ? mediaImageUrl(existingMedia.imagePath)! : originalCover)
  }, [existingMedia])


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setSelectedImage(objectUrl);
    onImageChange?.(objectUrl);

    const mediaDataFormatted = getMediaData(mediaType, mediaData);
    changeImage(mediaDataFormatted, existingMedia, file);

    setImageDialogOpen(false);
  };

  const handleRemove = () => {
    const mediaDataFormatted = getMediaData(mediaType, mediaData);
    removeImage(mediaDataFormatted, existingMedia);

    setSelectedImage(originalCover);
    onImageChange?.(originalCover);
    setImageDialogOpen(false);
  };

  return (
    <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          title={t("track.changeImage", { ns: "media" })}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("track.changeImage", { ns: "media" })}</DialogTitle>
          <DialogDescription>
            {t("track.changeImageDescription", { ns: "media" })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <ImageWithSkeleton
            alt={t("track.previewAlt", { ns: "media" })}
            className="w-full lg:w-1/3 max-w-[300px] aspect-2/3 flex flex-col items-center text-center"
            src={selectedImage}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col w-full gap-2">
            <Button
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {t("track.selectFile", { ns: "media" })}
            </Button>

            {hasCustomImage && (
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={handleRemove}
              >
                {t("track.removeImage", { ns: "media" })}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}