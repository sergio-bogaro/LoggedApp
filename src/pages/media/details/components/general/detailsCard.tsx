import { History, List } from "lucide-react";

import { MangaDetail } from "../manga/details";
import { MovieDetails } from "../movies/detail";

import { Button } from "@/components/ui/button";
import { AniListMedia } from "@/lib/querry/anilist";
import { MediaTypeEnum } from "@/utils/mediaText";

type DetailsCardProps = {
  mediaType: MediaTypeEnum;
  data: any;
}

export const DetailsCard = ({ mediaType, data }: DetailsCardProps) => {

  function getDetails() {
    switch (mediaType) {
      case MediaTypeEnum.MOVIES:
        return <MovieDetails data={data} />;
      case MediaTypeEnum.MANGA:
        return <MangaDetail data={data as AniListMedia} />;
      case MediaTypeEnum.ANIME:
        return null;

      default: return null;
    }
  }

  return (
    <div className="flex flex-col w-1/5 text-wrap gap-3">
      <h3 className="mx-auto">Details</h3>

      <div className="bg-card rounded p-2 flex flex-col gap-2">
        {getDetails()}
      </div>

      <div className="bg-card rounded p-2 flex justify-around">
        {/* TODO: Props tooltip */}
        <Button variant="secondary" >
          <History />
        </Button>

        <Button>
          <List />
        </Button>

      </div>

    </div>

  )
}