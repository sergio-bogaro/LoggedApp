import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { MangaDetails } from "./details";

import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { AppTabs } from "@/components/tw/tabs";
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

const RELATION_TYPE_TO_ROUTE: Record<string, string> = {
  ANIME: "anime",
  MANGA: "manga",
};

const INTERESTING_RELATIONS = ["SEQUEL", "PREQUEL", "ADAPTATION", "SIDE_STORY", "SPIN_OFF", "SOURCE", "PARENT", "ALTERNATIVE"];

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

type CharacterNode = NonNullable<AniListMediaDetails["characters"]>["nodes"][number];

function CharactersTab({ characters }: { characters: CharacterNode[] }) {
  const { t } = useTranslation("media");

  if (!characters.length) {
    return <p className="py-4 text-sm text-muted-foreground">{t("mangaTabs.empty.characters")}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      {characters.map((char) => (
        <div key={char.id} className="flex flex-col gap-1">
          <ImageWithSkeleton
            src={char.image?.large ?? ""}
            alt={char.name.full}
            className="aspect-2/3 w-full rounded"
          />
          <span className="text-xs font-medium text-center line-clamp-2">{char.name.full}</span>
        </div>
      ))}
    </div>
  );
}

type StaffEdge = NonNullable<AniListMediaDetails["staff"]>["edges"][number];

function StaffTab({ staff }: { staff: StaffEdge[] }) {
  const { t } = useTranslation("media");

  if (!staff.length) {
    return <p className="py-4 text-sm text-muted-foreground">{t("mangaTabs.empty.staff")}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {staff.map((edge, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          {edge.node.image?.large ? (
            <img
              src={edge.node.image.large}
              alt={edge.node.name.full}
              className="w-10 h-10 rounded-full object-cover shrink-0 bg-muted"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-medium text-muted-foreground">
              {edge.node.name.full.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight truncate">{edge.node.name.full}</p>
            <p className="text-xs text-muted-foreground truncate">{edge.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

type RelationEdge = NonNullable<AniListMediaDetails["relations"]>["edges"][number];

function RelationsTab({ relations }: { relations: RelationEdge[] }) {
  const { t } = useTranslation("media");

  const filtered = relations.filter((e) => INTERESTING_RELATIONS.includes(e.relationType));

  if (!filtered.length) {
    return <p className="py-4 text-sm text-muted-foreground">{t("mangaTabs.empty.relations")}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {filtered.map((edge, i) => {
        const route = RELATION_TYPE_TO_ROUTE[edge.node.type];
        const title = edge.node.title.english || edge.node.title.romaji || "";
        const inner = (
          <div className="flex items-center justify-between py-3 gap-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-28 shrink-0">
              {t(`animeTabs.relationTypes.${edge.relationType}`, { defaultValue: edge.relationType })}
            </span>
            <div className="text-right min-w-0">
              <p className="text-sm font-medium truncate">{title}</p>
              <p className="text-xs text-muted-foreground truncate">{edge.node.format}</p>
            </div>
          </div>
        );
        return route ? (
          <Link to={`/media/${route}/details/${edge.node.id}`} key={i} className="block hover:bg-accent/50 transition-colors">
            {inner}
          </Link>
        ) : (
          <div key={i}>{inner}</div>
        );
      })}
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
          label: t("mangaTabs.tabs.characters"),
          value: "characters",
          content: <CharactersTab characters={data?.characters?.nodes ?? []} />,
        },
        {
          label: t("mangaTabs.tabs.staff"),
          value: "staff",
          content: <StaffTab staff={data?.staff?.edges ?? []} />,
        },
        {
          label: t("mangaTabs.tabs.similar"),
          value: "similar",
          content: <SimilarTab similarList={data?.recommendations?.nodes ?? []} />,
        },
        {
          label: t("mangaTabs.tabs.relations"),
          value: "relations",
          content: <RelationsTab relations={data?.relations?.edges ?? []} />,
        },
      ]}
    />
  );
}

