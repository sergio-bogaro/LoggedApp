import { t } from "i18next";
import { Link } from "react-router";

import { DetailsLabel } from "../general/detailsCard";

import { RAWGGame } from "@/querries/externalMedia/games";
import { formatFromIsoDate } from "@/utils/date";

export const GameDetails = ({ data }: { data: RAWGGame }) => {

  return (
    <>
      <DetailsLabel
        label={t("details.releaseDate", { ns: "media" })}
        value={formatFromIsoDate(data.released)}
      />

      <DetailsLabel
        label={t("details.rating", { ns: "media" })}
        value={data.rating + " ★"}
      />

      <DetailsLabel
        label={t("details.source", { ns: "media" })}
        value={
          <Link to={`https://rawg.io/games/${data.slug}`} target="_blank" >
            RAWG
          </Link>
        }
      />

    </>
  )
}