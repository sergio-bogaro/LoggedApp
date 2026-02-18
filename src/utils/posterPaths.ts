import { tmdbPosterUrl } from "@/querries/externalMedia/movies";
import { mediaImageUrl } from "@/querries/media/logged";
import { MediaTypeEnum } from "@/types/media";

export function getPosterUrl(type: MediaTypeEnum, data: any) {
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

export function getMediaCoverUrl( coverUrl: string | undefined, imagePath: string | undefined, mediaType: MediaTypeEnum,): string | null {
  if (imagePath) return mediaImageUrl(imagePath);

  if (!coverUrl) return null;

  if (mediaType === MediaTypeEnum.MOVIES && coverUrl.startsWith("/")) {
    return tmdbPosterUrl(coverUrl) ?? null;
  }

  return coverUrl;
}
