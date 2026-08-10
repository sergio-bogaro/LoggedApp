import { Book, BookOpen, Film, Gamepad2, Tv } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Switch } from "@/components/ui/switch";
import { useMediaSourceAvailability } from "@/hooks/useMediaSourceAvailability";
import { cn } from "@/lib/utils";
import { MediaTypeEnum } from "@/types/media";
import type { MediaTrackValues } from "@/utils/mediaTrack";

type MediaTrackTogglesProps = {
  values: MediaTrackValues;
  onChange: (type: MediaTypeEnum, value: boolean) => void;
};

const trackableMediaTypes: Array<{ type: MediaTypeEnum; icon: typeof Film }> = [
  { type: MediaTypeEnum.MOVIES, icon: Film },
  { type: MediaTypeEnum.ANIME, icon: Tv },
  { type: MediaTypeEnum.MANGA, icon: BookOpen },
  { type: MediaTypeEnum.BOOK, icon: Book },
  { type: MediaTypeEnum.GAME, icon: Gamepad2 },
];

const requiredEnvKeys: Partial<Record<MediaTypeEnum, string>> = {
  [MediaTypeEnum.MOVIES]: "VITE_TMDB_API_KEY",
  [MediaTypeEnum.GAME]: "IGDB_CLIENT_ID / IGDB_CLIENT_SECRET",
};

function MediaTrackToggles({ values, onChange }: MediaTrackTogglesProps) {
  const { t } = useTranslation(["common", "media"]);
  const { availability } = useMediaSourceAvailability();

  return (
    <div className="space-y-2">
      {trackableMediaTypes.map(({ type, icon: Icon }) => {
        const available = availability[type];
        const requiredKey = requiredEnvKeys[type];

        return (
          <div
            key={type}
            onClick={() => available && onChange(type, !values[type])}
            className={cn(
              "flex items-center justify-between gap-3 rounded-md border px-3 py-2",
              available ? "cursor-pointer" : "cursor-not-allowed opacity-60"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-medium text-sm">
                  {t(`typePlural.${type}`, { ns: "media" })}
                </p>

                {!available && requiredKey && (
                  <p className="text-xs text-muted-foreground">
                    {t("settings.tracking.disabledHint", {
                      ns: "common",
                      key: requiredKey,
                    })}
                  </p>
                )}
              </div>
            </div>

            <Switch
              checked={values[type]}
              onCheckedChange={(checked) => onChange(type, checked)}
              disabled={!available}
              aria-label={t(`typePlural.${type}`, { ns: "media" })}
            />
          </div>
        );
      })}
    </div>
  );
}

export default MediaTrackToggles;
