import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

import { DetailsCard } from "./components/general/detailsCard";
import { MediaInfo } from "./components/general/mediaInfo";
import { MediaPoster } from "./components/general/poster";

import { TrackMediaDialog } from "@/components/tw/dialogs/trackMediaDialog";
import { getAniListDetails } from "@/querries/externalMedia/anilist";
import { getBookDetails } from "@/querries/externalMedia/books";
import { getGameDetails } from "@/querries/externalMedia/games";
import { getMovieDetails, tmdbPosterUrl } from "@/querries/externalMedia/movies";
import { getMediaByExternalId, getMediaLogs } from "@/querries/media/logged";
import { MediaTypeEnum } from "@/types/media";

type MediaDetailsParams = {
  mediaType: MediaTypeEnum;
  id: string;
}

function MediaDetailsPage() {
  const { mediaType, id } = useParams() as MediaDetailsParams;

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
    queryFn: () => getMediaByExternalId(id!, mediaType),
    enabled: !!id && !!mediaType,
  });

  const { data: mediaLogs } = useQuery({
    queryKey: ["mediaLogs", existingMedia?.id],
    queryFn: () => getMediaLogs(existingMedia!.id),
    enabled: !!existingMedia,
  });

  const lastLog = mediaLogs && mediaLogs.length > 0
    ? mediaLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error: {error.message}</p>}
      {data && (
        <div className="max-w-[1400px] mx-auto p-8">
          {/* {data.backdrop_path && <img src={tmdbPosterUrl(data.backdrop_path, "original")} alt={data.title} className="h-[400px] w-full object-cover" />} */}

          <div className="flex gap-4">
            <div className="flex flex-col w-1/5 text-center text-wrap sticky top-16 self-start transition-all">

              <MediaPoster mediaType={mediaType} data={data} />

              <TrackMediaDialog
                mediaType={mediaType}
                image={tmdbPosterUrl(data.poster_path)}
                title={data.title}
                mediaData={data}
                existingMedia={existingMedia}
              />

              {existingMedia && (
                <div className="mt-2">
                  <p>You tracked this on {lastLog ? new Date(lastLog.date).toLocaleDateString() : "N/A"}</p>
                  <p></p>
                </div>
              )}

            </div>

            <MediaInfo mediaType={mediaType} data={data} />


          </div>

          <div className="flex gap-4 mt-5">
            <DetailsCard mediaType={mediaType} data={data} />
            {/* <div className="flex flex-col w-4/5">
              <MovieTabs movieData={data} />
            </div> */}

          </div>
        </div>
      )
      }
    </div >
  )
}

export default MediaDetailsPage;