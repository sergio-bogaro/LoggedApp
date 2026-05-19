import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { createMedia, createMediaLog, deleteMedia, updateMedia, uploadMediaImage } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaResponse } from "@/types/logged";
import { MediaDataDetailsType, TrackMediaPayload } from "@/types/media";
import { MediaItem } from "@/types/media";

export function useHandleBacklog() {
  const { t } = useTranslation("media");
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const mutation = useMutation({
    mutationFn: async ({ item, existingMedia }: { item: MediaItem; existingMedia?: MediaResponse }) => {
      if (!user) throw new Error("User not authenticated");

      const payload = {
        userId: user.id,
        title: item.title,
        type: item.type,
        externalId: item.id,
        description: item.description,
        coverUrl: item.coverUrl,
        releaseDate: item.releaseDate,
        onList: !existingMedia ? true : !existingMedia.onList,
      };

      if (existingMedia) {
        if (!payload.onList && !existingMedia.status) return deleteMedia(existingMedia.id, user.id);

        return updateMedia(existingMedia.id, payload, user.id);
      }

      return createMedia(payload);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });

      toast.success(t("feedback.backlogAdded"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("feedback.backlogFailed"));
    },
  });

  return (item: MediaItem, existingMedia?: MediaResponse) => mutation.mutate({ item, existingMedia });
}

export function useTrackMedia() {
  const { t } = useTranslation("media");
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const mutation = useMutation({
    mutationFn: async ({ mediaData, existingMedia, trackData, imageFile }: {
      mediaData: MediaDataDetailsType;
      existingMedia?: MediaResponse;
      trackData: TrackMediaPayload;
      imageFile?: File;
    }) => {
      if (!user) throw new Error("User not authenticated");

      let media: MediaResponse;

      // Create or update media
      if (existingMedia) {
        media = await updateMedia(existingMedia.id, {
          status: trackData.status,
          rating: trackData.rating,
          review: trackData.review,
          tags: mediaData.tags,
        }, user.id);
      } else {
        media = await createMedia({
          userId: user.id,
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
        userId: user.id,
        mediaId: media.id,
        status: trackData.status,
        rating: trackData.rating,
        review: trackData.review,
        startDate: trackData.startDate,
        endDate: trackData.endDate,
      });

      // Upload custom image if provided
      if (imageFile) {
        await uploadMediaImage(media.id, imageFile, user.id);
      }

      return media;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["existingMedia"] });
      toast.success(t("feedback.trackSuccess"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("feedback.trackFailed"));
    },
  });

  return (mediaData: MediaDataDetailsType, existingMedia: MediaResponse | undefined, trackData: TrackMediaPayload, imageFile?: File) =>
    mutation.mutate({ mediaData, existingMedia, trackData, imageFile });
}

