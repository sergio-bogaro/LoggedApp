import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { BrandMark } from "@/components/tw/generic/BrandMark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The 404 is full screen as a route, but sits inside the app shell on a
 *  missing collection. */
function NotFoundPage({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslation("common");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 bg-background p-6 text-center",
        embedded ? "min-h-[60vh]" : "min-h-svh"
      )}
    >
      {!embedded && <BrandMark size="md" />}

      <p className="font-serif text-[clamp(5rem,16vw,9rem)] leading-none tracking-[-0.06em] text-muted-foreground/35">
        404
      </p>

      <div className="space-y-2">
        <h1 className="font-serif text-step-5 font-medium tracking-[-0.02em]">
          {t("notFound.title")}
        </h1>

        <p className="max-w-md text-step-1 text-muted-foreground">
          {t("notFound.description")}
        </p>
      </div>

      <Button asChild>
        <Link to="/">{t("notFound.backHome")}</Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
