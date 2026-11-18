import { useInfiniteQuery } from "@tanstack/react-query";

import { listReviewItems } from "@/querries/review";
import type { ReviewItemsParams } from "@/types/review";

export function useReviewItems(
  userId: number | undefined,
  params: ReviewItemsParams,
  pageSize = 50
) {
  return useInfiniteQuery({
    queryKey: ["review", "items", userId, params],
    queryFn: ({ pageParam }) =>
      listReviewItems(userId!, {
        ...params,
        offset: pageParam,
        limit: pageSize,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.offset + lastPage.items.length;
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
