import { tmdbPosterUrl } from "@/querries/externalMedia/movies";
import { MediaTypeEnum } from "@/types/media";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPosterUrl(type: MediaTypeEnum, data: any) {
  switch (type) {
    case MediaTypeEnum.MOVIES:
      return tmdbPosterUrl(data.poster_path, "original");
    case MediaTypeEnum.MANGA:
      return data.coverImage?.extraLarge || data.coverImage?.large;
    case MediaTypeEnum.ANIME:
      return data.coverImage?.extraLarge || data.coverImage?.large;
    case MediaTypeEnum.BOOK:
      return data.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
        : "";
    case MediaTypeEnum.GAME:
      return data.coverUrl;
    default:
      return "";
  }

}
