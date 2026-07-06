import { MediaTypeEnum } from "./media";

export type MediaListItemMedia = {
  id: number;
  externalId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  imagePath?: string;
  releaseDate?: string;
  type: MediaTypeEnum;
};

export type MediaListItem = {
  id: number;
  userId: number;
  mediaType: MediaTypeEnum;
  mediaId: number;
  listType: "favorites" | "backlog";
  dateLog: string;
  media: MediaListItemMedia | null;
};

export type MediaListItemCreatePayload = {
  userId: number;
  mediaType: MediaTypeEnum;
  externalId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  releaseDate?: string;
  dateLog?: string;
};
