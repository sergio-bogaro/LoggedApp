import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createMedia, createMediaLog, deleteMedia, updateMedia } from "@/querries/media/logged";
import { MediaResponse } from "@/types/logged";
import { MediaDataDetailsType, TrackMediaPayload } from "@/types/media";
import { MediaItem } from "@/types/media";

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
        if (!payload.onList && !existingMedia.status) return deleteMedia(existingMedia.id);

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

export function useTrackMedia() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ mediaData, existingMedia, trackData }: {
      mediaData: MediaDataDetailsType;
      existingMedia?: MediaResponse;
      trackData: TrackMediaPayload;
    }) => {
      let media: MediaResponse;

      // Create or update media
      if (existingMedia) {
        media = await updateMedia(existingMedia.id, {
          status: trackData.status,
          rating: trackData.rating,
          review: trackData.review,
          tags: mediaData.tags,
        });
      } else {
        media = await createMedia({
          title: mediaData.title,
          type: mediaData.type,
          externalId: mediaData.id,
          description: mediaData.description,
          coverUrl: mediaData.coverUrl,
          releaseDate: mediaData.releaseDate,
          tags: mediaData.tags,
          status: trackData.status,
          rating: trackData.rating,
          review: trackData.review,
          onList: false,
        });
      }

      // Create media log
      await createMediaLog({
        mediaId: media.id,
        date: trackData.startDate || new Date().toISOString().split("T")[0],
        status: trackData.status,
        rating: trackData.rating,
        review: trackData.review,
      });

      return media;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Media tracked successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to track media");
    },
  });

  return (mediaData: MediaDataDetailsType, existingMedia: MediaResponse | undefined, trackData: TrackMediaPayload) =>
    mutation.mutate({ mediaData, existingMedia, trackData });
}


