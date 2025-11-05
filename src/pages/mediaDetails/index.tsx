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

  const trailer = data?.videos?.results?.find(
    (v: any) => v.site === "YouTube" && v.type === "Trailer"
  );

  const director = data?.credits?.crew?.find(
    (member: any) => member.job === "Director"
  );


  return(
    <div>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error: {error.message}</p>}
      {data && (
        <div className="max-w-[1400px] mx-auto p-8">
          {/* {data.backdrop_path && <img src={posterUrl(data.backdrop_path, "original")} alt={data.title} className="h-[400px] w-full object-cover" />} */}

          <div className="flex gap-4">
            <div className="flex flex-col w-1/5 text-center text-wrap sticky top-16 self-start transition-all">
              {data.poster_path && <img src={posterUrl(data.poster_path, "original")} alt={data.title} className="mb-4 rounded" />}
           
              <Button>Log</Button>

            </div>

            <div className="w-4/5">
              <div className="flex gap-4 items-end mb-6">
                <h1 className="text-3xl  font-bold">{data.title}</h1>
                <span className="text-gray-500">{data.release_date?.slice(0,4)}</span>
                <span className="text-gray-500">Directed by {director.name}</span>
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-light">{data.tagline} </p>

                <p>{data.overview}</p>

                <span>{data.runtime} mins</span>

                <div className="flex gap-2">
                  {data.genres?.map((genre: { id: number; name: string }) => (
                    <span key={genre.id} className="text-sm bg-accent  rounded-full px-3 py-1">{genre.name}</span>
                  ))}
                </div>

                <div className="flex gap-2">
                  {data.genres?.map((genre: { id: number; name: string }) => (
                    <span key={genre.id} className="text-sm bg-accent  rounded-full px-3 py-1">{genre.name}</span>
                  ))}
                </div>

                {trailer ? (
                  <div className="aspect-video w-full max-w-3xl">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${trailer.key}`}
                      title={trailer.name}
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <p>No trailer available</p>
                )}

              </div>
              
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default MediaDetailsPage;