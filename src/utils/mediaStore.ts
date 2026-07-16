import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { addToBacklog, removeFromBacklog, addToFavorites, removeFromFavorites } from "@/querries/media/listItems";
import { createMedia, createMediaLog, removeMediaImage, updateMedia, uploadMediaImage, uploadMediaImageFromUrl } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaResponse, MediaWithLogsResponse } from "@/types/logged";
import { MediaDataDetailsType, TrackMediaPayload } from "@/types/media";
import { MediaItem } from "@/types/media";

export function useHandleBacklog() {
  const { t } = useTranslation("media");
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const mutation = useMutation({
    mutationFn: async ({
      item,
      isInBacklog,
      backlogItemId,
    }: {
      item: MediaItem;
      isInBacklog: boolean;
      backlogItemId?: number | null;
    }) => {
      if (!user) throw new Error("User not authenticated");

      if (isInBacklog && backlogItemId) {
        return removeFromBacklog(backlogItemId, user.id);
      }

      return addToBacklog({
        userId: user.id,
        mediaType: item.type,
        externalId: item.id,
        title: item.title,
        description: item.description,
        coverUrl: item.coverUrl,
        releaseDate: item.releaseDate,
      });
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["backlog"] });

      toast.success(
        variables.isInBacklog
          ? t("feedback.backlogRemoved")
          : t("feedback.backlogAdded")
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || t("feedback.backlogFailed"));
    },
  });

  return (
    item: MediaItem,
    isInBacklog: boolean,
    backlogItemId?: number | null
  ) => mutation.mutate({ item, isInBacklog, backlogItemId });
}

export function useHandleFavorites() {
  const { t } = useTranslation("media");
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const mutation = useMutation({
    mutationFn: async ({
      item,
      isInFavorites,
      favoriteItemId,
    }: {
      item: MediaItem;
      isInFavorites: boolean;
      favoriteItemId?: number | null;
    }) => {
      if (!user) throw new Error("User not authenticated");

      if (isInFavorites && favoriteItemId) {
        return removeFromFavorites(favoriteItemId, user.id);
      }

      return addToFavorites({
        userId: user.id,
        mediaType: item.type,
        externalId: item.id,
        title: item.title,
        description: item.description,
        coverUrl: item.coverUrl,
        releaseDate: item.releaseDate,
      });
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });

      toast.success(
        variables.isInFavorites
          ? t("feedback.favoriteRemoved")
          : t("feedback.favoriteAdded")
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || t("feedback.favoriteFailed"));
    },
  });

  return (
    item: MediaItem,
    isInFavorites: boolean,
    favoriteItemId?: number | null
  ) => mutation.mutate({ item, isInFavorites, favoriteItemId });
}

export function useTrackMedia() {
  const { t } = useTranslation("media");
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const mutation = useMutation({
    mutationFn: async ({ mediaData, existingMedia, trackData }: {
      mediaData: MediaDataDetailsType;
      existingMedia?: MediaWithLogsResponse | null ;
      trackData: TrackMediaPayload;
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

  return (mediaData: MediaDataDetailsType, existingMedia: MediaWithLogsResponse | undefined | null, trackData: TrackMediaPayload) =>
    mutation.mutate({ mediaData, existingMedia, trackData });
}

// Adicionar ao useChangeImage em utils/mediaStore.ts

export function useChangeImage() {
  const { t } = useTranslation("media");
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const mutation = useMutation({
    mutationFn: async ({
      mediaData,
      existingMedia,
      imageFile,
      imageUrl,
      remove,
    }: {
      mediaData: MediaDataDetailsType;
      existingMedia?: MediaWithLogsResponse | null;
      imageFile?: File;
      imageUrl?: string;
      remove?: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");

      let mediaId: number;

      if (existingMedia) {
        mediaId = existingMedia.id;
      } else {
        if (remove) return; // nada a remover se mídia nem existe
        const media = await createMedia({
          userId: user.id,
          title: mediaData.title,
          type: mediaData.type,
          externalId: mediaData.id,
          description: mediaData.description,
          coverUrl: mediaData.coverUrl,
          releaseDate: mediaData.releaseDate,
          tags: mediaData.tags,
        });
        mediaId = media.id;
      }

      if (remove) {
        await removeMediaImage(mediaId, user.id);
      } else if (imageUrl) {
        await uploadMediaImageFromUrl(mediaId, imageUrl, user.id);
      } else if (imageFile) {
        await uploadMediaImage(mediaId, imageFile, user.id);
      }
    },

    onSuccess: (_, { remove }) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["existingMedia"] });
      toast.success(
        remove
          ? t("feedback.imageRemoveSuccess")
          : t("feedback.imageUpdateSuccess")
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || t("feedback.imageUpdateFailed"));
    },
  });

  return {
    changeImage: (
      mediaData: MediaDataDetailsType,
      existingMedia: MediaWithLogsResponse | undefined | null,
      imageFile: File
    ) => mutation.mutate({ mediaData, existingMedia, imageFile }),

    changeImageFromUrl: (
      mediaData: MediaDataDetailsType,
      existingMedia: MediaWithLogsResponse | undefined | null,
      imageUrl: string
    ) => mutation.mutate({ mediaData, existingMedia, imageUrl }),

    removeImage: (
      mediaData: MediaDataDetailsType,
      existingMedia: MediaWithLogsResponse | undefined | null
    ) => mutation.mutate({ mediaData, existingMedia, remove: true }),

    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
}
