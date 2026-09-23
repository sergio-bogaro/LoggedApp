import { useQuery } from "@tanstack/react-query";

import { getBacklog, getFavorites } from "@/querries/media/listItems";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaItem } from "@/types/media";
import { MediaListItem } from "@/types/mediaList";
import { DEFAULT_STALE_TIME } from "@/utils/conts";

export interface MediaListStatus {
  inList: boolean;
  itemId: number | null;
}

const NOT_IN_LIST: MediaListStatus = { inList: false, itemId: null };

function findStatus(items: MediaListItem[] | undefined, mediaItem: MediaItem): MediaListStatus {
  const match = items?.find(
    (entry) =>
      entry.mediaType === mediaItem.type && entry.media?.externalId === mediaItem.id
  );

  return match ? { inList: true, itemId: match.id } : NOT_IN_LIST;
}

/**
 * Resolves backlog/favorites membership from two shared list queries instead of
 * one `check` request pair per card. The query keys match the favorites/backlog
 * pages, so the cache is reused across the whole app and the existing mutations
 * already invalidate it.
 */
export function useMediaListStatus(mediaItem: MediaItem) {
  const { user } = useAppSelector((state) => state.auth);

  const { data: favorites, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => getFavorites(user!.id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  const { data: backlog, isLoading: isLoadingBacklog } = useQuery({
    queryKey: ["backlog"],
    queryFn: () => getBacklog(user!.id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  return {
    favoritesStatus: findStatus(favorites, mediaItem),
    backlogStatus: findStatus(backlog, mediaItem),
    isLoading: isLoadingFavorites || isLoadingBacklog,
  };
}
