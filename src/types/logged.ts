import { MediaStatusEnum, MediaTypeEnum } from "./media";

export type MediaResponse = {
  id: number;
  externalId: string;
  title: string;
  type: MediaTypeEnum;
  status: MediaStatusEnum;
  onList: boolean;
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
  mediaId: number;
  date: string;
  status?: MediaStatusEnum;
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
  title: string;
  type: MediaTypeEnum;
  externalId: string;
  status?: MediaStatusEnum;
  description?: string;
  coverUrl?: string;
  onList?: boolean;
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
  onList?: boolean;
  releaseDate?: string;
  rating?: number;
  review?: string;
  tags?: string[];
};

export type MediaLogCreatePayload = {
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