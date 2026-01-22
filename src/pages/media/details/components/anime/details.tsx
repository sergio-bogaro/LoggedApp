import { t } from "i18next"
import { Link } from "react-router"

import { DetailsLabel } from "../general/detailsCard"

import { AniListMediaDetails, getCountAndStatusLabel, getDirector, getStudios } from "@/lib/querry/anilist"
import { formatFromIsoDate } from "@/utils/date"
import { MediaTypeEnum } from "@/utils/mediaText"

export const AnimeDetails = ({ data }: { data: AniListMediaDetails }) => {
  const startDate = data.startDate;
  const formattedDate = formatFromIsoDate(`${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(startDate.day).padStart(2, "0")}`);

  const endDate = data.endDate;
  const formattedEndDate = endDate.year ? formatFromIsoDate(`${endDate.year}-${String(endDate.month).padStart(2, "0")}-${String(endDate.day).padStart(2, "0")}`) : " --- "

  console.log(data)

  return (
    <>
      <DetailsLabel
        label={t("Episodes")}
        value={getCountAndStatusLabel(data, MediaTypeEnum.ANIME)}
      />

      <DetailsLabel
        label={t("Release Date")}
        value={formattedDate}
      />

      <DetailsLabel
        label={t("End Date")}
        value={formattedEndDate}
      />

      {/* TODO: Validar como fazer pra exibir diferente se for ingles  */}

      <DetailsLabel
        label={t("Director")}
        value={getDirector(data)}
      />

      <DetailsLabel
        label={t("Production")}
        value={getStudios(data).map((studio) => studio.name).join(", ")}
      />

      <DetailsLabel
        label={t("Anilist Score")}
        value={((data.averageScore * 0.1) / 2).toFixed(1) + " ★"}
      />

      <DetailsLabel
        label={t("Source")}
        value={
          <Link to={`https://anilist.co/anime/${data.id}`} target="_blank" >
            Anilist
          </Link>
        }
      />
    </>
  )
}