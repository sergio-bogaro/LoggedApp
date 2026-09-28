import { MediaResponse } from "@/types/logged";
import { MediaStatusEnum } from "@/types/media";

export type MediaCollection = {
  key: string;
  /** i18n key in the `media` namespace. */
  titleKey: string;
  statuses?: MediaStatusEnum[];
  minRating?: number;
};

export const mediaCollections: MediaCollection[] = [
  {
    key: "continue",
    titleKey: "views.collections.continue",
    statuses: [MediaStatusEnum.IN_PROGRESS, MediaStatusEnum.FOLLOWING],
  },
  {
    key: "in_progress",
    titleKey: "status.in_progress",
    statuses: [MediaStatusEnum.IN_PROGRESS],
  },
  {
    key: "following",
    titleKey: "status.following",
    statuses: [MediaStatusEnum.FOLLOWING],
  },
  {
    key: "on_hold",
    titleKey: "status.on_hold",
    statuses: [MediaStatusEnum.ON_HOLD],
  },
  {
    key: "finished",
    titleKey: "status.finished",
    statuses: [MediaStatusEnum.FINISHED],
  },
  {
    key: "dropped",
    titleKey: "status.dropped",
    statuses: [MediaStatusEnum.DROPPED],
  },
  {
    key: "top_rated",
    titleKey: "views.collections.topRated",
    minRating: 8,
  },
];

export const collectionSections: { titleKey: string; keys: string[] }[] = [
  {
    titleKey: "views.sections.active",
    keys: ["continue", "in_progress", "following", "on_hold"],
  },
  {
    titleKey: "views.sections.history",
    keys: ["finished", "dropped"],
  },
  {
    titleKey: "views.sections.curated",
    keys: ["top_rated"],
  },
];

export function getCollection(key: string): MediaCollection | undefined {
  return mediaCollections.find((collection) => collection.key === key);
}

/**
 * Collections filter on the resolved status returned by the API (a title may
 * have a null column but a status derived from its latest log).
 */
export function matchesCollection(media: MediaResponse, collection: MediaCollection): boolean {
  if (collection.statuses) {
    if (!media.status || !collection.statuses.includes(media.status)) {
      return false;
    }
  }

  if (collection.minRating !== undefined && (media.rating ?? 0) < collection.minRating) {
    return false;
  }

  return true;
}

export function filterByCollection(
  items: MediaResponse[],
  collection: MediaCollection
): MediaResponse[] {
  return items.filter((media) => matchesCollection(media, collection));
}
