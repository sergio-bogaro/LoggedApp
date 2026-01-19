interface MeidaTypeText {
  label: string;
  placeholder: string;
}

export enum MediaTypeEnum {
  MOVIES = "movies",
  MANGA = "manga",
  ANIME = "anime"
}

export function getPageTranslation(page: MediaTypeEnum): MeidaTypeText {
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
]