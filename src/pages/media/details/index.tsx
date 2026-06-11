import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { MediaInfo } from "./components/general/mediaInfo";
import { MediaTabs } from "./components/general/mediaTabs";

import { TrackMediaDialog } from "@/components/tw/dialogs/trackMediaDialog";
import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { LastLog } from "@/components/tw/media/lastLog";
import { getAniListDetails } from "@/querries/externalMedia/anilist";
import { getBookDetails } from "@/querries/externalMedia/books";
import { getGameDetails } from "@/querries/externalMedia/gamebrain";
import { getMovieDetails } from "@/querries/externalMedia/movies";
import { getMediaByExternalIdWithLogs } from "@/querries/media/logged";
import { mediaImageUrl } from "@/querries/media/logged"
import { useAppSelector } from "@/store/auth/hooks";
import { MediaTypeEnum } from "@/types/media";
import { getMediaData } from "@/utils/mediaDataResponse";
import { getPosterUrl } from "@/utils/mediaDataResponse";

type MediaDetailsParams = {
  mediaType: MediaTypeEnum;
  id: string;
}

function MediaDetailsPage() {
  const { t } = useTranslation("media");
  const { mediaType, id } = useParams() as MediaDetailsParams;
  const { user } = useAppSelector((state) => state.auth);

  const { data, isLoading, isError, error } = useQuery({
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
  });

  const { data: existingMedia } = useQuery({
    queryKey: ["existingMedia", id, mediaType],
    queryFn: () => getMediaByExternalIdWithLogs(id!, mediaType, user!.id),
    enabled: !!id && !!mediaType && !!user,
  });

  const lastLog = existingMedia?.logs && existingMedia.logs.length > 0 ? existingMedia.logs[existingMedia.logs.length - 1] : null;

  return (
    <div>
      {isLoading && <p>{t("detailsPage.loading")}</p>}
      {isError && <p>{t("detailsPage.errorPrefix")} {error.message}</p>}
      {data && (
        <div className="max-w-[1400px] mx-auto p-4 sm:p-8">
          {/* {data.backdrop_path && <img src={tmdbPosterUrl(data.backdrop_path, "original")} alt={data.title} className="h-[400px] w-full object-cover" />} */}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-row gap-4 items-start md:flex-col md:w-1/5 md:min-w-[200px] md:sticky md:top-16 md:self-start md:text-center md:text-wrap transition-all">

              <ImageWithSkeleton
                alt={data.title}
                className="w-1/3 max-w-[60%] shrink-0 aspect-2/3 md:w-full md:max-w-full md:mb-4"
                src={existingMedia?.imagePath ? mediaImageUrl(existingMedia.imagePath)! : getPosterUrl(mediaType, data)}
              />

              <div className="flex flex-col gap-3 flex-1 min-w-0">
                <TrackMediaDialog
                  mediaType={mediaType}
                  defaultImage={existingMedia?.imagePath ? mediaImageUrl(existingMedia.imagePath)! : getPosterUrl(mediaType, data)}
                  title={getMediaData(mediaType, data).title}
                  mediaData={data}
                  existingMedia={existingMedia}
                />

                <LastLog lastLog={lastLog} />
              </div>

            </div>

            <div className="space-y-3 flex-1 min-w-0">
              <MediaInfo mediaType={mediaType} data={data} />

              <MediaTabs data={data} mediaType={mediaType} />
            </div>
          </div>

          <div className="flex gap-4 mt-5">
            {/*<DetailsCard mediaType={mediaType} data={data} existingMedia={existingMedia} />*/}

            <div className="flex flex-col w-4/5">
            </div>

          </div>
        </div>
      )
      }
    </div >
  )
}

export default MediaDetailsPage;
