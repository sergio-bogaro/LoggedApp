/* eslint-disable @typescript-eslint/no-explicit-any */
import { AniListMediaDetails } from "@/lib/querry/anilist";
import { TMDBMovieDetails } from "@/lib/querry/tmdb";
import { MediaTypeEnum } from "@/utils/mediaText";

type MediaInfoContainerProps = {
  title: string;
  dates: string;
  tagline?: string;
  overview: string;
  tags: string[];
}

type MediaInfoProps = {
  mediaType: MediaTypeEnum;
  data: any;
}

export const MediaInfoComponent = ({ title, dates, tags, tagline, overview }: MediaInfoContainerProps) => {
  return (
    <div className="flex flex-col w-4/5">
      <div className="flex gap-4 items-end">
        <h1 className="text-3xl font-bold">
          {title}
        </h1>

        <span className="text-foreground/70">{dates}</span>
      </div>

      <div className="flex gap-2 my-3">
        {tags.map((tag) => (
          <span key={tag} className="text-sm text-primary-foreground bg-primary rounded-md px-3 py-1">{tag}</span>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-light">{tagline} </p>

        <p dangerouslySetInnerHTML={{ __html: overview }} />
      </div>
    </div>
  )
}

export const MediaInfo = ({ mediaType, data }: MediaInfoProps) => {
  function getInfo() {
    switch (mediaType) {
      case MediaTypeEnum.MOVIES: {
        const movieData = data as TMDBMovieDetails;

        return <MediaInfoComponent
          title={movieData.title}
          dates={movieData.release_date?.slice(0, 4) || ""}
          tagline={movieData.tagline}
          overview={movieData.overview}
          tags={movieData.genres?.map((genre) => genre.name) || []}
        />
      }
      case MediaTypeEnum.ANIME: {
        const animeData = data as AniListMediaDetails;
        const formatedTitle = animeData.title.english ?
          animeData.title.english === animeData.title.romaji ? animeData.title.english :
            `${animeData.title.english} (${animeData.title.romaji})` : animeData.title.romaji;

        return <MediaInfoComponent
          title={formatedTitle}
          dates={animeData.startDate.year?.toString()}
          overview={animeData.description}
          tags={animeData.genres.map((genre) => genre) || []}
        />
      }
      case MediaTypeEnum.MANGA: {
        const mangaData = data as AniListMediaDetails;
        const formatedTitle = mangaData.title.english ?
          mangaData.title.english === mangaData.title.romaji ? mangaData.title.english :
            `${mangaData.title.english} (${mangaData.title.romaji})` : mangaData.title.romaji;

        return <MediaInfoComponent
          title={formatedTitle}
          dates={mangaData.startDate.year?.toString()}
          overview={mangaData.description}
          tags={mangaData.genres.map((genre) => genre) || []}
        />
      }

      default: return null;
    }
  }

  return getInfo()
}