import { useQuery } from "@tanstack/react-query";

import { batchCheckExisting, MediaCheckItem } from "./logged";

import { useAppSelector } from "@/store/auth/hooks";
import { MediaResponse } from "@/types/logged";
import { MediaItem } from "@/types/media";
import { MediaTypeEnum } from "@/types/media";

export function useExistingMedia(items: MediaItem[] | undefined) {
  const { user } = useAppSelector((state) => state.auth);
  const checkItems: MediaCheckItem[] = items?.map((item) => ({
    externalId: item.id,
    type: item.type,
  })) || [];

  return useQuery<Record<string, MediaResponse>>({
    queryKey: ["media", checkItems],
    queryFn: () => batchCheckExisting(checkItems, user!.id),
    enabled: checkItems.length > 0 && !!user,
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

