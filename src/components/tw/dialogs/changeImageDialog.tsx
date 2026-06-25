import { t } from "i18next";
import { ImagePlus } from "lucide-react";
import React, { useRef, useState } from "react";

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
import { MediaWithLogsResponse } from "@/types/logged";
import { MediaTypeEnum } from "@/types/media";
import { getMediaData } from "@/utils/mediaDataResponse";
import { useChangeImage } from "@/utils/mediaStore";

interface ChangeImageDialogProps {
  existingMedia?: MediaWithLogsResponse | null;
  mediaType: MediaTypeEnum;
  defaultImage: string;
  originalCoverUrl: string;
  mediaData: unknown;
  onImageChange?: (objectUrl: string) => void;
}

export function ChangeImageDialog({
  defaultImage,
  originalCoverUrl,
  existingMedia,
  mediaData,
  mediaType,
  onImageChange,
}: ChangeImageDialogProps) {
  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasCustomImage = selectedImage !== originalCoverUrl;

  const { changeImage, removeImage, isPending } = useChangeImage();

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

    setSelectedImage(originalCoverUrl);
    onImageChange?.(originalCoverUrl);
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