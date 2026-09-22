import type { TFunction } from "i18next";

import { MediaTypeEnum } from "@/types/media";

interface MediaTypeText {
  label: string;
  placeholder: string;
}

export function getPageTranslation(t: TFunction, page?: MediaTypeEnum): MediaTypeText {
  switch (page) {
    case MediaTypeEnum.MOVIES:
      return {
        label: t("searchForm.pageLabelMovies", { ns: "media" }),
        placeholder: t("searchForm.pagePlaceholderMovies", { ns: "media" }),
      };
    default:
      return {
        label: t("searchForm.pageLabelDefault", { ns: "media" }),
        placeholder: t("searchForm.pagePlaceholderDefault", { ns: "media" }),
      };
  }
}

export const MEDIA_TYPE_PATH: Record<MediaTypeEnum, string> = {
  [MediaTypeEnum.MOVIES]: "movies",
  [MediaTypeEnum.ANIME]: "anime",
  [MediaTypeEnum.MANGA]: "manga",
  [MediaTypeEnum.BOOK]: "books",
  [MediaTypeEnum.GAME]: "games",
};

export function mediaTypeToPath(type: MediaTypeEnum): string {
  return MEDIA_TYPE_PATH[type] ?? type;
}

export function pathToMediaType(path?: string): MediaTypeEnum | undefined {
  if (!path) return undefined;
  const entry = Object.entries(MEDIA_TYPE_PATH).find(([, segment]) => segment === path);
  return entry ? (entry[0] as MediaTypeEnum) : undefined;
}

export function getMediaTypesOptions(t: TFunction) {
  return [
    { value: MediaTypeEnum.MOVIES, label: t("typePlural.movies", { ns: "media" }) },
    { value: MediaTypeEnum.MANGA, label: t("typePlural.manga", { ns: "media" }) },
    { value: MediaTypeEnum.ANIME, label: t("typePlural.anime", { ns: "media" }) },
    { value: MediaTypeEnum.GAME, label: t("typePlural.game", { ns: "media" }) },
    { value: MediaTypeEnum.BOOK, label: t("typePlural.book", { ns: "media" }) },
  ]
}
