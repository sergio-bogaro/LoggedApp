import type { TFunction } from "i18next";

import { MediaTypeEnum } from "@/types/media";

export const MEDIA_TYPE_PATH: Record<MediaTypeEnum, string> = {
  [MediaTypeEnum.MOVIES]: "movies",
  [MediaTypeEnum.ANIME]: "anime",
  [MediaTypeEnum.MANGA]: "manga",
  [MediaTypeEnum.BOOK]: "books",
  [MediaTypeEnum.GAME]: "games",
  [MediaTypeEnum.MUSIC]: "music",
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
    { value: MediaTypeEnum.MUSIC, label: t("typePlural.music", { ns: "media" }) },
  ]
}

/** Chave i18n do rótulo de progresso por tipo de mídia (unidade implícita). */
export const PROGRESS_LABEL_KEYS: Partial<Record<MediaTypeEnum, string>> = {
  [MediaTypeEnum.ANIME]: "track.progressEpisodes",
  [MediaTypeEnum.MANGA]: "track.progressChapters",
  [MediaTypeEnum.BOOK]: "track.progressPages",
  [MediaTypeEnum.GAME]: "track.progressHours",
  [MediaTypeEnum.MUSIC]: "track.progressTracks",
};

export function getProgressLabelKey(type: MediaTypeEnum): string | undefined {
  return PROGRESS_LABEL_KEYS[type];
}

/** Progresso é registrável para tudo que não seja consumo único (filmes). */
export function mediaSupportsProgress(type: MediaTypeEnum): boolean {
  return type !== MediaTypeEnum.MOVIES;
}

/** Formata "12 / 24" a partir dos valores de progresso. */
export function formatProgress(
  progress?: number | null,
  progressTotal?: number | null
): string | null {
  if (progress === null || progress === undefined) return null;

  const base = Number.isInteger(progress) ? String(progress) : progress.toFixed(1);
  if (progressTotal === null || progressTotal === undefined) return base;

  const total = Number.isInteger(progressTotal) ? String(progressTotal) : progressTotal.toFixed(1);
  return `${base} / ${total}`;
}
