import { useQuery } from "@tanstack/react-query";

import { getAllMedia } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { DEFAULT_STALE_TIME } from "@/utils/conts";

/**
 * The whole library, cached once and shared by the views hub and the collection
 * pages so filtering/aggregation happens in memory without extra requests.
 */
export function useMediaLibrary() {
  const { user } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: ["media", "library", user?.id],
    queryFn: () => getAllMedia(user!.id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });
}
