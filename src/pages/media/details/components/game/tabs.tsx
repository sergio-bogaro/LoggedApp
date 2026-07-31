import { useTranslation } from "react-i18next";

import { GameDetails } from "./details";

import { AppTabs } from "@/components/tw/tabs";
import { RAWGGame } from "@/querries/externalMedia/games";

type RAWGStore = NonNullable<RAWGGame["stores"]>[number];

function ScreenshotsTab({ screenshots }: { screenshots: string[] }) {
  const { t } = useTranslation("media");

  if (!screenshots.length) {
    return <p className="text-sm text-muted-foreground py-4">{t("gameTabs.empty.screenshots")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {screenshots.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt={`Screenshot ${i + 1}`}
            className="w-full rounded hover:scale-105 transition-transform cursor-pointer"
          />
        </a>
      ))}
    </div>
  );
}

function StoresTab({ stores }: { stores: RAWGStore[] }) {
  const { t } = useTranslation("media");

  if (!stores.length) {
    return <p className="text-sm text-muted-foreground py-4">{t("gameTabs.empty.offers")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          {t("gameTabs.allOffers")}
        </p>
        <div className="divide-y divide-border">
          {stores.map((store, i) => (
            <a
              key={i}
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-3 hover:text-primary transition-colors"
            >
              <span className="text-sm font-medium capitalize">{store.store.name}</span>
              <span className="text-xs text-muted-foreground">↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GameTabs({ data }: { data: RAWGGame }) {
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
          label: t("gameTabs.tabs.screenshots"),
          value: "screenshots",
          content: <ScreenshotsTab screenshots={data?.short_screenshots?.map((s) => s.image) ?? []} />,
        },
        {
          label: t("gameTabs.tabs.offers"),
          value: "offers",
          content: <StoresTab stores={data?.stores ?? []} />,
        },
      ]}
    />
  );
}