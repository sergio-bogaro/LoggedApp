import { t } from "i18next";
import { Link } from "react-router";

import { DetailsLabel } from "../general/detailsCard";

import { RAWGGame, getPlatformNames, getPrimaryDeveloper } from "@/querries/externalMedia/games";
import { formatFromIsoDate } from "@/utils/date";

export const GameDetails = ({ data }: { data: RAWGGame }) => {

  return (
    <div className="divide-y divide-border">
      <DetailsLabel
        label={t("details.releaseDate", { ns: "media" })}
        value={formatFromIsoDate(data.released)}
      />

      <DetailsLabel
        label={t("details.rating", { ns: "media" })}
        value={data.rating ? `${data.rating.toFixed(1)} ★` : ""}
      />

      <DetailsLabel
        label={t("details.duration", { ns: "media" })}
        value={data.playtime ? t("details.durationHours", { ns: "media", count: data.playtime }) : ""}
      />

      <DetailsLabel
        label={t("details.platforms", { ns: "media" })}
        value={getPlatformNames(data).join(", ")}
      />

      <DetailsLabel
        label={t("details.developer", { ns: "media" })}
        value={getPrimaryDeveloper(data) ?? ""}
      />

      <DetailsLabel
        label={t("details.source", { ns: "media" })}
        value={
          <Link to={`https://rawg.io/games/${data.slug}`} target="_blank" >
            {t("sources.rawg", { ns: "media" })}
          </Link>
        }
      />

    </div>
  )
}
