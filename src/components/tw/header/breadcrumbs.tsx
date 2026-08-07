import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import { MediaTypeEnum } from "@/types/media";

type Crumb = {
  label: string;
  to?: string;
};

function Breadcrumbs() {
  const { t } = useTranslation(["common", "media"]);
  const { pathname } = useLocation();

  const segments = pathname.split("/").filter(Boolean);

  let crumbs: Crumb[] = [];

  if (segments[0] === "settings") {
    crumbs = [{ label: t("navigation.settings", { ns: "common" }) }];
  } else if (segments[0] === "search") {
    crumbs = [{ label: t("navigation.search", { ns: "common" }) }];
  } else if (segments[0] === "media") {
    switch (segments[1]) {
      case "home":
        crumbs = [{ label: t("navigation.home", { ns: "common" }) }];
        break;
      case "favorites":
        crumbs = [{ label: t("navigation.favorites", { ns: "common" }) }];
        break;
      case "backlog":
        crumbs = [{ label: t("navigation.backlog", { ns: "common" }) }];
        break;
      case "list": {
        const listType = segments[2] as MediaTypeEnum;
        const mediaCrumb = { label: t("label", { ns: "media" }), to: "/media/list" };
        crumbs = listType
          ? [mediaCrumb, { label: t(`typePlural.${listType}`, { ns: "media" }) }]
          : [mediaCrumb];
        break;
      }
      case "logs": {
        const logsType = segments[2] as MediaTypeEnum;
        const logsCrumb = { label: t("logs.title", { ns: "media" }), to: "/media/logs" };
        crumbs = logsType
          ? [logsCrumb, { label: t(`typePlural.${logsType}`, { ns: "media" }) }]
          : [logsCrumb];
        break;
      }
      default: {
        const detailType = segments[1] as MediaTypeEnum;
        const detailId = segments[3];
        if (detailType && detailId) {
          crumbs = [
            {
              label: t(`typePlural.${detailType}`, { ns: "media" }),
              to: `/media/list/${detailType}`,
            },
            { label: t("details.label", { ns: "media" }) },
          ];
        }
        break;
      }
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-0.5 text-xs text-muted-foreground flex-wrap">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
              <li className="flex items-center min-w-0">
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className="transition-colors hover:text-foreground whitespace-nowrap"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-semibold whitespace-nowrap truncate">
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
