import { useQuery } from "@tanstack/react-query";

import { getReviewCounts } from "@/querries/review";

/**
 * Contadores da revisão unificada. `pendingTasks` é a contagem usada na
 * sidebar/aba: um job manual pronto conta como uma tarefa, enquanto cada
 * sugestão pendente do sync conta individualmente.
 */
export function useReviewCounts(userId?: number, provider?: string) {
  const query = useQuery({
    queryKey: ["review", "counts", userId, provider ?? "all"],
    queryFn: () => getReviewCounts(userId!, provider),
    enabled: !!userId,
    refetchInterval: 300_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const counts = query.data;
  return {
    manualReady: counts?.manualJobs ?? 0,
    syncPending: counts?.syncItems ?? 0,
    total: counts?.pendingTasks ?? 0,
    counts,
    isLoading: query.isLoading,
  };
}
