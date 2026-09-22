import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { useAppSelector } from "@/store/settings/hooks";

function Breadcrumbs() {
  const { t } = useTranslation("common");
  const { breadcrumbs } = useAppSelector((state) => state.ui);
  const lastIndex = breadcrumbs.length - 1;

  return (
    <nav aria-label={t("a11y.breadcrumb")} className="min-w-0">
      <ol className="flex items-center gap-0.5 text-xs text-muted-foreground flex-nowrap overflow-hidden">
        {breadcrumbs.map((crumb, index) => {
          const isCurrent = index === lastIndex;

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
              <li className="flex items-center min-w-0">
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    aria-current={isCurrent ? "page" : undefined}
                    className="transition-colors hover:text-foreground whitespace-nowrap truncate"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isCurrent ? "page" : undefined}
                    className="text-foreground font-semibold whitespace-nowrap truncate"
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
