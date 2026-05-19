import { t } from "i18next";
import { Link } from "react-router";

import { DetailsLabel } from "../general/detailsCard";

import { GameBrainGame, getPlatformNames } from "@/querries/externalMedia/gamebrain";
import { formatFromIsoDate } from "@/utils/date";

export const GameDetails = ({ data }: { data: GameBrainGame }) => {

  return (
    <>
      <DetailsLabel
        label={t("details.releaseDate", { ns: "media" })}
        value={formatFromIsoDate(data.release_date)}
      />

      <DetailsLabel
        label={t("details.rating", { ns: "media" })}
        value={(data.rating.mean * 5).toFixed(1) + " ★"}
      />

      <DetailsLabel
        label={t("details.duration", { ns: "media" })}
        value={t("details.durationHours", { ns: "media", count: Number((data.playtime?.mean ?? 0).toFixed(1)) })}
      />

      <DetailsLabel
        label={t("details.platforms", { ns: "media" })}
        value={getPlatformNames(data).join(", ")}
      />

      <DetailsLabel
        label={t("details.developer", { ns: "media" })}
        value={data.developer || ""}
      />

      <DetailsLabel
        label={t("details.source", { ns: "media" })}
        value={
          <Link to={data.link} target="_blank" >
            {t("sources.gameBrain", { ns: "media" })}
          </Link>
        }
      />

    </>
  )
}
