import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StarsRow } from "@/components/ui/stars";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/settings/hooks";

interface RatingDisplayProps {
  rating: number;
  discrete?: boolean;
  /** In stars mode, show the value with a single star instead of the full row. */
  singleStar?: boolean;
  /** "overlay" sits on artwork: monochrome white, for a dark scrim. */
  tone?: "plain" | "overlay";
}

export const RatingDisplay = ({ rating, discrete, singleStar, tone = "plain" }: RatingDisplayProps) => {
  const { t } = useTranslation("media");
  const { ratingMode } = useAppSelector((state) => state.ui);

  const ratingLabel = t("rating.value", { rating });
  const isOverlay = tone === "overlay";

  if (ratingMode === "numeric") {
    return (
      <span
        className={cn(
          "font-medium",
          discrete ? "text-step-0" : "text-step-2",
          isOverlay && "text-step-1 text-white"
        )}
        aria-label={ratingLabel}
      >
        {ratingLabel}
      </span>
    );
  }

  if (singleStar) {
    const value = rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1);

    return (
      <span
        className={cn("inline-flex items-center gap-1 tabular-nums", isOverlay && "text-white")}
        aria-label={ratingLabel}
      >
        {value}
        <Star className={cn("size-4", isOverlay ? "text-white" : "text-rating")} fill="currentColor" aria-hidden="true" />
      </span>
    );
  }

  const stars = ratingMode === "stars5" ? 5 : 10;
  const displayValue = ratingMode === "stars5" ? rating / 2 : rating;

  return (
    <StarsRow
      role="img"
      aria-label={ratingLabel}
      value={displayValue}
      max={stars}
      size={discrete ? "size-3" : "size-4"}
      dimEmpty={discrete}
      className={discrete ? "gap-px" : undefined}
    />
  );
};
