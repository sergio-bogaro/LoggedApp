import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import RatingSwitcher from "@/components/RatingSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Card } from "@/components/tw/generic/card";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { SectionHeading } from "@/components/tw/generic/SectionHeading";
import IntegrationKeysForm from "@/components/tw/settings/IntegrationKeysForm";
import { LibrarySyncIntegrations } from "@/components/tw/settings/LibrarySyncIntegrations";
import MediaTrackToggles from "@/components/tw/settings/MediaTrackToggles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authApi } from "@/querries/auth/auth";
import { useAppDispatch, useAppSelector } from "@/store/auth/hooks";
import { updateUserSettings } from "@/store/auth/slice";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaTypeEnum } from "@/types/media";
import { getTrackFlags } from "@/utils/mediaTrack";

/*
 * The settings page is a stack of the same plane: one panel per subject, with
 * a shared hairline heading. Keeping the shell here (instead of a new global
 * component) makes the page's hierarchy explicit without changing the shared
 * Card/SectionHeading defaults used elsewhere.
 */
function SettingsPanel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-5 p-5 sm:p-6", className)}>
      <SectionHeading className="pb-2.5! text-[1.5rem]! leading-[1.25]!">
        {title}
      </SectionHeading>

      {description && (
        <p className="max-w-[68ch] text-step-2 text-muted-foreground">
          {description}
        </p>
      )}

      {children}
    </Card>
  );
}

function SettingsPage() {
  const { t } = useTranslation(["common", "librarySync", "import"]);
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
    <div className="grid w-full items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
      <PageHeader
        title={t("settings.title")}
        className="mb-0 md:col-span-2 xl:col-span-3 [&_h1]:text-[2rem] [&_h1]:leading-[1.1] [&_h1]:tracking-[-0.02em]"
      />

      <SettingsPanel title={t("settings.appearance.title")}>
        <div className="grid gap-4">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <RatingSwitcher />
        </div>
      </SettingsPanel>

      <SettingsPanel
        title={t("settings.tracking.title")}
        description={t("settings.tracking.description")}
      >
        <MediaTrackToggles values={values} onChange={handleChange} />

        {savingType && (
          <p className="text-step-1 text-muted-foreground">
            {t("settings.tracking.saving")}
          </p>
        )}
      </SettingsPanel>

      <SettingsPanel
        title={t("settings.integrations.title")}
        description={t("settings.integrations.description")}
        className="md:col-span-2 xl:col-span-1"
      >
        <IntegrationKeysForm />
      </SettingsPanel>

      <SettingsPanel
        title={t("title", { ns: "librarySync" })}
        description={t("description", { ns: "librarySync" })}
        className="md:col-span-2 xl:col-span-3"
      >
        <LibrarySyncIntegrations />
      </SettingsPanel>

      <SettingsPanel
        title={t("settings.title", { ns: "import" })}
        description={t("settings.description", { ns: "import" })}
        className="md:col-span-2 xl:col-span-3"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link to="/import">{t("settings.open", { ns: "import" })}</Link>
          </Button>
          <p className="text-step-0 text-muted-foreground">
            {t("supported", { ns: "import" })}
          </p>
        </div>
      </SettingsPanel>
    </div>
  );
}

export default SettingsPage;
