
import { Link } from "react-router";

import { Label } from "@/components/ui/label"
import { formatFromIsoDate } from "@/utils/date"

export const MovieDetails = ({ data }: { data: any }) => {

  const trailer = data?.videos?.results?.find(
    (v: any) => v.site === "YouTube" && v.type === "Trailer"
  );

  const director = data?.credits?.crew?.find(
    (member: any) => member.job === "Director"
  );

  return (
    <div className="bg-card rounded p-2 flex flex-col gap-2">
      <div>
        <Label>
          Duration
        </Label>
        <span>{data.runtime} mins</span>
      </div>

      <div>
        <Label>
          Release Date
        </Label>
        <span>{formatFromIsoDate(data.release_date)}</span>
        {/* TODO: Validar como fazer pra exibir diferente se for ingles  */}
      </div>

      <div>
        <Label>
          Directed by
        </Label>
        <span>{director.name}</span>
      </div>

      <div>
        <Label>
          Production by
        </Label>
        <span>
          {data?.production_companies.map((company, index) => (
            `${index == 0 ? "" : ", "}   ${company.name}`
          ))}
        </span>
      </div>

      <div>
        <Label>
          TMDB Score
        </Label>
        <span>{data.vote_average.toFixed(1)} ★</span>
      </div>

      <div>
        <Label>
          Source
        </Label>

        <Link to={`https://www.themoviedb.org/movie/${data.id}`} target="_blank" >
          TMDB
        </Link>
      </div>
    </div>
  )


}