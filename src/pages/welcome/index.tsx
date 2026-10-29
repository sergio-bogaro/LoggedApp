import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { TypeMark } from "@/components/tw/generic/badges";
import { BrandMark } from "@/components/tw/generic/BrandMark";
import { Card } from "@/components/tw/generic/card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaTypeEnum } from "@/types/media";

const mediaTypes = [
  MediaTypeEnum.MOVIES,
  MediaTypeEnum.SERIES,
  MediaTypeEnum.ANIME,
  MediaTypeEnum.MANGA,
  MediaTypeEnum.BOOK,
  MediaTypeEnum.GAME,
  MediaTypeEnum.MUSIC,
];

function WelcomePage() {
  const { t } = useTranslation("welcome");
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto grid min-h-svh w-full max-w-[1180px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <section className="max-w-xl space-y-8">
          <BrandMark size="lg" />

          <div className="space-y-4">
            <h1 className="max-w-[13ch] text-balance font-serif text-step-6 font-medium leading-[1.02] tracking-[-0.03em] sm:text-step-7 lg:text-[3.25rem]">
              {t("message")}
            </h1>

            <p className="max-w-[46ch] text-step-2 leading-relaxed text-muted-foreground">
              {t("intro")}
            </p>
          </div>

          <ul className="flex max-w-lg flex-wrap gap-x-5 gap-y-2.5 border-t border-border pt-5 lg:grid lg:grid-cols-4">
            {mediaTypes.map((type) => (
              <li key={type}>
                <TypeMark type={type} />
              </li>
            ))}
          </ul>
        </section>

        <Card className="w-full max-w-md justify-self-start gap-6 p-6 sm:p-8 lg:justify-self-end">
          <div className="space-y-1">
            <h2 className="font-serif text-step-4 font-medium">{t("access.title")}</h2>
            <p className="text-step-1 text-muted-foreground">
              {isAuthenticated ? t("access.descriptionAuthenticated") : t("access.description")}
            </p>
          </div>

          {isAuthenticated ? (
            <div className="space-y-3">
              <p className="text-step-1 text-muted-foreground">
                {t("authenticatedGreeting", { username: user?.username })}
              </p>

              <Button asChild className="w-full">
                <Link to="/media/home">{t("actions.goToApp")}</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="w-full sm:flex-1">
                <Link to="/login">{t("actions.login")}</Link>
              </Button>

              <Button asChild variant="outline" className="w-full sm:flex-1">
                <Link to="/register">{t("actions.register")}</Link>
              </Button>
            </div>
          )}

          <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default WelcomePage;
