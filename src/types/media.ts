/* eslint-disable @typescript-eslint/no-explicit-any */

export enum MediaStatusEnum {
  IN_PROGRESS = "in_progress",
  DROPPED = "dropped",
  ON_HOLD = "on_hold",
  FOLLOWING = "following",
  FINISHED = "finished",

}

export enum MediaTypeEnum {
  MOVIES = "movies",
  MANGA = "manga",
  ANIME = "anime",
  GAME = "game",
  BOOK = "book",
}

export interface MediaItem {
  id: string;
  title: string;
  coverUrl?: string;
  year?: string | number;
  type: MediaTypeEnum;
  description?: string;
  releaseDate?: string;
  [key: string]: any;
}

export type TrackMediaPayload = {
  startDate?: string;
  finishDate?: string;
  status: MediaStatusEnum
  rating?: number;
  review?: string;
};

export interface MediaDataDetailsType {
  id: string;
  title: string;
  type: MediaTypeEnum;
  coverUrl: string;
  description?: string;
  releaseDate?: string;
  tags?: string[];
}