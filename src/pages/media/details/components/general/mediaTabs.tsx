/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnimeTabs } from "../anime/tabs";
import { GameTabs } from "../game/tabs";
import { MangaTabs } from "../manga/tabs";
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
      case MediaTypeEnum.ANIME:
        return <AnimeTabs data={data} />
      case MediaTypeEnum.MANGA:
        return <MangaTabs data={data} />;
      case MediaTypeEnum.GAME:
        return <GameTabs data={data} />;

      default: return null;
    }
  }

  return getTabData();
}
