import { Star } from "lucide-react";

import { useAppSelector } from "@/store/settings/hooks";

export const RatingDisplay = ({ rating }: { rating: number }) => {
  const { ratingMode } = useAppSelector((state) => state.ui);

  if (ratingMode === "numeric") {
    return <span className="text-sm font-medium">{rating}/10</span>;
  }

  const stars = ratingMode === "stars5" ? 5 : 10;
  const displayValue = ratingMode === "stars5" ? rating / 2 : rating;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: stars }, (_, i) => {
        const starIndex = i + 1;
        const fillType = displayValue >= starIndex ? "full" : displayValue >= starIndex - 0.5 ? "half" : "empty";

        return (
          <div key={i} className="relative h-4 w-4">
            <Star
              className="absolute top-0 left-0 h-4 w-4"
              fill="transparent"
              style={{ color: "var(--muted-foreground)" }}
            />
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{
                width: fillType === "full" ? "100%" : fillType === "half" ? "50%" : "0%",
              }}
            >
              <Star
                className="h-4 w-4"
                fill="currentColor"
                style={{ color: "#facc15" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
