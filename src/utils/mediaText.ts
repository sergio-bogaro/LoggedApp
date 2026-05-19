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

export function getMediaTypesOptions(t: TFunction) {
  return [
    { value: MediaTypeEnum.MOVIES, label: t("typePlural.movies", { ns: "media" }) },
    { value: MediaTypeEnum.MANGA, label: t("typePlural.manga", { ns: "media" }) },
    { value: MediaTypeEnum.ANIME, label: t("typePlural.anime", { ns: "media" }) },
    { value: MediaTypeEnum.GAME, label: t("typePlural.game", { ns: "media" }) },
    { value: MediaTypeEnum.BOOK, label: t("typePlural.book", { ns: "media" }) },
  ]
}
