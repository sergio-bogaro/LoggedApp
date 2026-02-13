import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createMedia, deleteMedia, MediaResponse, updateMedia } from "@/querries/media/logged";
import { MediaItem } from "@/types/mediaItem";

export function useHandleBacklog() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ item, existingMedia }: { item: MediaItem; existingMedia?: MediaResponse }) => {
      const payload = {
        title: item.title,
        type: item.type,
        externalId: item.id,
        description: item.description,
        coverUrl: item.coverUrl,
        releaseDate: item.releaseDate,
        onList: !existingMedia ? true : !existingMedia.onList,
      };

      if (existingMedia) {
        if(!payload.onList && !existingMedia.status) return deleteMedia(existingMedia.id);

        return updateMedia(existingMedia.id, payload);
      }

      return createMedia(payload);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });

      toast.success("Added to Backlog");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add media");
    },
  });

  return (item: MediaItem, existingMedia?: MediaResponse) => mutation.mutate({ item, existingMedia });
}


