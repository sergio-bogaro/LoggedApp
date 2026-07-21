import { anilistDateToIso, AniListMediaDetails } from "@/querries/externalMedia/anilist";
import { GameBrainGame } from "@/querries/externalMedia/gamebrain";
import { TMDBMovieDetails, tmdbPosterUrl } from "@/querries/externalMedia/movies";
import { MediaDataDetailsType, MediaTypeEnum } from "@/types/media";

export function getMediaData(mediaType: MediaTypeEnum, mediaData: unknown): MediaDataDetailsType {
  switch (mediaType) {
    case MediaTypeEnum.MOVIES: {
      const movieData = mediaData as TMDBMovieDetails;

      return {
        id: String(movieData.id),
        title: movieData.title ?? "",
        type: mediaType,
        coverUrl: tmdbPosterUrl(movieData.poster_path, "original") || "",
        description: movieData.overview ?? "",
        releaseDate: movieData.release_date,
        tags: movieData.genres?.map((g) => g.name) || [],
      };
    }
    case MediaTypeEnum.ANIME: {

      const animeData = mediaData as AniListMediaDetails;
      const formatedTitle = animeData.title.english ?
        animeData.title.english === animeData.title.romaji ? animeData.title.english :
          `${animeData.title.english} (${animeData.title.romaji})` : animeData.title.romaji;

      return {
        id: String(animeData.id),
        title: formatedTitle ?? "",
        type: mediaType,
        coverUrl: animeData.coverImage.large,
        description: animeData.description,
        releaseDate: animeData.startDate ? anilistDateToIso(animeData.startDate) : undefined,
        tags: animeData.genres || [],
      };
    }
    case MediaTypeEnum.MANGA: {
      const mangaData = mediaData as AniListMediaDetails;
      const formatedTitle = mangaData.title.english ?
        mangaData.title.english === mangaData.title.romaji ? mangaData.title.english :
          `${mangaData.title.english} (${mangaData.title.romaji})` : mangaData.title.romaji;

      return {
        id: String(mangaData.id),
        title: formatedTitle ?? "",
        type: mediaType,
        coverUrl: mangaData.coverImage.large,
        description: mangaData.description,
        releaseDate: mangaData.startDate ? anilistDateToIso(mangaData.startDate) : undefined,
        tags: mangaData.genres || [],
      };
    }
    case MediaTypeEnum.GAME: {
      const gameData = mediaData as GameBrainGame;
      return {
        id: String(gameData.id),
        title: gameData.name,
        type: mediaType,
        coverUrl: gameData.image ?? "",
        description: gameData.description,
        releaseDate: gameData.release_date,
        tags: gameData.tags?.map((tag) => tag.name) || [],
      };
    }
    default:
      throw new Error("Unknown media type");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPosterUrl(type: MediaTypeEnum, data: any): string {
  if(!data) return "";

  switch (type) {
    case MediaTypeEnum.MOVIES:
      return tmdbPosterUrl(data.poster_path, "original");
    case MediaTypeEnum.MANGA:
      return data.coverImage?.large;
    case MediaTypeEnum.ANIME:
      return data.coverImage?.large;
    case MediaTypeEnum.BOOK:
      return data.coverImageUrl;
    case MediaTypeEnum.GAME:
      return data.image;
    default:
      return "";
  }

}
