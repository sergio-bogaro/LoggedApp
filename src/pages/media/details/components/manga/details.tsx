import { t } from "i18next"
import { Link } from "react-router"

import { DetailsLabel } from "../general/detailsCard"

import { AniListMediaDetails, getArtist, getAuthor, getCountAndStatusLabel } from "@/lib/querry/anilist"
import { formatFromIsoDate } from "@/utils/date"
import { MediaTypeEnum } from "@/utils/mediaText"

export const MangaDetails = ({ data }: { data: AniListMediaDetails }) => {
  const startDate = data.startDate;
  const formattedDate = formatFromIsoDate(`${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(startDate.day).padStart(2, "0")}`);

  const endDate = data.endDate;
  const formattedEndDate = endDate.year ? formatFromIsoDate(`${endDate.year}-${String(endDate.month).padStart(2, "0")}-${String(endDate.day).padStart(2, "0")}`) : " --- "

  console.log(data)

  return (
    <>
      <DetailsLabel
        label={t("Chapters")}
        value={getCountAndStatusLabel(data, MediaTypeEnum.MANGA)}
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
        label={t("Author")}
        value={getAuthor(data)}
      />

      <DetailsLabel
        label={t("Artist")}
        value={getArtist(data)}
      />

      <DetailsLabel
        label={t("Anilist Score")}
        value={((data.averageScore * 0.1) / 2).toFixed(1) + " ★"}
      />

      <DetailsLabel
        label={t("Source")}
        value={
          <Link to={`https://anilist.co/manga/${data.id}`} target="_blank" >
            Anilist
          </Link>
        }
      />
    </>
  )
}