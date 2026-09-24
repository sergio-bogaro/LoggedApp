import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { EntryCard } from "@/components/tw/generic/EntryCard";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/auth/hooks";

function WelcomePage() {
  const { t } = useTranslation("welcome");
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <EntryCard title={t("message")} subtitle={t("intro")}>
      <div className="space-y-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
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
    </EntryCard>
  );
}

export default WelcomePage;
