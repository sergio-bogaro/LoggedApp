import { useQuery } from "@tanstack/react-query";
import { Divide, History, List } from "lucide-react";
import { Link, useParams } from "react-router";

import { MovieDetails } from "./components/movies/detail";
import { MovieInfo } from "./components/movies/info";
import { MovieTabs } from "./components/movies/tabs";

import { TrackMediaDialog } from "@/components/tw/dialogs/trackMediaDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getAniListDetails } from "@/lib/querry/anilist";
import { getKitsuDetails } from "@/lib/querry/kitsu";
import { getMangaDetails } from "@/lib/querry/mangadex";
import { getMovieDetails, tmdbPosterUrl } from "@/lib/querry/tmdb";
import { formatFromIsoDate } from "@/utils/date";
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




  function getPosterUrl(type: MediaTypeEnum, data: any) {
    console.log(data)

    switch (type) {
      case MediaTypeEnum.MOVIES:
        return tmdbPosterUrl(data.poster_path)
      case MediaTypeEnum.MANGA:
        return data.coverImage?.large;
      case MediaTypeEnum.ANIME:
        return data.coverImage?.large;
      default:
        return "";
    }
  }

  function getInfo() {


    switch (mediaType) {
      case MediaTypeEnum.MOVIES:
        return <MovieInfo data={data} />;

      default: return null;
    }
  }

  function getDetails() {


    switch (mediaType) {
      case MediaTypeEnum.MOVIES:
        return <MovieDetails data={data} />;

      default: return null;
    }
  }

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error: {error.message}</p>}
      {data && (
        <div className="max-w-[1400px] mx-auto p-8">
          {/* {data.backdrop_path && <img src={tmdbPosterUrl(data.backdrop_path, "original")} alt={data.title} className="h-[400px] w-full object-cover" />} */}

          <div className="flex gap-4">
            <div className="flex flex-col w-1/5 text-center text-wrap sticky top-16 self-start transition-all">

              <img src={getPosterUrl(mediaType, data)} alt={data.title} className="mb-4 rounded" />

              <TrackMediaDialog
                mediaType={mediaType}
                image={tmdbPosterUrl(data.poster_path)}
                alternateImages={alternateImages}
                title={data.title}
              />
            </div>

            {getInfo()}

          </div>

          <div className="flex gap-4 mt-5">
            <div className="flex flex-col w-1/5 text-wrap gap-3">

              <h3 className="mx-auto">Details</h3>

              {getDetails()}

              <div className="bg-card rounded p-2 flex justify-around">
                {/* TODO: Props tooltip */}
                <Button variant="secondary" >
                  <History />
                </Button>

                <Button>
                  <List />
                </Button>

              </div>

            </div>

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