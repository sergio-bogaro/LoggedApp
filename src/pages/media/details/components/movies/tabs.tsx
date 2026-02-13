import { Link } from "react-router";

import { CastMember, CrewMember, MovieSummary } from "./types";

import { AppTabs } from "@/components/tw/tabs";
import { tmdbPosterUrl } from "@/querries/externalMedia/movies";

function CastTab({ castList }: { castList: CastMember[] }) {
  return (
    <div>
      {castList.map(cast => (
        <div key={cast.cast_id}>
          {cast.name} as {cast.character}
        </div>
      ))}
    </div>
  )
}

function CrewTab({ castList }: { castList: CrewMember[] }) {
  return (
    <div>
      {castList.map(cast => (
        <div key={cast.credit_id}>
          {cast.name} as {cast.department}
        </div>
      ))}
    </div>
  )
}

function SimilarTab({ similarList }: { similarList: MovieSummary[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {similarList?.map((movie, index) => (
        <Link to={`/logger/movies/details/${movie.id}`} key={movie.id}>
          <img
            src={tmdbPosterUrl(movie.poster_path)}
            alt={movie.title}
            className="rounded hover:scale-105 transition-transform cursor-pointer"
          />
        </Link>
      ))}
    </div>
  )

}

export function MovieTabs({ movieData }: { movieData: any }) {
  return (
    <AppTabs
      defaultValue="cast"
      options={[
        {
          label: "CAST",
          value: "cast",
          content: <CastTab castList={movieData?.credits?.cast ?? []} />
        },
        {
          label: "CREW",
          value: "crew",
          content: <CrewTab castList={movieData?.credits?.crew ?? []} />
        },
        {
          label: "Similar",
          value: "similar",
          content: <SimilarTab similarList={movieData?.recommendations?.results ?? []} />
        },
      ]}
    />
  )
}