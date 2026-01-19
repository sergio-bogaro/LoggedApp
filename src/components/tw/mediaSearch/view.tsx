
import ListItem from "./list";

import { useAppSelector } from "@/store/settings/hooks";
import { MediaItem } from "@/types/mediaItem";

interface MediaViewProps {
  isLoading: boolean;
  error: Error | null;
  mediaData: MediaItem[] | undefined;
}

const MediaView = ({ isLoading, error, mediaData }: MediaViewProps) => {
  const { viewMode } = useAppSelector(state => state.ui)

  return (
    <div className={`grid gap-4 mt-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"}`}>
      {mediaData === undefined ? (
        <p>Start your search above.</p>
      ) : isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error.message}</p>
      ) : mediaData.length === 0 ? (
        <p>No Results</p>
      ) : viewMode === "list" ? (
        mediaData.map((mediaItem) => <ListItem key={mediaItem.id} item={mediaItem} />)
      ) : (
        mediaData.map((mediaItem) => <ListItem key={mediaItem.id} item={mediaItem} />)
      )
      }
    </div>
  )
}

export default MediaView;