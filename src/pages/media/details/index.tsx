import { useQuery } from "@tanstack/react-query";
import { MoreVertical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { MediaInfo } from "./components/general/mediaInfo";
import { MediaTabs } from "./components/general/mediaTabs";

import { ChangeImageDialog } from "@/components/tw/dialogs/changeImageDialog";
import { LogDetailsDialog } from "@/components/tw/dialogs/logDetailsDialog";
import { MediaHistoryDialog } from "@/components/tw/dialogs/mediaHistoryDialog";
import { TrackMediaDialog } from "@/components/tw/dialogs/trackMediaDialog";
import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { MediaDetailsSkeleton } from "@/components/tw/generic/mediaDetailsSkeleton";
import { LogCard } from "@/components/tw/media/logCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAniListDetails } from "@/querries/externalMedia/anilist";
import { getBookDetails } from "@/querries/externalMedia/books";
import { getGameDetails } from "@/querries/externalMedia/games";
import { getMovieDetails } from "@/querries/externalMedia/movies";
import { getMediaByExternalIdWithLogs } from "@/querries/media/logged";
import { mediaImageUrl } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaTypeEnum } from "@/types/media";
import { DEFAULT_STALE_TIME } from "@/utils/conts";
import { getMediaData, getPosterUrl } from "@/utils/mediaDataResponse";
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
        default:
          throw new Error("Unknown source");
      }
    },
    enabled: !!mediaType && !!id,
    staleTime: DEFAULT_STALE_TIME,
  });

  const formatedData = useMemo(() => (data ? getMediaData(mediaType, data) : undefined), [data, mediaType]);

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

  const mediaImage = useMemo(() => existingMedia?.imagePath
    ? mediaImageUrl(existingMedia.imagePath)!
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
          <div className="max-w-[1400px] mx-auto p-4 sm:p-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-4 items-start w-full flex-col md:w-1/5 md:min-w-[200px] md:text-center md:text-wrap md:max-w-[250px] transition-all">
                <div className="relative w-[70%] md:w-full">
                  <ImageWithSkeleton
                    alt={formatedData.title}
                    className="shrink-0 aspect-2/3 md:w-full md:max-w-full"
                    src={mediaImage}
                  />

                  <div className="flex absolute bottom-4 justify-center gap-2 w-full">
                    <ChangeImageDialog
                      mediaData={data}
                      existingMedia={existingMedia}
                      mediaType={mediaType}
                      formatedData={formatedData}
                    />

                    <TrackMediaDialog
                      mediaType={mediaType}
                      mediaData={data}
                      image={mediaImage}
                      formatedData={formatedData}
                      existingMedia={existingMedia}
                    />
                  </div>
                </div>

                <div className="w-[70%] md:w-full">
                  <LogCard log={lastLog} onClick={() => setLogDetailsOpen(true)} />
                </div>
              </div>

              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex justify-end">
                  <DropdownMenu
                    open={optionsOpen}
                    onOpenChange={setOptionsOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical size={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={!existingMedia}
                        onSelect={() => {
                          setOptionsOpen(false);
                          setHistoryOpen(true);
                        }}
                      >
                        {t("actions.viewHistory")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

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
                </div>

                <MediaInfo mediaType={mediaType} data={data} />

                <MediaTabs data={data} mediaType={mediaType} />
              </div>
            </div>
          </div>
        )}
      </DataExhibition>
    </div>
  );
}

export default MediaDetailsPage;
