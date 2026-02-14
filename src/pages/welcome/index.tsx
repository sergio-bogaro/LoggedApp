import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";

function WelcomePage() {
  const { t } = useTranslation("welcome");

  return (
    <div className="w-full flex justify-center items-center p-40">
      <div className="flex flex-col gap-2 w-1/2 bg-accent rounded p-4">
        <h2>{t("welcome.message")}</h2>
        <p>{t("welcome.intro")}</p>

        <LanguageSwitcher />
        <ThemeSwitcher />

        <Button asChild>
          <Link to="/logger/movies/search">
            Next
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default WelcomePage;