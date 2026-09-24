
import { Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { GridItem } from "./grid";
import ListItem from "./list";

import { cn } from "@/lib/utils";
import { getExistingMedia } from "@/querries/media/existingMedias";
import { useAppSelector } from "@/store/settings/hooks";
import { MediaResponse } from "@/types/logged";
import { MediaItem } from "@/types/media";

interface MediaViewProps {
  isLoading: boolean;
  error: Error | null;
  mediaData?: MediaItem[];
  existingMedia?: Record<string, MediaResponse>;
}

const MediaView = ({ isLoading, error, mediaData, existingMedia }: MediaViewProps) => {
  const { t } = useTranslation(["common", "media"]);
  const { viewMode } = useAppSelector(state => state.ui)
  const [switching, setSwitching] = useState(false)
  const hasMounted = useRef(false)

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }

    setSwitching(true)
    const timeoutEnd = setTimeout(() => setSwitching(false), 320)

    return () => {
      clearTimeout(timeoutEnd)
    }
  }, [viewMode])

  if (isLoading) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-2 py-16 text-muted-foreground"
      >
        <Loader2Icon aria-hidden="true" className="h-6 w-6 animate-spin motion-reduce:animate-none" />
        <span className="sr-only">{t("a11y.loading", { ns: "common" })}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="font-semibold">{t("searchView.errorTitle", { ns: "media" })}</p>
        <p className="mt-1 text-step-1">{error.message}</p>
      </div>
    )
  }

  if (mediaData === undefined) {
    return (
      <div className="p-4">
        <p className="text-step-3 font-semibold">{t("searchView.startTitle", { ns: "media" })}</p>
        <p className="mt-1 text-step-1">{t("searchView.startDescription", { ns: "media" })}</p>
      </div>
    )
  }

  if (mediaData.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center">
        <p className="mt-4 text-step-3 font-semibold">{t("searchView.noResultsTitle", { ns: "media" })}</p>
        <p className="mt-2 text-step-1 text-muted-foreground max-w-prose text-center">{t("searchView.noResultsDescription", { ns: "media" })}</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "gap-4 mt-2 transition-all duration-300 ease-in-out",
      switching ? "opacity-80 translate-y-0.5" : "opacity-100 translate-0",
      viewMode === "list" ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
    )} >
      {mediaData.map((mediaItem) => {
        const existingItem = getExistingMedia(existingMedia, mediaItem.id, mediaItem.type);

        return viewMode === "list" ? (
          <div key={mediaItem.id}>
            <ListItem item={mediaItem} existingItem={existingItem} />
          </div>
        ) : (
          <div key={mediaItem.id}>
            <GridItem item={mediaItem} existingItem={existingItem} />
          </div>
        )
      })}
    </div>
  )
}

export default MediaView;
