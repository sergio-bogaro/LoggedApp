import { MediaTypeEnum } from "@/utils/mediaText";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
