import type { User } from "@/types/auth";
import { MediaTypeEnum } from "@/types/media";

export type MediaTrackValues = Record<MediaTypeEnum, boolean>;

export type TrackFlagKey = "trackMovies" | "trackAnime" | "trackManga" | "trackGames" | "trackBooks" | "trackMusic" | "trackSeries";

export const trackFlagByType: Record<MediaTypeEnum, TrackFlagKey> = {
  [MediaTypeEnum.MOVIES]: "trackMovies",
  [MediaTypeEnum.ANIME]: "trackAnime",
  [MediaTypeEnum.MANGA]: "trackManga",
  [MediaTypeEnum.GAME]: "trackGames",
  [MediaTypeEnum.BOOK]: "trackBooks",
  [MediaTypeEnum.MUSIC]: "trackMusic",
  [MediaTypeEnum.SERIES]: "trackSeries",
};

const legacyTrackFlagByType: Record<MediaTypeEnum, string> = {
  [MediaTypeEnum.MOVIES]: "track_movies",
  [MediaTypeEnum.ANIME]: "track_anime",
  [MediaTypeEnum.MANGA]: "track_manga",
  [MediaTypeEnum.GAME]: "track_games",
  [MediaTypeEnum.BOOK]: "track_books",
  [MediaTypeEnum.MUSIC]: "track_music",
  [MediaTypeEnum.SERIES]: "track_series",
};

/** Types logged as a single event (one date, always finished) rather than a period. */
export const oneTimeConsumptionTypes: MediaTypeEnum[] = [
  MediaTypeEnum.MOVIES,
  MediaTypeEnum.MUSIC,
];

export function isOneTimeConsumption(type?: MediaTypeEnum | null): boolean {
  return type != null && oneTimeConsumptionTypes.includes(type);
}

export function getTrackFlags(user: User | null): MediaTrackValues {
  const legacyUser = user as unknown as Record<string, boolean | undefined>;

  const result = {} as MediaTrackValues;
  for (const type of Object.values(MediaTypeEnum)) {
    const camelValue = user?.[trackFlagByType[type]];
    const legacyValue = legacyUser[legacyTrackFlagByType[type]];
    result[type] = camelValue ?? legacyValue ?? true;
  }

  return result;
}