import { MovieInfo } from "../movies/info";

import { MediaTypeEnum } from "@/utils/mediaText";

type MediaInfoProps = {
  mediaType: MediaTypeEnum;
  data: any;
}

export const MediaInfo = ({ mediaType, data }: MediaInfoProps) => {
  function getInfo() {
    switch (mediaType) {
      case MediaTypeEnum.MOVIES:
        return <MovieInfo data={data} />;

      default: return null;
    }
  }

  return getInfo();

}