import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { SeriesDetails } from "./details";

import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { AppTabs } from "@/components/tw/tabs";
import { Button } from "@/components/ui/button";
import { TMDBCrewMember, TMDBVideo, tmdbPosterUrl } from "@/querries/externalMedia/movies";
import { TMDBTvAggregateCastMember, TMDBTvDetails, TMDBTvSeason, TMDBTvSummary } from "@/querries/externalMedia/series";
import { formatFromIsoDate } from "@/utils/date";

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
  writer?: ExtractedCrewRole;
  composer?: ExtractedCrewRole;
  producer?: ExtractedCrewRole;
  dop?: ExtractedCrewRole;
}

const CREW_PRIORITY: { key: keyof ExtractedCrew; jobs: string[] }[] = [
  { key: "director", jobs: ["Director"] },
  { key: "writer", jobs: ["Writer", "Teleplay", "Screenplay", "Story"] },
  { key: "composer", jobs: ["Original Music Composer", "Music", "Score"] },
  { key: "producer", jobs: ["Executive Producer", "Producer"] },
  { key: "dop", jobs: ["Director of Photography", "Cinematography"] },
];

const CREW_LABEL_KEYS: Record<keyof ExtractedCrew, string> = {
  director: "moviesTabs.crewLabels.director",
  writer: "moviesTabs.crewLabels.screenplay",
  composer: "moviesTabs.crewLabels.composer",
  producer: "moviesTabs.crewLabels.producer",
  dop: "moviesTabs.crewLabels.dop",
};

function extractCast(cast: TMDBTvAggregateCastMember[], limit = 10): ExtractedCast[] {
  return cast
    .map((person) => ({
      name: person.name,
      character: (person.roles ?? []).map((role) => role.character).filter(Boolean).join(", "),
      photo: tmdbPosterUrl(person.profile_path),
    }))
    .filter((person) => person.character.trim())
    .slice(0, limit);
}

function extractCrew(crew: TMDBCrewMember[]): ExtractedCrew {
  const extractedCrew: ExtractedCrew = {};
  for (const { key, jobs } of CREW_PRIORITY) {
    const found = crew.find((person) =>
      jobs.some((job) => person.job?.toLowerCase().includes(job.toLowerCase()))
    );
    if (found) extractedCrew[key] = { name: found.name, job: found.job ?? "" };
  }

  return extractedCrew;
}

function Avatar({ name, photo }: { name: string; photo: string | null }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (photo) {
    return (
      <ImageWithSkeleton
        src={photo}
        alt={name}
        className="w-12 h-12 rounded-full shrink-0"
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0 text-step-0 font-medium text-muted-foreground">
      {initials}
    </div>
  );
}

function CastTab({ castList }: { castList: TMDBTvAggregateCastMember[] }) {
  const { t } = useTranslation("media");
  const [fullCast, setFullCast] = useState(false);

  const cast = extractCast(castList, fullCast ? castList.length : 5);

  if (!cast.length) {
    return <p className="text-step-1 text-muted-foreground py-4">{t("seriesTabs.empty.cast")}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {cast.map((member, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Avatar name={member.name} photo={member.photo} />
          <div className="min-w-0">
            <p className="text-step-1 font-medium leading-tight truncate">{member.name}</p>
            <p className="text-step-0 text-muted-foreground truncate">{member.character}</p>
          </div>
        </div>
      ))}

      {castList.length > 5 && (
        <Button onClick={() => setFullCast((previous) => !previous)}>
          {fullCast ? t("moviesTabs.actions.showLess") : t("moviesTabs.actions.showMore")}
        </Button>
      )}
    </div>
  );
}

function CrewTab({ crewList }: { crewList: TMDBCrewMember[] }) {
  const { t } = useTranslation("media");
  const crew = extractCrew(crewList);

  const entries = (Object.keys(crew) as (keyof ExtractedCrew)[]).map((key) => ({
    label: t(CREW_LABEL_KEYS[key]),
    ...crew[key]!,
  }));

  if (!entries.length) {
    return <p className="text-step-1 text-muted-foreground py-4">{t("seriesTabs.empty.crew")}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {entries.map((entry, i) => (
        <div key={i} className="flex items-center justify-between py-3 gap-4">
          <span className="w-32 shrink-0 text-step-1 text-muted-foreground">
            {entry.label}
          </span>
          <div className="text-right min-w-0">
            <p className="text-step-1 font-medium truncate">{entry.name}</p>
            <p className="text-step-0 text-muted-foreground truncate">{entry.job}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrailersTab({ videos }: { videos: TMDBVideo[] }) {
  const { t } = useTranslation("media");

  const youtubeVideos = videos.filter(
    (video) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser")
  );

  if (!youtubeVideos.length) {
    return <p className="text-step-1 text-muted-foreground py-4">{t("seriesTabs.empty.trailers")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {youtubeVideos.map((video) => (
        <a
          key={video.id}
          href={`https://www.youtube.com/watch?v=${video.key}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col gap-2"
        >
          <div className="relative overflow-hidden rounded">
            <ImageWithSkeleton
              src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
              alt={video.name}
              className="aspect-video w-full rounded transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
          <p className="text-step-1 font-medium line-clamp-1 transition-colors group-hover:text-primary">{video.name}</p>
        </a>
      ))}
    </div>
  );
}

function SeasonsTab({ seasons }: { seasons: TMDBTvSeason[] }) {
  const { t } = useTranslation("media");

  // Season 0 (specials) is kept out of the grid.
  const list = seasons.filter((season) => season.season_number > 0);

  if (!list.length) {
    return <p className="text-step-1 text-muted-foreground py-4">{t("seriesTabs.empty.seasons")}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {list.map((season) => (
        <div key={season.id} className="flex flex-col gap-2">
          {season.poster_path && (
            <ImageWithSkeleton
              src={tmdbPosterUrl(season.poster_path)}
              alt={season.name}
              className="aspect-2/3 w-full rounded"
            />
          )}

          <div className="min-w-0">
            <p className="text-step-1 font-medium line-clamp-1">{season.name}</p>
            <p className="text-step-0 text-muted-foreground">
              {t("details.episodes")}: {season.episode_count}
            </p>
            {season.air_date && (
              <p className="text-step-0 text-muted-foreground">
                {formatFromIsoDate(season.air_date)}
              </p>
            )}
            {!!season.vote_average && (
              <p className="text-step-0 text-muted-foreground">{season.vote_average.toFixed(1)} ★</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SeriesSimilarTab({ similarList }: { similarList: TMDBTvSummary[] }) {
  const { t } = useTranslation("media");

  if (!similarList?.length) {
    return <p className="text-step-1 text-muted-foreground py-4">{t("seriesTabs.empty.similar")}</p>;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {similarList.map((series) => (
        <Link to={`/media/series/details/${series.id}`} key={series.id} className="group flex flex-col gap-2 overflow-hidden rounded">
          <ImageWithSkeleton
            src={tmdbPosterUrl(series.poster_path)}
            alt={series.name}
            className="aspect-2/3 w-full rounded transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
          <span className="line-clamp-2 text-step-1 font-medium transition-colors group-hover:text-primary">
            {series.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function SeriesTabs({ data }: { data: TMDBTvDetails }) {
  const { t } = useTranslation("media");

  return (
    <AppTabs
      defaultValue="details"
      options={[
        {
          label: t("details.label"),
          value: "details",
          content: <SeriesDetails data={data} />,
        },
        {
          label: t("seriesTabs.tabs.seasons"),
          value: "seasons",
          content: <SeasonsTab seasons={data?.seasons ?? []} />,
        },
        {
          label: t("seriesTabs.tabs.trailers"),
          value: "trailers",
          content: <TrailersTab videos={data?.videos?.results ?? []} />,
        },
        {
          label: t("seriesTabs.tabs.cast"),
          value: "cast",
          content: <CastTab castList={data?.aggregate_credits?.cast ?? []} />,
        },
        {
          label: t("seriesTabs.tabs.crew"),
          value: "crew",
          content: <CrewTab crewList={data?.credits?.crew ?? []} />,
        },
        {
          label: t("seriesTabs.tabs.similar"),
          value: "similar",
          content: <SeriesSimilarTab similarList={data?.recommendations?.results ?? []} />,
        },
      ]}
    />
  );
}
