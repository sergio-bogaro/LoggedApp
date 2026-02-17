import { t } from "i18next";
import { History, List } from "lucide-react";
import { ReactNode } from "react";

import { AnimeDetails } from "../anime/details";
import { GameDetails } from "../game/details";
import { MangaDetails } from "../manga/details";
import { MovieDetails } from "../movies/details";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AniListMediaDetails } from "@/querries/externalMedia/anilist";
import { RAWGGame } from "@/querries/externalMedia/games";
import { MediaTypeEnum } from "@/types/media";

type DetailsCardProps = {
  mediaType: MediaTypeEnum;
  data: any;
}

export const DetailsLabel = ({ label, value }: { label: string; value: string | ReactNode }) => {
  return (
    <div>
      <Label>
        {label}
      </Label>

      <span>{value}</span>
    </div>
  )
}

export const DetailsCard = ({ mediaType, data }: DetailsCardProps) => {

  function getDetails() {
    switch (mediaType) {
      case MediaTypeEnum.MOVIES:
        return <MovieDetails data={data} />;
      case MediaTypeEnum.MANGA:
        return <MangaDetails data={data as AniListMediaDetails} />;
      case MediaTypeEnum.ANIME:
        return <AnimeDetails data={data as AniListMediaDetails} />;
      case MediaTypeEnum.BOOK:
        return <p>Book details coming soon...</p>;
      case MediaTypeEnum.GAME:
        return <GameDetails data={data as RAWGGame} />;

      default: return null;
    }
  }

  return (
    <div className="flex flex-col w-1/5 text-wrap gap-3">
      <h3 className="mx-auto">{t("details.label", { ns: "media" })}</h3>

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