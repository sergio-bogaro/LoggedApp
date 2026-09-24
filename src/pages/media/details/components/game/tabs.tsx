import { useTranslation } from "react-i18next";

import { GameDetails } from "./details";

import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { AppTabs } from "@/components/tw/tabs";
import { IGDBGame, IgdbVideo } from "@/querries/externalMedia/games";

// IGDB Website category enum values
const WEBSITE_LABELS: Record<number, string> = {
  1: "Official",
  3: "Wikipedia",
  4: "Facebook",
  5: "Twitter",
  6: "Twitch",
  8: "Instagram",
  9: "YouTube",
  13: "Steam",
  14: "Reddit",
  15: "itch.io",
  16: "Epic Games",
  17: "GOG",
  18: "Discord",
  19: "Bluesky",
};

// Store / commerce website types
const STORE_TYPES = [1, 13, 15, 16, 17];
// Community / social website types
const COMMUNITY_TYPES = [3, 4, 5, 6, 8, 9, 14, 18, 19];

function ScreenshotsTab({ screenshots }: { screenshots: string[] }) {
  const { t } = useTranslation("media");

  if (!screenshots.length) {
    return <p className="text-step-1 text-muted-foreground py-4">{t("gameTabs.empty.screenshots")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {screenshots.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded">
          <ImageWithSkeleton
            src={url}
            alt={`Screenshot ${i + 1}`}
            className="aspect-video w-full rounded transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        </a>
      ))}
    </div>
  );
}

function StoryTab({ storyline }: { storyline?: string | null }) {
  const { t } = useTranslation("media");

  if (!storyline) {
    return <p className="text-step-1 text-muted-foreground py-4">{t("gameTabs.empty.story")}</p>;
  }

  return (
    <p className="py-4 text-step-1 leading-relaxed whitespace-pre-line">
      {storyline}
    </p>
  );
}

function VideosTab({ videos }: { videos: IgdbVideo[] }) {
  const { t } = useTranslation("media");

  if (!videos.length) {
    return <p className="text-step-1 text-muted-foreground py-4">{t("gameTabs.empty.videos")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
      {videos.map((video) => (
        <div key={video.id} className="flex flex-col gap-1">
          <div className="aspect-video w-full overflow-hidden rounded">
            <iframe
              src={`https://www.youtube.com/embed/${video.videoId}`}
              title={video.name}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <span className="text-step-0 font-medium text-muted-foreground line-clamp-1">
            {video.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function LinksGroup({
  title,
  websites,
}: {
  title: string;
  websites: { type: number; url: string }[];
}) {
  return (
    <div>
      <p className="mb-2 text-step-1 text-muted-foreground">
        {title}
      </p>
      <div className="divide-y divide-border">
        {websites.map((website, i) => {
          const label = WEBSITE_LABELS[website.type] || new URL(website.url).hostname;
          return (
            <a
              key={i}
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-3 hover:text-primary transition-colors"
            >
              <span className="text-step-1 font-medium">{label}</span>
              <span className="text-step-0 text-muted-foreground">↗</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function LinksTab({ websites }: { websites: { type: number; url: string }[] }) {
  const { t } = useTranslation("media");

  if (!websites.length) {
    return <p className="text-step-1 text-muted-foreground py-4">{t("gameTabs.empty.links")}</p>;
  }

  const stores = websites.filter((w) => STORE_TYPES.includes(w.type));
  const community = websites.filter((w) => COMMUNITY_TYPES.includes(w.type));
  const hasAny = stores.length > 0 || community.length > 0;

  if (!hasAny) {
    return <p className="text-step-1 text-muted-foreground py-4">{t("gameTabs.empty.links")}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {stores.length > 0 && (
        <LinksGroup title={t("gameTabs.stores")} websites={stores} />
      )}
      {community.length > 0 && (
        <LinksGroup title={t("gameTabs.community")} websites={community} />
      )}
    </div>
  );
}

export function GameTabs({ data }: { data: IGDBGame }) {
  const { t } = useTranslation("media");

  return (
    <AppTabs
      defaultValue="details"
      options={[
        {
          label: t("details.label"),
          value: "details",
          content: <GameDetails data={data} />,
        },
        {
          label: t("gameTabs.tabs.story"),
          value: "story",
          content: <StoryTab storyline={data.storyline} />,
        },
        {
          label: t("gameTabs.tabs.screenshots"),
          value: "screenshots",
          content: <ScreenshotsTab screenshots={data.screenshots?.map((s) => s.url) ?? []} />,
        },
        {
          label: t("gameTabs.tabs.videos"),
          value: "videos",
          content: <VideosTab videos={data.videos ?? []} />,
        },
        {
          label: t("gameTabs.tabs.links"),
          value: "links",
          content: <LinksTab websites={data.websites ?? []} />,
        },
      ]}
    />
  );
}