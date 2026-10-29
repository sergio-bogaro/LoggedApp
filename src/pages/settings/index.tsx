import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import RatingSwitcher from "@/components/RatingSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import IntegrationKeysForm from "@/components/tw/settings/IntegrationKeysForm";
import MediaTrackToggles from "@/components/tw/settings/MediaTrackToggles";
import { Button } from "@/components/ui/button";
import { authApi } from "@/querries/auth/auth";
import { useAppDispatch, useAppSelector } from "@/store/auth/hooks";
import { updateUserSettings } from "@/store/auth/slice";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaTypeEnum } from "@/types/media";
import { getTrackFlags } from "@/utils/mediaTrack";

const SettingsSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="grid gap-5 border-t border-border pt-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
    <div className="space-y-1.5">
      <h2 className="font-serif text-step-4 font-medium">{title}</h2>
      {description && (
        <p className="max-w-[30ch] text-step-1 text-muted-foreground">{description}</p>
      )}
    </div>

    <div>{children}</div>
  </section>
);

function SettingsPage() {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: t("label", { ns: "media" }), to: "/media/home" },
        { label: t("navigation.settings") },
      ])
    );
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
        trackMusic: next[MediaTypeEnum.MUSIC],
        trackSeries: next[MediaTypeEnum.SERIES],
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
    <div className="w-full max-w-[1040px]">
      <PageHeader title={t("settings.title")} description={t("settings.description")} />

      <div className="mt-8 space-y-10">
        <SettingsSection title={t("settings.appearance.title")}>
          <div className="grid gap-4 sm:grid-cols-3">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <RatingSwitcher />
          </div>
        </SettingsSection>

        <SettingsSection
          title={t("settings.tracking.title")}
          description={t("settings.tracking.description")}
        >
          <MediaTrackToggles values={values} onChange={handleChange} />

          {savingType && (
            <p className="mt-3 text-step-1 text-muted-foreground">{t("settings.tracking.saving")}</p>
          )}
        </SettingsSection>

        <SettingsSection
          title={t("settings.integrations.title")}
          description={t("settings.integrations.description")}
        >
          <IntegrationKeysForm />
        </SettingsSection>

        <SettingsSection
          title={t("settings.title", { ns: "import" })}
          description={t("settings.description", { ns: "import" })}
        >
          <Button asChild>
            <Link to="/import">{t("settings.open", { ns: "import" })}</Link>
          </Button>
        </SettingsSection>
      </div>
    </div>
  );
}

export default SettingsPage;
