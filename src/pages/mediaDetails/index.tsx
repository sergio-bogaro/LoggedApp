import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { getMovieDetails, posterUrl } from "@/lib/querry/tmdb";
import { MediaTypeEnum } from "@/utils/mediaText";

type MediaDetailsParams = {
  mediaType: MediaTypeEnum;
  id: string;
}

function MediaDetailsPage(){
  const { mediaType, id } = useParams() as MediaDetailsParams;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["details", mediaType, id],
    queryFn: async () => {
      if (!mediaType || !id) return null;
      switch (mediaType) {
        case MediaTypeEnum.MOVIES:
          return getMovieDetails(Number(id));
        // case "mangadex":
        //   return getMangaDetails(id);
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


  return(
    <div>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error: {error.message}</p>}
      {data && (
        <div className="max-w-[1400px] mx-auto p-4">
          {/* {data.backdrop_path && <img src={posterUrl(data.backdrop_path, "original")} alt={data.title} className="h-[400px] w-full object-cover" />} */}

          <div className="flex gap-4 relative">
            <div className="flex flex-col w-1/5 text-center text-wrap sticky top-5 self-start">
              {data.poster_path && <img src={posterUrl(data.poster_path, "original")} alt={data.title} className="mb-4 rounded" />}
           
              <Button>Log</Button>

            </div>

            <div className="w-4/5 overflow-auto">
              <div className="flex gap-4 items-end mb-4">
                <h1 className="text-3xl  font-bold">{data.title}</h1>
                <span className="text-gray-500">{data.release_date?.slice(0,4)}</span>
                <span className="text-gray-500">Directed by {data.original_title}</span>
              </div>
              <p>{data.tagline} </p>
              <p>{data.overview}</p>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default MediaDetailsPage;