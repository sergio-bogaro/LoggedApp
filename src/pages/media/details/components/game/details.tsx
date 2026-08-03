import { t } from "i18next";
import { Link } from "react-router";

import { DetailsLabel } from "../general/detailsCard";

import { IGDBGame, getPlatformNames, getPrimaryDeveloper, getPrimaryPublisher } from "@/querries/externalMedia/games";
import { formatFromIsoDate } from "@/utils/date";

export const GameDetails = ({ data }: { data: IGDBGame }) => {

  return (
    <div className="divide-y divide-border">
      <DetailsLabel
        label={t("details.releaseDate", { ns: "media" })}
        value={formatFromIsoDate(data.firstReleaseDate ?? undefined)}
      />

      <DetailsLabel
        label={t("details.rating", { ns: "media" })}
        value={data.rating ? `${data.rating.toFixed(1)} ★${data.totalRatingCount ? ` (${data.totalRatingCount.toLocaleString()})` : ""}` : ""}
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
        label={t("details.publisher", { ns: "media" })}
        value={getPrimaryPublisher(data) ?? ""}
      />

      <DetailsLabel
        label={t("details.source", { ns: "media" })}
        value={
          <Link to={`https://www.igdb.com/games/${data.slug}`} target="_blank" >
            {t("sources.igdb", { ns: "media" })}
          </Link>
        }
      />

    </div>
  )
}
