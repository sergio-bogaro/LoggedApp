import { useQuery } from "@tanstack/react-query";
import { MoreVertical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { MediaInfo } from "./components/general/mediaInfo";
import { MediaTabs } from "./components/general/mediaTabs";

import { ChangeImageDialog } from "@/components/tw/dialogs/changeImageDialog";
import { EditMediaDialog } from "@/components/tw/dialogs/editMediaDialog";
import { LogDetailsDialog } from "@/components/tw/dialogs/logDetailsDialog";
import { MediaHistoryDialog } from "@/components/tw/dialogs/mediaHistoryDialog";
import { TrackMediaDialog } from "@/components/tw/dialogs/trackMediaDialog";
import { ConfirmDialog } from "@/components/tw/generic/confirmDialog";
import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { MediaDetailsSkeleton } from "@/components/tw/generic/mediaDetailsSkeleton";
import { MediaRecord } from "@/components/tw/media/mediaRecord";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaListStatus } from "@/hooks/useMediaListStatus";
import { getAniListDetails } from "@/querries/externalMedia/anilist";
import { getBookDetails } from "@/querries/externalMedia/books";
import { getGameDetails } from "@/querries/externalMedia/games";
import { getMovieDetails } from "@/querries/externalMedia/movies";
import { getAlbumDetails } from "@/querries/externalMedia/music";
import { getMediaByExternalIdWithLogs, mediaImageUrl } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaItem, MediaTypeEnum } from "@/types/media";
import { DEFAULT_STALE_TIME } from "@/utils/conts";
import { getMediaData, getPosterUrl } from "@/utils/mediaDataResponse";
import { useDeleteMedia, useHandleBacklog, useHandleFavorites } from "@/utils/mediaStore";
import { mediaTypeToPath } from "@/utils/mediaText";

type MediaDetailsParams = {
  mediaType: MediaTypeEnum;
  id: string;
};

function MediaDetailsPage() {
  const { mediaType, id } = useParams() as MediaDetailsParams;
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation("media");
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!mediaType) return;
    dispatch(
      setBreadcrumbs([
        { label: t("label"), to: "/media/home" },
        { label: t(`typePlural.${mediaType}`), to: `/media/list/${mediaTypeToPath(mediaType)}` },
        { label: t("details.label") },
      ])
    );
  }, [dispatch, t, mediaType]);

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [logDetailsOpen, setLogDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const navigate = useNavigate();
  const deleteMedia = useDeleteMedia();

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["details", mediaType, id],
    queryFn: async () => {
      if (!mediaType || !id) return null;

      switch (mediaType) {
        case MediaTypeEnum.MOVIES:
          return getMovieDetails(Number(id));
        case MediaTypeEnum.MANGA:
          return getAniListDetails(Number(id), MediaTypeEnum.MANGA);
        case MediaTypeEnum.ANIME:
          return getAniListDetails(Number(id), MediaTypeEnum.ANIME);
        case MediaTypeEnum.BOOK:
          return getBookDetails(id);
        case MediaTypeEnum.GAME:
          return getGameDetails(Number(id));
        case MediaTypeEnum.MUSIC:
          return getAlbumDetails(id);
        default:
          throw new Error("Unknown source");
      }
    },
    enabled: !!mediaType && !!id,
    staleTime: DEFAULT_STALE_TIME,
  });

  const formatedData = useMemo(() => (data ? getMediaData(mediaType, data) : undefined), [data, mediaType]);

  const mediaItem: MediaItem = useMemo(
    () => ({
      id: formatedData?.id ?? id ?? "",
      title: formatedData?.title ?? "",
      type: formatedData?.type ?? mediaType,
      coverUrl: formatedData?.coverUrl ?? "",
      description: formatedData?.description,
      releaseDate: formatedData?.releaseDate,
    }),
    [formatedData, id, mediaType]
  );

  const { favoritesStatus, backlogStatus, isLoading: listStatusLoading } = useMediaListStatus(mediaItem);
  const handleBacklog = useHandleBacklog();
  const handleFavorites = useHandleFavorites();

  const { data: existingMedia } = useQuery({
    queryKey: ["existingMedia", id, mediaType],
    queryFn: () => getMediaByExternalIdWithLogs(id!, mediaType, user!.id),
    enabled: !!id && !!mediaType && !!user,
    staleTime: DEFAULT_STALE_TIME,
  });

  const lastLog = useMemo(() => existingMedia?.logs && existingMedia.logs.length > 0
    ? existingMedia.logs[existingMedia.logs.length - 1]
    : null
  ,[existingMedia]
  )

  const handleDelete = () => {
    if (!existingMedia) return;
    deleteMedia.mutate(
      { mediaId: existingMedia.id },
      {
        onSuccess: () => {
          setConfirmDeleteOpen(false);
          navigate("/media/home");
        },
      }
    );
  };

  const mediaImage = useMemo(() => existingMedia?.imagePath
    ? (mediaImageUrl(existingMedia.imagePath) ?? undefined)
    : getPosterUrl(mediaType, data)
  , [existingMedia, mediaType, data]
  );

  return (
    <div>
      <DataExhibition
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={`${t("detailsPage.errorPrefix")} ${error?.message ?? ""}`}
        skeleton={<MediaDetailsSkeleton />}
      >
        {data && formatedData && (
          <div className="mx-auto max-w-[1100px] p-4 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:gap-10">
              {/* Poster and the app's own record share the left column. */}
              <div className="w-full shrink-0 space-y-4 sm:mx-auto sm:max-w-[360px] md:mx-0 md:max-w-none md:w-72 lg:w-80">
                <ImageWithSkeleton
                  alt={formatedData.title}
                  className="aspect-2/3 w-full rounded-lg"
                  src={mediaImage}
                  priority
                />

                <MediaRecord
                  media={existingMedia}
                  lastLog={lastLog}
                  onOpenLogDetails={() => setLogDetailsOpen(true)}
                >
                  <TrackMediaDialog
                    mediaType={mediaType}
                    mediaData={data}
                    image={mediaImage}
                    formatedData={formatedData}
                    existingMedia={existingMedia}
                    trigger={
                      <Button className="w-full">
                        {existingMedia ? t("record.logAgain") : t("track.label")}
                      </Button>
                    }
                  />

                  <ChangeImageDialog
                    mediaData={data}
                    existingMedia={existingMedia}
                    mediaType={mediaType}
                    formatedData={formatedData}
                    trigger={
                      <Button variant="outline" className="w-full">
                        {t("track.changeImage")}
                      </Button>
                    }
                  />
                </MediaRecord>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex justify-end">
                  <DropdownMenu open={optionsOpen} onOpenChange={setOptionsOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={t("actions.more")}>
                        <MoreVertical aria-hidden="true" size={20} />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={listStatusLoading || !formatedData}
                        onSelect={() => handleBacklog(mediaItem, backlogStatus.inList, backlogStatus.itemId)}
                      >
                        {backlogStatus.inList ? t("actions.removeFromBacklog") : t("actions.addToBacklog")}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        disabled={listStatusLoading || !formatedData}
                        onSelect={() => handleFavorites(mediaItem, favoritesStatus.inList, favoritesStatus.itemId)}
                      >
                        {favoritesStatus.inList ? t("actions.removeFavorite") : t("actions.addFavorite")}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        disabled={!existingMedia}
                        onSelect={() => {
                          setOptionsOpen(false);
                          setHistoryOpen(true);
                        }}
                      >
                        {t("actions.viewHistory")}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        disabled={!existingMedia}
                        onSelect={() => {
                          setOptionsOpen(false);
                          setEditOpen(true);
                        }}
                      >
                        {t("actions.editMedia")}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        variant="destructive"
                        disabled={!existingMedia}
                        onSelect={() => {
                          setOptionsOpen(false);
                          setConfirmDeleteOpen(true);
                        }}
                      >
                        {t("actions.deleteMedia")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <MediaInfo mediaType={mediaType} data={data} />

                <div className="mt-10">
                  <MediaTabs data={data} mediaType={mediaType} />
                </div>
              </div>
            </div>

            <MediaHistoryDialog
              media={existingMedia ?? undefined}
              open={historyOpen}
              onOpenChange={setHistoryOpen}
            />

            <LogDetailsDialog
              log={lastLog}
              mediaType={mediaType}
              open={logDetailsOpen}
              onOpenChange={setLogDetailsOpen}
            />

            {existingMedia && (
              <EditMediaDialog
                media={existingMedia}
                mediaType={mediaType}
                open={editOpen}
                onOpenChange={setEditOpen}
              />
            )}

            <ConfirmDialog
              open={confirmDeleteOpen}
              onOpenChange={setConfirmDeleteOpen}
              title={t("confirm.deleteMediaTitle")}
              description={t("confirm.deleteMediaDescription")}
              onConfirm={handleDelete}
              isPending={deleteMedia.isPending}
            />
          </div>
        )}
      </DataExhibition>
    </div>
  );
}

export default MediaDetailsPage;
