import { anilistDateToIso, AniListMediaDetails } from "@/querries/externalMedia/anilist";
import { RAWGGame } from "@/querries/externalMedia/games";
import { TMDBMovieDetails, tmdbPosterUrl } from "@/querries/externalMedia/movies";
import { MediaDataDetailsType, MediaTypeEnum } from "@/types/media";

export function getMediaData(mediaType: MediaTypeEnum, mediaData: unknown): MediaDataDetailsType {
  switch (mediaType) {
    case MediaTypeEnum.MOVIES: {
      const movieData = mediaData as TMDBMovieDetails;
      return {
        id: String(movieData.id),
        title: movieData.title,
        type: mediaType,
        coverUrl: tmdbPosterUrl(movieData.poster_path, "original") || undefined,
        description: movieData.overview,
        releaseDate: movieData.release_date,
        tags: movieData.genres?.map((g) => g.name) || [],
      };
    }
    case MediaTypeEnum.ANIME: {

      const animeData = mediaData as AniListMediaDetails;
      return {
        id: String(animeData.id),
        title: animeData.title.romaji,
        type: mediaType,
        coverUrl: animeData.coverImage.large,
        description: animeData.description,
        releaseDate: animeData.startDate ? anilistDateToIso(animeData.startDate) : undefined,
        tags: animeData.genres || [],
      };
    }
    case MediaTypeEnum.MANGA: {
      const mangaData = mediaData as AniListMediaDetails;
      return {
        id: String(mangaData.id),
        title: mangaData.title.romaji,
        type: mediaType,
        coverUrl: mangaData.coverImage.large,
        description: mangaData.description,
        releaseDate: mangaData.startDate ? anilistDateToIso(mangaData.startDate) : undefined,
        tags: mangaData.genres || [],
      };
    }
    case MediaTypeEnum.GAME: {
      const gameData = mediaData as RAWGGame;
      return {
        id: String(gameData.id),
        title: gameData.name,
        type: mediaType,
        coverUrl: gameData.background_image,
        description: gameData.description,
        releaseDate: gameData.released,
        tags: gameData.tags.map((tag) => tag.name) || [],
      };
    }
    default:
      throw new Error("Unknown media type");
  }
}