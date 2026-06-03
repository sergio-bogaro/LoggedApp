import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { MangaDetails } from "./details";

import { AppTabs } from "@/components/tw/tabs";
import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { AniListMediaDetails } from "@/querries/externalMedia/anilist";

type MangaRecommendation = {
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

function SimilarTab({ similarList }: { similarList: MangaRecommendation[] }) {
  const { t } = useTranslation("media");

  const recommendations = similarList
    .map((item) => item.mediaRecommendation)
    .filter((item): item is NonNullable<MangaRecommendation["mediaRecommendation"]> => Boolean(item));

  if (!recommendations.length) {
    return <p className="py-4 text-sm text-muted-foreground">{t("mangaTabs.empty.similar")}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
      {recommendations.map((manga) => (
        <Link
          to={`/media/manga/details/${manga.id}`}
          key={manga.id}
          className="group flex flex-col gap-2"
        >
          <ImageWithSkeleton
            src={manga.coverImage?.large ?? ""}
            alt={manga.title?.english || manga.title?.romaji || ""}
            className="aspect-2/3 w-full rounded"
          />
          <span className="line-clamp-2 text-sm font-medium text-foreground/90 transition-colors group-hover:text-primary">
            {manga.title?.english || manga.title?.romaji}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function MangaTabs({ data }: { data: AniListMediaDetails }) {
  const { t } = useTranslation("media");

  return (
    <AppTabs
      defaultValue="details"
      options={[
        {
          label: t("details.label"),
          value: "details",
          content: <MangaDetails data={data} />,
        },
        {
          label: t("mangaTabs.tabs.similar"),
          value: "similar",
          content: <SimilarTab similarList={data?.recommendations?.nodes ?? []} />,
        },
      ]}
    />
  );
}
