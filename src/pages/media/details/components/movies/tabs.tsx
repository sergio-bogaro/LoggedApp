import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { MovieDetails } from "./details";
import { CastMember, CrewMember, MovieSummary } from "./types";

import { AppTabs } from "@/components/tw/tabs";
import { Button } from "@/components/ui/button";
import { tmdbPosterUrl } from "@/querries/externalMedia/movies";

interface ExtractedCast {
  name: string;
  character: string;
  photo: string;
}

interface ExtractedCrewRole {
  name: string;
  job: string;
}

interface ExtractedCrew {
  director?: ExtractedCrewRole;
  screenplay?: ExtractedCrewRole;
  source?: ExtractedCrewRole;
  composer?: ExtractedCrewRole;
  producer?: ExtractedCrewRole;
  characters?: ExtractedCrewRole;
  dop?: ExtractedCrewRole;
}

const CREW_PRIORITY: { key: keyof ExtractedCrew; jobs: string[] }[] = [
  { key: "director", jobs: ["Director"] },
  { key: "screenplay", jobs: ["Screenplay", "Writer", "Story"] },
  { key: "source", jobs: ["Comic Book", "Novel", "Based on", "Original Story"] },
  { key: "composer", jobs: ["Original Music Composer", "Music", "Score"] },
  { key: "producer", jobs: ["Producer", "Executive Producer"] },
  { key: "characters", jobs: ["Character Designer", "Characters", "Character Design"] },
  { key: "dop", jobs: ["Director of Photography", "Cinematography", "Director of Photography / Camera Operator"] },
];

const CREW_LABEL_KEYS: Record<keyof ExtractedCrew, string> = {
  director: "moviesTabs.crewLabels.director",
  screenplay: "moviesTabs.crewLabels.screenplay",
  source: "moviesTabs.crewLabels.source",
  composer: "moviesTabs.crewLabels.composer",
  producer: "moviesTabs.crewLabels.producer",
  characters: "moviesTabs.crewLabels.characters",
  dop: "moviesTabs.crewLabels.dop",
};

function extractCast(cast: CastMember[], limit = 10): ExtractedCast[] {
  return cast
    .filter(p => p.character?.trim())
    .slice(0, limit)
    .map(p => ({
      name: p.name,
      character: p.character,
      photo: tmdbPosterUrl(p.profile_path),
    }));
}

function extractCrew(crew: CrewMember[]): ExtractedCrew {
  const extractedCrew: ExtractedCrew = {};
  for (const { key, jobs } of CREW_PRIORITY) {
    const found = crew.find(p =>
      jobs.some(j => p.job?.toLowerCase().includes(j.toLowerCase()))
    );
    if (found) extractedCrew[key] = { name: found.name, job: found.job };
  }

  return extractedCrew;
}

function Avatar({ name, photo }: { name: string; photo: string | null }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map(n => n[0])
    .join("")
    .toUpperCase();

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="w-10 h-10 rounded-full object-cover shrink-0 bg-muted"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-medium text-muted-foreground">
      {initials}
    </div>
  );
}

function CastTab({ castList }: { castList: CastMember[] }) {
  const { t } = useTranslation("media");
  const [fullCast, setFullCast] = useState(false);

  function setCrewView() {
    setFullCast(!fullCast);
  }

  const cast = extractCast(castList, fullCast ? castList.length : 5);

  if (!cast.length) {
    return <p className="text-sm text-muted-foreground py-4">{t("moviesTabs.empty.cast")}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {cast.map((member, i) => {
        return (
          <div key={i} className="flex items-center gap-3 py-3">
            <Avatar name={member.name} photo={member.photo} />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground truncate">{member.character}</p>
            </div>
          </div>
        )
      })}

      {castList.length > 5 && (
        <Button onClick={setCrewView}>
          {fullCast ? t("moviesTabs.actions.showLess") : t("moviesTabs.actions.showMore")}
        </Button>
      )}
    </div>
  );
}

function CrewTab({ crewList }: { crewList: CrewMember[] }) {
  const { t } = useTranslation("media");
  const crew = extractCrew(crewList);

  const entries = (Object.keys(crew) as (keyof ExtractedCrew)[]).map(key => ({
    label: t(CREW_LABEL_KEYS[key]),
    ...crew[key]!,
  }));

  if (!entries.length) {
    return <p className="text-sm text-muted-foreground py-4">{t("moviesTabs.empty.crew")}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {entries.map((entry, i) => (
        <div key={i} className="flex items-center justify-between py-3 gap-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-32 flex-shrink-0">
            {entry.label}
          </span>
          <div className="text-right min-w-0">
            <p className="text-sm font-medium truncate">{entry.name}</p>
            <p className="text-xs text-muted-foreground truncate">{entry.job}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SimilarTab({ similarList }: { similarList: MovieSummary[] }) {
  const { t } = useTranslation("media");

  if (!similarList?.length) {
    return <p className="text-sm text-muted-foreground py-4">{t("moviesTabs.empty.similar")}</p>;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {similarList.map(movie => (
        <Link to={`/media/movies/details/${movie.id}`} key={movie.id}>
          <img
            src={tmdbPosterUrl(movie.poster_path)}
            alt={movie.title}
            className="rounded hover:scale-105 transition-transform cursor-pointer w-full"
          />
        </Link>
      ))}
    </div>
  );
}

export function MovieTabs({ movieData }: { movieData: any }) {
  const { t } = useTranslation("media");

  return (
    <AppTabs
      defaultValue="details"
      options={[
        {
          label: t("details.label"),
          value: "details",
          content: <MovieDetails data={movieData} />,
        },
        {
          label: t("moviesTabs.tabs.cast"),
          value: "cast",
          content: <CastTab castList={movieData?.credits?.cast ?? []} />,
        },
        {
          label: t("moviesTabs.tabs.crew"),
          value: "crew",
          content: <CrewTab crewList={movieData?.credits?.crew ?? []} />,
        },
        {
          label: t("moviesTabs.tabs.similar"),
          value: "similar",
          content: <SimilarTab similarList={movieData?.recommendations?.results ?? []} />,
        },
      ]}
    />
  );
}
