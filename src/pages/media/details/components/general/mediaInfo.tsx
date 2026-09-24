/* eslint-disable @typescript-eslint/no-explicit-any */
import { AniListMediaDetails } from "@/querries/externalMedia/anilist";
import { BookDetails, getBookDescription } from "@/querries/externalMedia/books";
import { IGDBGame } from "@/querries/externalMedia/games";
import { TMDBMovieDetails } from "@/querries/externalMedia/movies";
import { MusicAlbumDetails } from "@/querries/externalMedia/music";
import { MediaTypeEnum } from "@/types/media";
import { htmlToPlainText } from "@/utils/string";

type MediaInfoContainerProps = {
  title?: string;
  dates?: string;
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
    <div className="flex flex-col">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-serif text-step-6 font-medium">{title}</h1>

        {dates && <span className="text-step-1 text-muted-foreground">{dates}</span>}
      </div>

      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-step-1 text-muted-foreground">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {tagline && <p className="max-w-[70ch] font-serif text-step-3 italic">{tagline}</p>}

        <p className="max-w-[70ch] text-step-2 leading-relaxed whitespace-pre-line">
          {htmlToPlainText(overview)}
        </p>
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
          tagline={movieData.tagline ?? ""}
          overview={movieData.overview ?? ""}
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
          dates={animeData.startDate?.year?.toString()}
          overview={animeData.description ?? ""}
          tags={animeData.genres?.map((genre) => genre) || []}
        />
      }
      case MediaTypeEnum.MANGA: {
        const mangaData = data as AniListMediaDetails;
        const formatedTitle = mangaData.title.english ?
          mangaData.title.english === mangaData.title.romaji ? mangaData.title.english :
            `${mangaData.title.english} (${mangaData.title.romaji})` : mangaData.title.romaji;

        return <MediaInfoComponent
          title={formatedTitle}
          dates={mangaData.startDate?.year?.toString()}
          overview={mangaData.description ?? ""}
          tags={mangaData.genres?.map((genre) => genre) || []}
        />
      }

      case MediaTypeEnum.GAME: {
        const gameData = data as IGDBGame;

        return <MediaInfoComponent
          title={gameData.name}
          dates={gameData.firstReleaseDate?.slice(0, 4) || ""}
          overview={gameData.summary ?? ""}
          tags={gameData.genres?.map((genre) => genre.name) || []}
        />
      }

      case MediaTypeEnum.BOOK: {
        const bookData = data as BookDetails;

        return <MediaInfoComponent
          title={bookData.title ?? ""}
          dates={bookData.first_publish_date?.slice(0, 4) || ""}
          overview={getBookDescription(bookData)}
          tags={bookData.subjects?.slice(0, 12) || []}
        />
      }

      case MediaTypeEnum.MUSIC: {
        const albumData = data as MusicAlbumDetails;

        return <MediaInfoComponent
          title={albumData.title ?? ""}
          dates={albumData.releaseDate?.slice(0, 4) || ""}
          tagline={albumData.artist ?? ""}
          overview={albumData.genre ?? ""}
          tags={albumData.genre ? [albumData.genre] : []}
        />
      }

      default: return null;
    }
  }

  return getInfo()
}
