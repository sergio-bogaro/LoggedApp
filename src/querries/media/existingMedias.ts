import { useQuery } from "@tanstack/react-query";

import { batchCheckExisting, MediaCheckItem, MediaResponse } from "./logged";

import { MediaItem } from "@/types/mediaItem";
import { MediaTypeEnum } from "@/utils/mediaText";

export function useExistingMedia(items: MediaItem[] | undefined) {
  const checkItems: MediaCheckItem[] = items?.map((item) => ({
    externalId: item.id,
    type: item.type,
  })) || [];

  return useQuery<Record<string, MediaResponse>>({
    queryKey: ["media", checkItems],
    queryFn: () => batchCheckExisting(checkItems),
    enabled: checkItems.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function getExistingMedia(
  existingMedia: Record<string, MediaResponse> | undefined,
  externalId: string,
  type: MediaTypeEnum
): MediaResponse | undefined {
  const key = `${externalId}:${type}`;
  return existingMedia?.[key];
}

