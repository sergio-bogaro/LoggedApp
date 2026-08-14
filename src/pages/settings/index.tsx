import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import RatingSwitcher from "@/components/RatingSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import MediaTrackToggles from "@/components/tw/settings/MediaTrackToggles";
import { authApi } from "@/querries/auth/auth";
import { useAppDispatch, useAppSelector } from "@/store/auth/hooks";
import { updateUserSettings } from "@/store/auth/slice";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaTypeEnum } from "@/types/media";
import { getTrackFlags } from "@/utils/mediaTrack";

function SettingsPage() {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(setBreadcrumbs([{ label: t("navigation.settings") }]));
  }, [dispatch, t]);

  const [values, setValues] = useState(() => getTrackFlags(user));
  const [savingType, setSavingType] = useState<MediaTypeEnum | null>(null);

  const handleChange = async (type: MediaTypeEnum, value: boolean) => {
    if (!user) return;

    const next = { ...values, [type]: value };
    setValues(next);
    setSavingType(type);

    try {
      const updated = await authApi.updateUser(user.id, {
        trackMovies: next[MediaTypeEnum.MOVIES],
        trackAnime: next[MediaTypeEnum.ANIME],
        trackManga: next[MediaTypeEnum.MANGA],
        trackGames: next[MediaTypeEnum.GAME],
        trackBooks: next[MediaTypeEnum.BOOK],
      });
      dispatch(updateUserSettings(updated));
    } catch (error) {
      setValues((prev) => ({ ...prev, [type]: !value }));
      toast.error(error instanceof Error ? error.message : t("errorLoading"));
    } finally {
      setSavingType(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">{t("settings.title")}</h1>

      <div className="space-y-2">
        <LanguageSwitcher />

        <ThemeSwitcher />

        <RatingSwitcher />
      </div>

      <div className="space-y-2">
        <div>
          <h2 className="text-lg font-semibold mb-1">{t("settings.tracking.title")}</h2>
          <p className="text-sm text-muted-foreground mb-2">{t("settings.tracking.description")}</p>
        </div>

        <MediaTrackToggles
          values={values}
          onChange={handleChange}
        />

        {savingType && ( <p className="text-xs text-muted-foreground">{t("settings.tracking.saving")} </p> )}
      </div>
    </div>
  )
}

export default SettingsPage;
