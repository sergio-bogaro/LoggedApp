/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { tmdbPosterUrl } from "@/querries/externalMedia/movies";
import { MediaTypeEnum } from "@/types/media";

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
      case MediaTypeEnum.BOOK:
        return data.coverImageUrl;
      case MediaTypeEnum.GAME:
        return data.background_image;
      default:
        return "";
    }

  }
  return <ImageWithSkeleton src={getPosterUrl(mediaType, data)} alt={data.title} className="mb-4 aspect-2/3" />
}