/* eslint-disable react-hooks/set-state-in-effect */
import { t } from "i18next";
import { ImagePlus, Loader2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mediaImageUrl } from "@/querries/media/logged";
import { MediaWithLogsResponse } from "@/types/logged";
import { MediaTypeEnum } from "@/types/media";
import { getAlternativeImages, AlternativeImage } from "@/utils/alternativeImages";
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
  const [activeTab, setActiveTab] = useState("upload");
  const [alternatives, setAlternatives] = useState<AlternativeImage[]>([]);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [processingUrl, setProcessingUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasCustomImage = selectedImage !== originalCover;

  const { changeImage, changeImageFromUrl, removeImage, isPending, isSuccess } = useChangeImage();

  // Media title for searching alternatives
  const mediaTitle = useMemo(() => {
    const data = mediaData as any;
    return data?.title?.romaji || data?.title?.english || data?.title || data?.name || "";
  }, [mediaData]);

  useEffect(() => {
    setSelectedImage(existingMedia?.imagePath ? mediaImageUrl(existingMedia.imagePath)! : originalCover)
  }, [existingMedia])

  // Close dialog when mutation succeeds
  useEffect(() => {
    if (isSuccess && processingUrl) {
      setProcessingUrl(null);
      setImageDialogOpen(false);
    }
  }, [isSuccess, processingUrl]);

  // Load alternatives when switching to browse tab
  useEffect(() => {
    if (activeTab !== "browse" || alternatives.length > 0 || isLoadingAlternatives) return;

    setIsLoadingAlternatives(true);
    getAlternativeImages(mediaType, mediaData, mediaTitle)
      .then((imgs) => {
        // Filter out duplicates and the current image
        const unique = imgs.filter(
          (img, i, self) =>
            img.url &&
            img.url !== originalCover &&
            i === self.findIndex((s) => s.url === img.url)
        );
        setAlternatives(unique);
      })
      .catch(() => setAlternatives([]))
      .finally(() => setIsLoadingAlternatives(false));
  }, [activeTab, mediaType, mediaData, originalCover, alternatives.length, isLoadingAlternatives, mediaTitle]);

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

  const handleSelectAlternative = (img: AlternativeImage) => {
    // Show the selected poster as preview immediately
    setSelectedImage(img.url);
    onImageChange?.(img.url);

    // Track which URL is being processed
    setProcessingUrl(img.url);

    // Send the URL to the backend — dialog stays open while processing
    const mediaDataFormatted = getMediaData(mediaType, mediaData);
    changeImageFromUrl(mediaDataFormatted, existingMedia, img.url);
  };

  const handleDialogOpenChange = (open: boolean) => {
    // Don't allow closing while processing
    if (!open && isPending) return;
    setImageDialogOpen(open);
    if (open) {
      // Reset browse tab state when dialog opens
      setActiveTab("upload");
      setAlternatives([]);
      setIsLoadingAlternatives(false);
      setProcessingUrl(null);
    }
  };

  const isProcessing = isPending && processingUrl !== null;

  return (
    <Dialog open={imageDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          title={t("track.changeImage", { ns: "media" })}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md" onPointerDownOutside={(e) => { if (isPending) e.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>{t("track.changeImage", { ns: "media" })}</DialogTitle>
          <DialogDescription>
            {t("track.changeImageDescription", { ns: "media" })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Preview image with loading overlay */}
          <div className="relative w-full max-w-[200px]">
            <ImageWithSkeleton
              alt={t("track.previewAlt", { ns: "media" })}
              className="w-full aspect-2/3 flex flex-col items-center text-center"
              src={selectedImage}
            />
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-md gap-2">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <span className="text-white text-sm font-medium">
                  {t("track.savingImage", { ns: "media" })}
                </span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            className="hidden"
            onChange={handleFileChange}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="upload" className="flex-1">
                {t("track.uploadTab", { ns: "media" })}
              </TabsTrigger>
              <TabsTrigger value="browse" className="flex-1">
                {t("track.browseTab", { ns: "media" })}
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="mt-3">
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
            </TabsContent>

            {/* Browse Online Tab */}
            <TabsContent value="browse" className="mt-3">
              <div className="flex flex-col w-full gap-3">
                {isLoadingAlternatives ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm">{t("track.loadingAlternatives", { ns: "media" })}</span>
                  </div>
                ) : alternatives.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    {t("track.noAlternativesFound", { ns: "media" })}
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {alternatives.map((img, index) => {
                      const isCurrentlyProcessing = processingUrl === img.url;
                      return (
                        <button
                          key={`${img.url}-${index}`}
                          type="button"
                          disabled={isPending}
                          onClick={() => handleSelectAlternative(img)}
                          className={`relative aspect-[2/3] rounded-md overflow-hidden border-2 transition-colors cursor-pointer disabled:opacity-50 group ${
                            isCurrentlyProcessing ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-primary"
                          }`}
                          title={img.label}
                        >
                        <ImageWithSkeleton
                          src={img.url}
                          alt={img.label || `Alternative ${index + 1}`}
                          className="w-full h-full"
                        />
                          {img.label && (
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate text-center">
                              {img.label}
                            </span>
                          )}
                          {isCurrentlyProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <Loader2 className="h-6 w-6 text-white animate-spin" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

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
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
