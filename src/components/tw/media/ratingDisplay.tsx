import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/settings/hooks";

interface RatingDisplayProps {
  rating: number;
  discrete?: boolean;
}

export const RatingDisplay = ({ rating, discrete }: RatingDisplayProps) => {
  const { t } = useTranslation("media");
  const { ratingMode } = useAppSelector((state) => state.ui);

  const ratingLabel = t("rating.value", { rating });

  if (ratingMode === "numeric") {
    return (
      <span className={cn("font-medium", discrete ? "text-step-1" : "text-step-2")} aria-label={ratingLabel}>
        {ratingLabel}
      </span>
    );
  }

  const stars = ratingMode === "stars5" ? 5 : 10;
  const displayValue = ratingMode === "stars5" ? rating / 2 : rating;

  const sizeClass = discrete ? "h-3 w-3" : "h-4 w-4";
  const emptyStarColor = discrete ? "currentColor" : "var(--muted-foreground)";

  return (
    <div
      role="img"
      aria-label={ratingLabel}
      className={cn("flex items-center", discrete ? "gap-px" : "gap-0.5")}
    >
      {Array.from({ length: stars }, (_, i) => {
        const starIndex = i + 1;
        const fillType = displayValue >= starIndex ? "full" : displayValue >= starIndex - 0.5 ? "half" : "empty";

        return (
          <div key={i} className={cn("relative", sizeClass)} aria-hidden="true">
            <Star
              className={cn("absolute top-0 left-0", sizeClass, discrete && "opacity-25")}
              fill="transparent"
              style={{ color: emptyStarColor }}
            />
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{
                width: fillType === "full" ? "100%" : fillType === "half" ? "50%" : "0%",
              }}
            >
              <Star
                className={cn(sizeClass, "text-amber-400")}
                fill="currentColor"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
