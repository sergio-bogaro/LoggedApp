interface MediaTypeText {
  label: string;
  placeholder: string;
}

export enum MediaStatusEnum {
    BACKLOG = "backlog",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    DROPPED = "dropped",
    ON_HOLD = "on_hold"
}

export enum MediaTypeEnum {
  MOVIES = "movies",
  MANGA = "manga",
  ANIME = "anime",
  GAME = "game",
  BOOK = "book",
}

export function getPageTranslation(page: MediaTypeEnum): MediaTypeText {
  switch (page) {
    case MediaTypeEnum.MOVIES:
      return { label: "Search Movies (TMDB)", placeholder: "Type a movie name" };
    default:
      return { label: "Search", placeholder: "Type to search..." };
  }
}

export const mediaTypesOptions = [
  { value: MediaTypeEnum.MOVIES, label: "Movies" },
  { value: MediaTypeEnum.MANGA, label: "Manga" },
  { value: MediaTypeEnum.ANIME, label: "Anime" },
  { value: MediaTypeEnum.GAME, label: "Games" },
  { value: MediaTypeEnum.BOOK, label: "Books" },
]