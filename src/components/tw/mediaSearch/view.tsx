
import { GridItem } from "./grid";
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
    <div className={`gap-8 mt-4 ${viewMode === "list" ?
      "flex flex-col gap-4" :
      "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"} `
    }>
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
        mediaData.map((mediaItem) => <GridItem key={mediaItem.id} item={mediaItem} />)
      )
      }
    </div>
  )
}

export default MediaView;