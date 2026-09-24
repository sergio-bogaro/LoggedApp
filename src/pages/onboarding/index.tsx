import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import RatingSwitcher from "@/components/RatingSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { EntryCard } from "@/components/tw/generic/EntryCard";
import MediaTrackToggles from "@/components/tw/settings/MediaTrackToggles";
import { Button } from "@/components/ui/button";
import { authApi } from "@/querries/auth/auth";
import { useAppDispatch, useAppSelector } from "@/store/auth/hooks";
import { setUser } from "@/store/auth/slice";
import type { User } from "@/types/auth";
import { MediaTypeEnum } from "@/types/media";
import { getTrackFlags, trackFlagByType } from "@/utils/mediaTrack";

function OnboardingPage() {
  const { t } = useTranslation(["common", "onboarding"]);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [values, setValues] = useState(() => getTrackFlags(user));
  const [isSaving, setIsSaving] = useState(false);

  const features = t("features", { ns: "onboarding", returnObjects: true }) as string[];
  const featureList = Array.isArray(features) ? features : [];

  const handleFinish = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      const payload = {} as Partial<User>;
      for (const type of Object.values(MediaTypeEnum)) {
        payload[trackFlagByType[type]] = values[type];
      }

      const updated = await authApi.updateUser(user.id, payload);
      dispatch(setUser(updated));

      toast.success(t("saved", { ns: "onboarding" }));
      navigate("/media/home");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errorLoading", { ns: "common" }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EntryCard
      title={t("title", { ns: "onboarding", appName: t("branding.sidebarName", { ns: "common" }) })}
      subtitle={t("subtitle", { ns: "onboarding" })}
      icon={
        <div className="flex size-10 items-center justify-center rounded-control bg-primary text-primary-foreground">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
      }
    >
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={step}
        aria-label={t("progressLabel", { ns: "onboarding" })}
        className="flex gap-2"
      >
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`h-1.5 w-8 rounded-full ${item <= step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>

      {step === 1 ? (
        <div className="space-y-3">
          <h2 className="text-step-2 font-medium">{t("step1Title", { ns: "onboarding" })}</h2>
          <ul className="space-y-2">
            {featureList.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-step-1 text-muted-foreground">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ) : step === 2 ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-step-2 font-medium">{t("step2Title", { ns: "onboarding" })}</h2>
            <p className="mt-1 text-step-1 text-muted-foreground">
              {t("step2Description", { ns: "onboarding" })}
            </p>
          </div>

          <div className="space-y-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <RatingSwitcher />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-step-2 font-medium">{t("step3Title", { ns: "onboarding" })}</h2>
            <p className="mt-1 text-step-1 text-muted-foreground">
              {t("step3Description", { ns: "onboarding" })}
            </p>
          </div>

          <MediaTrackToggles values={values} onChange={(type, value) => setValues((prev) => ({ ...prev, [type]: value }))} />
        </div>
      )}

      <div className="flex justify-between gap-2">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={() => setStep((prev) => prev - 1)} disabled={isSaving}>
            {t("back", { ns: "onboarding" })}
          </Button>
        )}
        {step < 3 ? (
          <Button type="button" className="ml-auto" onClick={() => setStep((prev) => prev + 1)}>
            {t("next", { ns: "onboarding" })}
          </Button>
        ) : (
          <Button type="button" className="ml-auto" onClick={handleFinish} disabled={isSaving}>
            {t("finish", { ns: "onboarding" })}
          </Button>
        )}
      </div>
    </EntryCard>
  );
}

export default OnboardingPage;
