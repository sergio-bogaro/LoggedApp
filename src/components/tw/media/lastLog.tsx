import { Star } from "lucide-react";

import { StatusBadge } from "../generic/badges";
import { Card } from "../generic/card";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAppSelector } from "@/store/settings/hooks";
import { MediaLogResponse } from "@/types/logged";

const StarDisplay = ({ rating }: { rating: number }) => {
  const { ratingMode } = useAppSelector((state) => state.ui);

  if (ratingMode === "numeric") {
    return <span className="text-sm font-medium">{rating}/10</span>;
  }

  const stars = ratingMode === "stars5" ? 5 : 10;
  const displayValue = ratingMode === "stars5" ? rating / 2 : rating;

  return (
    <div className="flex items-center justify-center gap-0.5">
      {Array.from({ length: stars }, (_, i) => {
        const starIndex = i + 1;
        const fillType =
          displayValue >= starIndex
            ? "full"
            : displayValue >= starIndex - 0.5
              ? "half"
              : "empty";

        return (
          <div key={i} className="relative w-4 h-4">
            <Star
              className="w-4 h-4 absolute top-0 left-0"
              fill="transparent"
              style={{ color: "var(--muted-foreground)" }}
            />
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{
                width: fillType === "full" ? "100%" : fillType === "half" ? "50%" : "0%",
              }}
            >
              <Star className="w-4 h-4" fill="currentColor" style={{ color: "#facc15" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const LastLog = ({ lastLog }: { lastLog?: MediaLogResponse }) => {
  if (!lastLog) return null;

  return (
    <div className="mt-4 w-full flex flex-col gap-2">
      <StatusBadge status={lastLog.status} />

      <Card className="gap-0">
        <span>
          {new Date(lastLog.date).toLocaleDateString()}
        </span>

        {lastLog.rating && lastLog.rating > 0 && (
          <StarDisplay rating={lastLog.rating} />
        )}


        {lastLog.review && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="review">
              <AccordionTrigger>Ver review</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {lastLog.review}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </Card>
    </div >
  )
}