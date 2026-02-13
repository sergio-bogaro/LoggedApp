import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MediaTypeEnum } from "./mediaText";

import { batchCheckExisting, createMedia, MediaCheckItem, MediaResponse, updateMedia } from "@/querries/logged";
import { MediaItem } from "@/types/mediaItem";

export function useHandleBacklog() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ item, existingMedia }: { item: MediaItem; existingMedia?: MediaResponse }) => {
      const payload = {
        title: item.title,
        type: item.type,
        externalId: item.id,
        description: item.description ?? null,
        coverUrl: item.coverUrl ?? null,
        onList: !existingMedia ? true : !existingMedia.onList,
      };

      if (existingMedia) {
        return updateMedia(existingMedia.id, payload);
      }

      return createMedia(payload);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["existing-media"] });

      toast.success("Added to Backlog");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add media");
    },
  });

  return (item: MediaItem, existingMedia?: MediaResponse) => mutation.mutate({ item, existingMedia });
}


export function useExistingMedia(items: MediaItem[] | undefined) {
  const checkItems: MediaCheckItem[] = items?.map((item) => ({
    externalId: item.id,
    type: item.type,
  })) || [];

  return useQuery<Record<string, MediaResponse>>({
    queryKey: ["existing-media", checkItems],
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

