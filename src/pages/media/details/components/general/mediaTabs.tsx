import { MovieTabs } from "../movies/tabs";

import { MediaTypeEnum } from "@/types/media";

type DetailsCardProps = {
  mediaType: MediaTypeEnum;
  data: any;
}

export const MediaTabs = ({ data, mediaType }: DetailsCardProps) => {
  function getTabData() {
    switch (mediaType) {
      case MediaTypeEnum.MOVIES:
        return <MovieTabs movieData={data} />;

      default: return null;
    }
  }

  return getTabData();
}
