import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { Link } from "react-router";

import { useAppSelector } from "@/store/settings/hooks";

function Breadcrumbs() {
  const { breadcrumbs } = useAppSelector((state) => state.ui);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-0.5 text-xs text-muted-foreground flex-wrap">
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={`${crumb.label}-${index}`}>
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
            <li className="flex items-center min-w-0">
              {crumb.to ? (
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
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
