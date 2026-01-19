import { useQuery } from "@tanstack/react-query";
import { Divide, History, List } from "lucide-react";
import { Link, useParams } from "react-router";

import { MovieTabs } from "./components/movies/tabs";

import { TrackMediaDialog } from "@/components/tw/dialogs/trackMediaDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
          return getMangaDetails(id);
        case MediaTypeEnum.ANIME:
          return getKitsuDetails(id, MediaTypeEnum.ANIME);
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

  const alternateImages = data?.images?.posters.map((img: any) => tmdbPosterUrl(img.file_path)) || [];

  function getPosterUrl(type: MediaTypeEnum, data: any) {
    switch (mediaType) {
      case MediaTypeEnum.MOVIES:
        return tmdbPosterUrl(data.poster_path)
      case MediaTypeEnum.MANGA:
        return data.attributes.posterImage?.medium;
      case MediaTypeEnum.ANIME:
        return data.attributes.posterImage?.medium;
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
              {data.poster_path && <img src={getPosterUrl(mediaType, data.poster_path)} alt={data.title} className="mb-4 rounded" />}

              <TrackMediaDialog
                mediaType={mediaType}
                image={tmdbPosterUrl(data.poster_path)}
                alternateImages={alternateImages}
                title={data.title}
              />
            </div>

            <div className="flex flex-col w-4/5">
              <div className="flex gap-4 items-end">
                <h1 className="text-3xl  font-bold">{data.title}</h1>

                <span className="text-gray-500">{data.release_date?.slice(0, 4)}</span>
              </div>

              <div className="flex gap-2">
                {data.genres?.map((genre: { id: number; name: string }) => (
                  <span key={genre.id} className="text-sm bg-accent  rounded-full px-3 py-1">{genre.name}</span>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-light">{data.tagline} </p>

                <p>{data.overview}</p>




                {/* 
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
                )} */}

              </div>

            </div>
          </div>

          <div className="flex gap-4 mt-5">
            <div className="flex flex-col w-1/5 text-wrap gap-3">

              <h3 className="mx-auto">Details</h3>

              <div className="bg-card rounded p-2 flex flex-col gap-2">
                <div>
                  <Label>
                    Duration
                  </Label>
                  <span>{data.runtime} mins</span>
                </div>

                <div>
                  <Label>
                    Release Date
                  </Label>
                  <span>{formatFromIsoDate(data.release_date)}</span>
                  {/* TODO: Validar como fazer pra exibir diferente se for ingles  */}
                </div>

                <div>
                  <Label>
                    Directed by
                  </Label>
                  <span>{director.name}</span>
                </div>

                <div>
                  <Label>
                    Production by
                  </Label>
                  <span>
                    {data?.production_companies.map((company, index) => (
                      `${index == 0 ? "" : ", "}   ${company.name}`
                    ))}
                  </span>
                </div>

                <div>
                  <Label>
                    TMDB Score
                  </Label>
                  <span>{data.vote_average.toFixed(1)} ★</span>
                </div>

                <div>
                  <Label>
                    Source
                  </Label>

                  <Link to={`https://www.themoviedb.org/movie/${data.id}`} target="_blank" >
                    TMDB
                  </Link>
                </div>
              </div>

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

            <div className="flex flex-col w-4/5">
              <MovieTabs movieData={data} />
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default MediaDetailsPage;