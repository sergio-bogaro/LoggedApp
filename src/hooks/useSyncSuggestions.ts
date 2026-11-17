import { useQuery } from "@tanstack/react-query";

import {
  countSyncSuggestions,
  listSyncSuggestions,
} from "@/querries/librarySync";
import type { SyncSuggestionState } from "@/types/librarySync";

/** Contador global usado no badge do menu Importar. */
export function useSyncSuggestionCount(userId?: number, provider?: string) {
  return useQuery({
    queryKey: ["sync-suggestions", "count", userId, provider ?? "all"],
    queryFn: () => countSyncSuggestions(userId!, provider),
    enabled: !!userId,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });
}

/** Lista da aba Automáticos. */
export function useSyncSuggestions(
  userId: number | undefined,
  state: SyncSuggestionState,
  provider?: string
) {
  return useQuery({
    queryKey: ["sync-suggestions", "list", userId, state, provider ?? "all"],
    queryFn: () =>
      listSyncSuggestions(userId!, { state, provider, limit: 200 }),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
