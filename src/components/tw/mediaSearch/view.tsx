
import { useEffect, useState } from "react";

import { GridItem } from "./grid";
import ListItem from "./list";

import { useAppSelector } from "@/store/settings/hooks";
import { MediaItem } from "@/types/mediaItem";

interface MediaViewProps {
  isLoading: boolean;
  error: Error | null;
  mediaData: MediaItem[] | undefined;
}

const PLACEHOLDER_COUNT = 8;

const MediaView = ({ isLoading, error, mediaData }: MediaViewProps) => {
  const { viewMode } = useAppSelector(state => state.ui)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    const timeoutStart = setTimeout(() => setSwitching(true), 0)
    const timeoutEnd = setTimeout(() => setSwitching(false), 320)

    return () => {
      clearTimeout(timeoutStart)
      clearTimeout(timeoutEnd)
    }
  }, [viewMode])

  const containerLayoutClass = viewMode === "list"
    ? "flex flex-col gap-4"
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5"

  const containerClasses = `gap-8 mt-4 ${containerLayoutClass} transition-all duration-300 ease-in-out ${switching ? "opacity-80 translate-y-0.5" : "opacity-100 translate-0"}`

  if (isLoading) {
    // Show animated placeholders matching current layout
    return (
      <div className={containerClasses}>
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`rounded-md  bg-surface-2/50 dark:bg-surface-3/40 h-44 sm:h-48 animate-pulse transition-transform duration-200 ease-in-out ${viewMode === "list" ? "w-full" : "w-full"}`}
          />
        ))}
      </div>
    )
  }

  if (mediaData === undefined) {
    return (
      <div className={containerClasses}>
        <div className="p-6 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
          <p className="text-lg font-semibold">Start your search</p>
          <p className="mt-1 text-sm">Use the search bar above to find media by title, tags or ID.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <div className="p-6 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
          <p className="font-semibold">Error</p>
          <p className="mt-1 text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  if (mediaData.length === 0) {
    return (
      <div className={containerClasses}>
        <div className="w-full flex flex-col items-center justify-center p-8 rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          <div className="text-4xl">🔎</div>
          <p className="mt-4 text-lg font-semibold">No results found</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-prose text-center">Try different keywords or remove filters. Check spelling and try broader terms.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={containerClasses}>
      {viewMode === "list"
        ? mediaData.map((mediaItem) => (
          <div key={mediaItem.id} className="transition-transform duration-300 ease-in-out transform hover:scale-[1.01]">
            <ListItem item={mediaItem} />
          </div>
        ))
        : mediaData.map((mediaItem) => (
          <div key={mediaItem.id} className="transition-transform duration-300 ease-in-out transform hover:scale-102">
            <GridItem item={mediaItem} />
          </div>
        ))
      }
    </div>
  )
}

export default MediaView;