import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { AnimeDetails } from "./details";

import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { AppTabs } from "@/components/tw/tabs";
import { AniListMediaDetails } from "@/querries/externalMedia/anilist";

type AnimeRecommendation = {
  mediaRecommendation?: {
    id: number;
    title?: {
      romaji?: string;
      english?: string;
    };
    coverImage?: {
      large?: string;
    };
  };
}

function SimilarTab({ similarList }: { similarList: AnimeRecommendation[] }) {
  const { t } = useTranslation("media");

  const recommendations = similarList
    .map((item) => item.mediaRecommendation)
    .filter((item): item is NonNullable<AnimeRecommendation["mediaRecommendation"]> => Boolean(item));

  if (!recommendations.length) {
    return <p className="text-sm text-muted-foreground py-4">{t("animeTabs.empty.similar")}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
      {recommendations.map((anime) => (
        <Link
          to={`/media/anime/details/${anime.id}`}
          key={anime.id}
          className="group flex flex-col gap-2"
        >
          <ImageWithSkeleton
            src={anime.coverImage?.large ?? ""}
            alt={anime.title?.english || anime.title?.romaji || ""}
            className="aspect-2/3 w-full rounded"
          />
          <span className="line-clamp-2 text-sm font-medium text-foreground/90 transition-colors group-hover:text-primary">
            {anime.title?.english || anime.title?.romaji}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function AnimeTabs({ data }: { data: AniListMediaDetails }) {
  const { t } = useTranslation("media");

  return (
    <AppTabs
      defaultValue="details"
      options={[
        {
          label: t("details.label"),
          value: "details",
          content: <AnimeDetails data={data} />,
        },
        {
          label: t("animeTabs.tabs.similar"),
          value: "similar",
          content: <SimilarTab similarList={data?.recommendations?.nodes ?? []} />,
        },
      ]}
    />
  );
}
