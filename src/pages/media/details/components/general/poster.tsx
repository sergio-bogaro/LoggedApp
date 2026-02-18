/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { MediaTypeEnum } from "@/types/media";
import { getPosterUrl } from "@/utils/posterPaths";

type MediaPosterProps = {
  mediaType: MediaTypeEnum;
  data: any;
}

export const MediaPoster = ({ mediaType, data }: MediaPosterProps) => {

  return <ImageWithSkeleton src={getPosterUrl(mediaType, data)} alt={data.title} className="mb-4 aspect-2/3" />
}