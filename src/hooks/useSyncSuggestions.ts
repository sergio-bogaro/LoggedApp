import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  countSyncSuggestions,
  listSyncSuggestions,
} from "@/querries/librarySync";
import type { SyncSuggestionState } from "@/types/librarySync";

export type SyncSuggestionFilter =
  | "all"
  | "validated"
  | "last_sync"
  | "attention"
  | "no_match"
  | "dismissed";

/** Contador global usado no badge do menu Importar. */
export function useSyncSuggestionCount(userId?: number, provider?: string) {
  return useQuery({
    queryKey: ["sync-suggestions", "count", userId, provider ?? "all"],
    queryFn: () => countSyncSuggestions(userId!, provider),
    enabled: !!userId,
    refetchInterval: 300_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

/** Lista da aba Automáticos. */
export function useSyncSuggestions(
  userId: number | undefined,
  filter: SyncSuggestionFilter,
  provider?: string
) {
  const state: SyncSuggestionState | "all" =
    filter === "validated" || filter === "last_sync"
      ? "approved"
      : filter === "dismissed"
        ? "dismissed"
        : filter === "all"
          ? "all"
          : "pending";

  return useInfiniteQuery({
    queryKey: [
      "sync-suggestions",
      "list",
      userId,
      filter,
      provider ?? "all",
    ],
    queryFn: ({ pageParam }) =>
      listSyncSuggestions(userId!, {
        state,
        provider,
        lastSync: filter === "last_sync",
        offset: pageParam,
        limit: 100,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const loaded = lastPageParam + lastPage.items.length;
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
