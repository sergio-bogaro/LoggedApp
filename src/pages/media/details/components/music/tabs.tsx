import { useTranslation } from "react-i18next";

import { MusicDetailsView } from "./details";

import { AppTabs } from "@/components/tw/tabs";
import { MusicAlbumDetails } from "@/querries/externalMedia/music";

function formatDuration(ms?: number) {
  if (!ms) return "";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function MusicTabs({ data }: { data: MusicAlbumDetails }) {
  const { t } = useTranslation("media");
  const tracks = data.tracks ?? [];

  return (
    <AppTabs
      defaultValue="details"
      options={[
        {
          label: t("details.label"),
          value: "details",
          content: <MusicDetailsView data={data} />,
        },
        {
          label: t("musicTabs.tracks"),
          value: "tracks",
          content: tracks.length ? (
            <ol className="divide-y divide-border">
              {tracks.map((track) => (
                <li key={track.id} className="flex items-center justify-between gap-4 py-2">
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span className="w-6 shrink-0 text-step-0 tabular-nums text-muted-foreground">
                      {track.trackNumber ?? "—"}
                    </span>
                    <span className="truncate text-step-1">{track.title}</span>
                  </span>

                  <span className="shrink-0 text-step-0 tabular-nums text-muted-foreground">
                    {formatDuration(track.durationMs)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-4 text-step-1 text-muted-foreground">
              {t("musicTabs.empty.tracks")}
            </p>
          ),
        },
      ]}
    />
  );
}
