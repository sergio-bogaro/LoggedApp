import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/auth/hooks";

function WelcomePage() {
  const { t } = useTranslation("welcome");
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <div className="w-full flex justify-center items-center p-40">
      <div className="flex flex-col gap-2 w-1/2 bg-accent rounded p-4">
        <h2>{t("welcome.message")}</h2>
        <p>{t("welcome.intro")}</p>

        <LanguageSwitcher />
        <ThemeSwitcher />

        {isAuthenticated ? (
          <>
            <p className="text-sm text-muted-foreground">
              {t("authenticatedGreeting", { username: user?.username })}
            </p>
            <div className="flex gap-2">
              <Button asChild variant="default">
                <Link to="/media/home">{t("actions.goToApp")}</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <Button asChild variant="default">
              <Link to="/login">{t("actions.login")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">{t("actions.register")}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomePage;
