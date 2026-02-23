import { t } from "i18next"
import { Link } from "react-router"

import { DetailsLabel } from "../general/detailsCard"

import { AniListMediaDetails, getArtist, getAuthor, getCountAndStatusLabel } from "@/querries/externalMedia/anilist"
import { MediaTypeEnum } from "@/types/media"
import { formatFromIsoDate } from "@/utils/date"

export const MangaDetails = ({ data }: { data: AniListMediaDetails }) => {
  const startDate = data.startDate;
  const formattedDate = formatFromIsoDate(`${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(startDate.day).padStart(2, "0")}`);

  const endDate = data.endDate;
  const formattedEndDate = endDate.year ? formatFromIsoDate(`${endDate.year}-${String(endDate.month).padStart(2, "0")}-${String(endDate.day).padStart(2, "0")}`) : " --- "

  return (
    <>
      <DetailsLabel
        label={t("details.status", { ns: "media" })}
        value={getCountAndStatusLabel(data, MediaTypeEnum.MANGA)}
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
        label={t("details.author", { ns: "media" })}
        value={getAuthor(data)}
      />

      <DetailsLabel
        label={t("details.artist", { ns: "media" })}
        value={getArtist(data)}
      />

      <DetailsLabel
        label={t("details.anilistScore", { ns: "media" })}
        value={((data.averageScore * 0.1) / 2).toFixed(1) + " ★"}
      />

      <DetailsLabel
        label={t("details.source", { ns: "media" })}
        value={
          <Link to={`https://anilist.co/manga/${data.id}`} target="_blank" >
            Anilist
          </Link>
        }
      />
    </>
  )
}