/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnimeTabs } from "../anime/tabs";
import { BookTabs } from "../books/tabs";
import { GameTabs } from "../game/tabs";
import { MangaTabs } from "../manga/tabs";
import { MovieTabs } from "../movies/tabs";
import { MusicTabs } from "../music/tabs";

import { MediaTypeEnum } from "@/types/media";

type MediaTabsProps = {
  mediaType: MediaTypeEnum;
  data: any;
}

export const MediaTabs = ({ data, mediaType }: MediaTabsProps) => {
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
      case MediaTypeEnum.BOOK:
        return <BookTabs data={data} />;
      case MediaTypeEnum.MUSIC:
        return <MusicTabs data={data} />;

      default: return null;
    }
  }

  return getTabData();
}
