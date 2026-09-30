import { t } from "i18next";
import { Link } from "react-router";

import { DetailsLabel } from "../general/detailsCard";

import { TMDBTvDetails } from "@/querries/externalMedia/series";
import { formatFromIsoDate } from "@/utils/date";

const SERIES_STATUS_KEYS: Record<string, string> = {
  "Returning Series": "returningSeries",
  "Ended": "ended",
  "Canceled": "canceled",
  "In Production": "inProduction",
  "Planned": "planned",
  "Pilot": "pilot",
};

export const SeriesDetails = ({ data }: { data: TMDBTvDetails }) => {
  const episodeRuntime = data?.episode_run_time?.[0];
  const statusKey = data?.status ? SERIES_STATUS_KEYS[data.status] : undefined;

  return (
    <div className="divide-y divide-border">
      <DetailsLabel
        label={t("details.seasons", { ns: "media" })}
        value={String(data?.number_of_seasons ?? "—")}
      />

      <DetailsLabel
        label={t("details.episodes", { ns: "media" })}
        value={String(data?.number_of_episodes ?? "—")}
      />

      <DetailsLabel
        label={t("details.duration", { ns: "media" })}
        value={episodeRuntime ? t("details.durationMinutes", { ns: "media", count: episodeRuntime }) : "—"}
      />

      <DetailsLabel
        label={t("details.releaseDate", { ns: "media" })}
        value={formatFromIsoDate(data?.first_air_date)}
      />

      <DetailsLabel
        label={t("details.endDate", { ns: "media" })}
        value={data?.last_air_date ? formatFromIsoDate(data.last_air_date) : "—"}
      />

      <DetailsLabel
        label={t("details.status", { ns: "media" })}
        value={statusKey ? t(`seriesTabs.status.${statusKey}`, { ns: "media" }) : (data?.status ?? "—")}
      />

      <DetailsLabel
        label={t("details.creators", { ns: "media" })}
        value={data?.created_by?.map((creator) => creator.name).filter(Boolean).join(", ") || "—"}
      />

      <DetailsLabel
        label={t("details.networks", { ns: "media" })}
        value={data?.networks?.map((network) => network.name).filter(Boolean).join(", ") || "—"}
      />

      <DetailsLabel
        label={t("details.productionBy", { ns: "media" })}
        value={data?.production_companies?.map((company) => company?.name).filter(Boolean).join(", ") || "—"}
      />

      <DetailsLabel
        label={t("details.TMDBScore", { ns: "media" })}
        value={data.vote_average?.toFixed(1) + "★"}
      />

      <DetailsLabel
        label={t("details.source", { ns: "media" })}
        value={
          <Link to={`https://www.themoviedb.org/tv/${data.id}`} target="_blank" >
            {t("sources.tmdb", { ns: "media" })}
          </Link>}
      />
    </div>
  );
};
