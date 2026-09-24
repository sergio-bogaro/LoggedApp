import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

function NotFoundPage() {
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-step-6 font-semibold text-muted-foreground">404</p>

      <h1 className="text-step-3 font-medium">{t("notFound.title")}</h1>

      <p className="max-w-md text-step-0 text-muted-foreground">
        {t("notFound.description")}
      </p>

      <Button asChild>
        <Link to="/">{t("notFound.backHome")}</Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
