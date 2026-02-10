
import { useEffect, useState } from "react";

import { GridItem } from "./grid";
import ListItem from "./list";

import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/settings/hooks";
import { MediaItem } from "@/types/mediaItem";

interface MediaViewProps {
  isLoading: boolean;
  error: Error | null;
  mediaData: MediaItem[] | undefined;
}

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



  if (isLoading) {
    return (
      <div>
        Loading ...
      </div>
    )
  }

  if (mediaData === undefined) {
    return (
      <div className="p-4">
        <p className="text-lg font-semibold">Start your search</p>
        <p className="mt-1 text-sm">Use the search bar above to find media by title.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="font-semibold">Error</p>
        <p className="mt-1 text-sm">{error.message}</p>
      </div>
    )
  }

  if (mediaData.length === 0) {
    return (
      <div className="p-4">
        <p className="mt-4 text-lg font-semibold">No results found</p>
        <p className="mt-2 text-sm text-muted-foreground max-w-prose text-center">Try different keywords or remove filters. Check spelling and try broader terms.</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "gap-4 mt-2 transition-all duration-300 ease-in-out",
      switching ? "opacity-80 translate-y-0.5" : "opacity-100 translate-0",
      viewMode === "list" ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
    )}>
      {viewMode === "list" ?
        mediaData.map((mediaItem) => (
          <div key={mediaItem.id} className="transition-transform duration-300 ease-in-out transform hover:scale-[1.01]">
            <ListItem item={mediaItem} />
          </div>
        )) :
        mediaData.map((mediaItem) => (
          <div key={mediaItem.id} className="transition-transform duration-300 ease-in-out transform hover:scale-[1.01]">
            <GridItem item={mediaItem} />
          </div>
        ))
      }
    </div>
  )
}

export default MediaView;