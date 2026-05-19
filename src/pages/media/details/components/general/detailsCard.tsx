import { History, List } from "lucide-react";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

import { AnimeDetails } from "../anime/details";
import { GameDetails } from "../game/details";
import { MangaDetails } from "../manga/details";
import { MovieDetails } from "../movies/details";

import { MediaHistoryDialog } from "@/components/tw/dialogs/mediaHistoryDialog";
import { Card } from "@/components/tw/generic/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AniListMediaDetails } from "@/querries/externalMedia/anilist";
import { GameBrainGame } from "@/querries/externalMedia/gamebrain";
import { RAWGGame } from "@/querries/externalMedia/games";
import { MediaResponse } from "@/types/logged";
import { MediaTypeEnum } from "@/types/media";

type DetailsCardProps = {
  mediaType: MediaTypeEnum;
  data: any;
  existingMedia?: MediaResponse | null;
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

export const DetailsCard = ({ mediaType, data, existingMedia }: DetailsCardProps) => {
  const { t } = useTranslation("media");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  function getDetails() {
    switch (mediaType) {
      case MediaTypeEnum.MOVIES:
        return <MovieDetails data={data} />;
      case MediaTypeEnum.MANGA:
        return <MangaDetails data={data as AniListMediaDetails} />;
      case MediaTypeEnum.ANIME:
        return <AnimeDetails data={data as AniListMediaDetails} />;
      case MediaTypeEnum.BOOK:
        return <p>{t("details.bookComingSoon")}</p>;
      case MediaTypeEnum.GAME:
        return <GameDetails data={data as GameBrainGame} />;

      default: return null;
    }
  }

  return (
    <>
      <div className="flex flex-col w-1/5 text-wrap gap-3">
        <h3 className="mx-auto">{t("details.label")}</h3>

        <Card>
          {getDetails()}
        </Card>

        <Card className="flex-row justify-around">
          <Button
            variant="secondary"
            disabled={!existingMedia}
            onClick={() => setIsHistoryOpen(true)}
          >
            <History />
          </Button>

          <Button>
            <List />
          </Button>
        </Card>
      </div>

      <MediaHistoryDialog
        media={existingMedia ?? undefined}
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
      />
    </>

  )
}
