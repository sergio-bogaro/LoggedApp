
import { AlertTriangle, Loader2Icon, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { GridItem } from "./grid";
import ListItem from "./list";

import { EmptyState } from "@/components/tw/generic/EmptyState";
import { POSTER_GRID_WIDE } from "@/components/tw/media/gridSkeleton";
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
  emptyTitle?: string;
  emptyDescription?: string;
}

const MediaView = ({ isLoading, error, mediaData, existingMedia, emptyTitle, emptyDescription }: MediaViewProps) => {
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
      <EmptyState
        icon={<AlertTriangle aria-hidden="true" className="size-4" />}
        title={t("searchView.errorTitle", { ns: "media" })}
        description={error.message}
        className="mt-2"
      />
    )
  }

  if (mediaData === undefined) {
    return (
      <EmptyState
        icon={<Search aria-hidden="true" className="size-4" />}
        title={t("searchView.startTitle", { ns: "media" })}
        description={t("searchView.startDescription", { ns: "media" })}
        className="mt-2"
      />
    )
  }

  if (mediaData.length === 0) {
    return (
      <EmptyState
        icon={<Search aria-hidden="true" className="size-4" />}
        title={emptyTitle ?? t("searchView.noResultsTitle", { ns: "media" })}
        description={emptyDescription ?? t("searchView.noResultsDescription", { ns: "media" })}
        className="mt-2"
      />
    )
  }

  return (
    <div className={cn(
      "gap-4 mt-2 transition-all duration-300 ease-in-out",
      switching ? "opacity-80 translate-y-0.5" : "opacity-100 translate-0",
      viewMode === "list" ? "flex flex-col gap-4" : POSTER_GRID_WIDE
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
