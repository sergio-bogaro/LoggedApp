import { useQuery } from "@tanstack/react-query";

import { getUserMediaLogs, MediaLogWithMedia } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { DEFAULT_STALE_TIME } from "@/utils/conts";
import type { PeriodRange } from "@/utils/date";

/**
 * Every log the user wrote in the given range, newest first. With an empty
 * range it returns the whole register.
 */
export function useMediaLogs(range: PeriodRange) {
  const { user } = useAppSelector((state) => state.auth);

  return useQuery<MediaLogWithMedia[]>({
    queryKey: ["media-logs", user?.id, range.start ?? null, range.end ?? null],
    queryFn: () => getUserMediaLogs(user!.id, { start: range.start, end: range.end }),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });
}
