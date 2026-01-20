import { Link } from "react-router"

import { Label } from "@/components/ui/label"
import { AniListMedia, getArtist, getAuthor } from "@/lib/querry/anilist"
import { formatFromIsoDate } from "@/utils/date"

export const MangaDetail = ({ data }: { data: AniListMedia }) => {
  const startDate = data.startDate;
  const formattedDate = formatFromIsoDate(`${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(startDate.day).padStart(2, "0")}`);

  const endDate = data.endDate;
  const formattedEndDate = endDate.year ? formatFromIsoDate(`${endDate.year}-${String(endDate.month).padStart(2, "0")}-${String(endDate.day).padStart(2, "0")}`) : " --- "

  return (
    <>
      <div>
        <Label>
          Chapters
        </Label>
        <span>{data.chapters ?? " --- "}, {data.status}</span>
      </div>

      <div>
        <Label>
          Release Date
        </Label>
        <span>{formattedDate}</span>
        {/* TODO: Validar como fazer pra exibir diferente se for ingles  */}
      </div>

      <div>
        <Label>
          End Date
        </Label>
        <span>{formattedEndDate}</span>
        {/* TODO: Validar como fazer pra exibir diferente se for ingles  */}
      </div>

      <div>
        <Label>
          Author
        </Label>
        <span>{getAuthor(data)}</span>
      </div>

      <div>
        <Label>
          Artist
        </Label>
        <span>{getArtist(data)}</span>
      </div>

      {/* <div>
        <Label>
          TMDB Score
        </Label>
        <span>{data.vote_average.toFixed(1)} ★</span>
      </div> */}

      {/* <div>
        <Label>
          Source
        </Label>

        <Link to={`https://www.themoviedb.org/movie/${data.id}`} target="_blank" >
          TMDB
        </Link>
      </div> */}
    </>
  )
}