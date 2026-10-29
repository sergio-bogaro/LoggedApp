import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import { MediaTypeEnum } from "@/types/media";

const typeAccent: Record<MediaTypeEnum, string> = {
  [MediaTypeEnum.MOVIES]: "--type-film",
  [MediaTypeEnum.ANIME]: "--type-anime",
  [MediaTypeEnum.SERIES]: "--type-series",
  [MediaTypeEnum.MANGA]: "--type-manga",
  [MediaTypeEnum.GAME]: "--type-game",
  [MediaTypeEnum.BOOK]: "--type-book",
  [MediaTypeEnum.MUSIC]: "--type-music",
};

const initialsFor = (title: string) => {
  const words = title
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return words.map((word) => word[0]).join("").toUpperCase() || "L";
};

interface PosterFallbackProps {
  title: string;
  type?: MediaTypeEnum;
  /** The 56px register seal only has room for initials. */
  compact?: boolean;
  /** A hero poster can carry a larger monogram. */
  large?: boolean;
  className?: string;
}

/*
 * A missing cover is still part of the collection. Instead of the browser's
 * broken-image icon, the title becomes a small book jacket: paper stock, the
 * media type's rule and the title's initials. It is honest placeholder
 * artwork, not a fake screenshot.
 */
export const PosterFallback = ({ title, type, compact = false, large = false, className }: PosterFallbackProps) => {
  const accent = type ? typeAccent[type] : undefined;

  return (
    <div
      aria-hidden="true"
      style={accent ? ({ "--poster-accent": `var(${accent})` } as CSSProperties) : undefined}
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-secondary text-secondary-foreground",
        className
      )}
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: accent ? "var(--poster-accent)" : "var(--muted-foreground)" }}
      />

      <span
        className={cn(
          "font-serif font-medium leading-none tracking-[-0.03em] text-foreground/75",
          compact ? "text-step-2" : large ? "text-step-8" : "text-step-6"
        )}
      >
        {initialsFor(title)}
      </span>
    </div>
  );
};
