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
  const label = isGrid ? t("viewToggle.list") : t("viewToggle.grid");

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => onChange(isGrid ? "list" : "grid")}
      aria-label={label}
      tooltip={label}
      className={cn("relative shrink-0 bg-background dark:bg-background", className)}
    >
      <Grid
        aria-hidden="true"
        className={cn(
          "size-[1.1rem] -rotate-90 scale-0 transition-all duration-200",
          isGrid && "rotate-0 scale-100"
        )}
      />
      <List
        aria-hidden="true"
        className={cn(
          "absolute size-[1.1rem] rotate-0 scale-0 transition-all duration-200",
          !isGrid && "scale-100"
        )}
      />
    </Button>
  );
};
