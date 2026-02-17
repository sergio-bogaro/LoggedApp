import { t } from "i18next"
import { Link } from "react-router"

import { DetailsLabel } from "../general/detailsCard"

import { AniListMediaDetails, getCountAndStatusLabel, getDirector, getStudios } from "@/querries/externalMedia/anilist"
import { formatFromIsoDate } from "@/utils/date"
import { MediaTypeEnum } from "@/types/media"

export const AnimeDetails = ({ data }: { data: AniListMediaDetails }) => {
  const startDate = data.startDate;
  const formattedDate = formatFromIsoDate(`${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(startDate.day).padStart(2, "0")}`);

  const endDate = data.endDate;
  const formattedEndDate = endDate.year ? formatFromIsoDate(`${endDate.year}-${String(endDate.month).padStart(2, "0")}-${String(endDate.day).padStart(2, "0")}`) : " --- "

  return (
    <>
      <DetailsLabel
        label={t("details.episodes", { ns: "media" })}
        value={getCountAndStatusLabel(data, MediaTypeEnum.ANIME)}
      />

      <DetailsLabel
        label={t("details.releaseDate", { ns: "media" })}
        value={formattedDate}
      />

      <DetailsLabel
        label={t("details.endDate", { ns: "media" })}
        value={formattedEndDate}
      />

      {/* TODO: Validar como fazer pra exibir diferente se for ingles  */}

      <DetailsLabel
        label={t("details.director", { ns: "media" })}
        value={getDirector(data)}
      />

      <DetailsLabel
        label={t("details.productionBy", { ns: "media" })}
        value={getStudios(data).map((studio) => studio.name).join(", ")}
      />

      <DetailsLabel
        label={t("details.anilistScore", { ns: "media" })}
        value={((data.averageScore * 0.1) / 2).toFixed(1) + " ★"}
      />

      <DetailsLabel
        label={t("details.source", { ns: "media" })}
        value={
          <Link to={`https://anilist.co/anime/${data.id}`} target="_blank" >
            Anilist
          </Link>
        }
      />
    </>
  )
}