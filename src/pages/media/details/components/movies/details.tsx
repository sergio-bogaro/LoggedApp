
import { t } from "i18next";
import { Link } from "react-router";

import { DetailsLabel } from "../general/detailsCard";

import { TMDBMovieDetails } from "@/querries/externalMedia/movies";
import { formatFromIsoDate } from "@/utils/date"

export const MovieDetails = ({ data }: { data: TMDBMovieDetails }) => {

  const director = data?.credits?.crew?.find(
    (member) => member.job === "Director"
  );

  return (
    <>
      <DetailsLabel
        label={t("Duration")}
        value={data?.runtime + "mins"}
      />

      <DetailsLabel
        label={t("Release Date")}
        value={formatFromIsoDate(data?.release_date)}
      />
      {/* TODO: Validar como fazer pra exibir diferente se for ingles  */}

      <DetailsLabel
        label={t("Directed by")}
        value={director?.name}
      />

      <DetailsLabel
        label={t("Production by")}
        value={data?.production_companies.map((company, index) => (
          `${index == 0 ? "" : ", "}   ${company?.name}`
        ))}
      />

      <DetailsLabel
        label={t("TMDB Score")}
        value={data.vote_average.toFixed(1) + "★"}
      />

      <DetailsLabel
        label={t("Source")}
        value={
          <Link to={`https://www.themoviedb.org/movie/${data.id}`} target="_blank" >
            TMDB
          </Link>}
      />
    </>
  )


}