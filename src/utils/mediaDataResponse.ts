import { AniListMediaDetails } from "@/querries/externalMedia/anilist";
import { TMDBMovieDetails, tmdbPosterUrl } from "@/querries/externalMedia/movies";
import { MediaDataDetailsType, MediaTypeEnum } from "@/types/media";

export function getMediaData(mediaType: MediaTypeEnum, mediaData: any): MediaDataDetailsType {
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
        releaseDate: animeData.startDate ? `${animeData.startDate.year}-${animeData.startDate.month}-${animeData.startDate.day}` : undefined,
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
        releaseDate: mangaData.startDate ? `${mangaData.startDate.year}-${mangaData.startDate.month}-${mangaData.startDate.day}` : undefined,
        tags: mangaData.genres || [],
      };
    }
    case MediaTypeEnum.GAME:
      return {
        id: String(mediaData.id),
        title: mediaData.title,
        type: mediaType,
        coverUrl: mediaData.coverUrl,
        description: mediaData.description,
        releaseDate: mediaData.releaseDate,
        tags: mediaData.tags || [],
      };
    default:
      throw new Error("Unknown media type");
  }
}