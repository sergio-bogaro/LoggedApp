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
import { MediaTypeEnum } from "@/utils/mediaText";

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
        // case "kitsu-manga":
        //   return getKitsuDetails(id, "manga");
        // case "kitsu-anime":
        //   return getKitsuDetails(id, "anime");
        // case "book":
        //   return getBookDetails(id);
        // case "game":
        //   return getGameDetails(Number(id));
        // case "music":
        //   return getAlbumDetails(id);
        default:
          throw new Error("Unknown source");
      }
    },
    enabled: !!mediaType && !!id,
  });

  const alternateImages = data?.images?.posters?.map((img: any) => tmdbPosterUrl(img.file_path)) || [];

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
              />

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