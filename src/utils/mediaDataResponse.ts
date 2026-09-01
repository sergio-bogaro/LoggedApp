import { anilistDateToIso, AniListMediaDetails } from "@/querries/externalMedia/anilist";
import { IGDBGame } from "@/querries/externalMedia/games";
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
        coverUrl: animeData.coverImage.extraLarge || animeData.coverImage.large,
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
        coverUrl: mangaData.coverImage.extraLarge || mangaData.coverImage.large,
        description: mangaData.description,
        releaseDate: mangaData.startDate ? anilistDateToIso(mangaData.startDate) : undefined,
        tags: mangaData.genres || [],
      };
    }
    case MediaTypeEnum.GAME: {
      const gameData = mediaData as IGDBGame;
      return {
        id: String(gameData.id),
        title: gameData.name,
        type: mediaType,
        coverUrl: gameData.coverUrl ?? "",
        description: gameData.summary ?? gameData.storyline ?? "",
        releaseDate: gameData.firstReleaseDate ?? undefined,
        tags: gameData.genres?.map((genre) => genre.name) || [],
      };
    }
    case MediaTypeEnum.BOOK: {
      const bookData = mediaData as { key?: string; title?: string; covers?: number[] };
      const coverId = bookData.covers?.[0];

      return {
        id: bookData.key?.split("/").pop() ?? "",
        title: bookData.title ?? "",
        type: mediaType,
        coverUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : "",
        description: "",
        tags: [],
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
      return data.coverImage?.extraLarge || data.coverImage?.large;
    case MediaTypeEnum.ANIME:
      return data.coverImage?.extraLarge || data.coverImage?.large;
    case MediaTypeEnum.BOOK:
      return data.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
        : "";
    case MediaTypeEnum.GAME:
      return data.coverUrl;
    default:
      return "";
  }

}
