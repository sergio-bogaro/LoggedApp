/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageWithSkeleton } from "@/components/tw/imageSkeleton";
import { tmdbPosterUrl } from "@/lib/querry/tmdb";
import { MediaTypeEnum } from "@/utils/mediaText";

type MediaPosterProps = {
  mediaType: MediaTypeEnum;
  data: any;
}

export const MediaPoster = ({ mediaType, data }: MediaPosterProps) => {
  function getPosterUrl(type: MediaTypeEnum, data: any) {
    switch (type) {
      case MediaTypeEnum.MOVIES:
        return tmdbPosterUrl(data.poster_path, "original");
      case MediaTypeEnum.MANGA:
        return data.coverImage?.large;
      case MediaTypeEnum.ANIME:
        return data.coverImage?.large;
      default:
        return "";
    }

  }
  return <ImageWithSkeleton src={getPosterUrl(mediaType, data)} alt={data.title} className="mb-4" />
}