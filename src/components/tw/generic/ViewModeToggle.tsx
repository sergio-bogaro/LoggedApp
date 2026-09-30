import { Grid, List } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/store/settings/slice";

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  className?: string;
}

/*
 * The one list/grid switch in the app. It is presentational — callers own the
 * state, so search and the library can keep separate remembered modes. The two
 * icons cross-fade in place so the button reads as one control that flips.
 */
export const ViewModeToggle = ({ value, onChange, className }: ViewModeToggleProps) => {
  const { t } = useTranslation("media");
  const isGrid = value === "grid";

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => onChange(isGrid ? "list" : "grid")}
      aria-label={isGrid ? t("viewToggle.list") : t("viewToggle.grid")}
      className={cn(
        "shrink-0 bg-background hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:bg-background dark:hover:bg-primary/15",
        className
      )}
    >
      <Grid
        aria-hidden="true"
        className={cn(
          "h-[1.2rem] w-[1.2rem] -rotate-90 scale-0 transition-all",
          isGrid && "rotate-0 scale-100"
        )}
      />
      <List
        aria-hidden="true"
        className={cn(
          "absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-0 transition-all",
          !isGrid && "scale-100"
        )}
      />
    </Button>
  );
};
