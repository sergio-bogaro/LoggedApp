import { MediaStatusEnum, MediaTypeEnum } from "./media";

export type MediaResponse = {
  id: number;
  userId: number;
  externalId: string;
  title: string;
  type: MediaTypeEnum;
  status: MediaStatusEnum;
  description?: string;
  coverUrl?: string;
  imagePath?: string;
  releaseDate?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  logCount: number;
};

export type MediaLogResponse = {
  id: number;
  userId: number;
  mediaId: number;
  date: string;
  status: MediaStatusEnum;
  rating?: number;
  review?: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
};

export type MediaWithLogsResponse = MediaResponse & {
  logs: MediaLogResponse[];
};

export type MediaCreatePayload = {
  userId: number;
  title: string;
  type: MediaTypeEnum;
  externalId: string;
  status?: MediaStatusEnum;
  description?: string;
  coverUrl?: string;
  releaseDate?: string;
  rating?: number;
  review?: string;
  tags?: string[];
};

export type MediaUpdatePayload = {
  title?: string;
  status?: MediaStatusEnum;
  description?: string;
  coverUrl?: string;
  imagePath?: string;
  releaseDate?: string;
  rating?: number;
  review?: string;
  tags?: string[];
};

export type MediaLogCreatePayload = {
  userId: number;
  mediaId: number;
  date?: string;
  status?: MediaStatusEnum;
  rating?: number;
  review?: string;
  startDate?: string;
  endDate?: string;
};

export type MediaLogUpdatePayload = {
  date?: string;
  status?: MediaStatusEnum;
  rating?: number;
  review?: string;
};
