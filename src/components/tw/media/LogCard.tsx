import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { StatusMark, TypeMark } from "../generic/badges";

import { RatingDisplay } from "./ratingDisplay";

import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { PosterFallback } from "@/components/tw/generic/PosterFallback";
import { cn } from "@/lib/utils";
import { mediaImageUrl, MediaLogWithMedia } from "@/querries/media/logged";
import { formatShortDay } from "@/utils/date";

interface LogCardProps {
  log: MediaLogWithMedia;
  onOpenDetails: () => void;
}

/*
 * One entry in the home register, as a poster card. The card is the artwork:
 * title and the log's own values — status, day, rating — ride the same bottom
 * scrim as the grid cards, so the two card views in the app read as one. The
 * media link owns the card; the log dialog stays on its own button so both
 * destinations remain reachable.
 */
export const LogCard = ({ log, onOpenDetails }: LogCardProps) => {
  const { i18n, t } = useTranslation("media");

  const media = log.media;
  if (!media) return null;

  const cover = media.imagePath
    ? (mediaImageUrl(media.imagePath) ?? media.coverUrl)
    : media.coverUrl;
  const hasRating = typeof log.rating === "number" && log.rating > 0;

  return (
    <div className="relative group">
      <Link
        to={`/media/${media.type}/details/${media.externalId}`}
        className="relative block overflow-hidden rounded-md bg-muted ring-1 ring-border/80 transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:ring-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ImageWithSkeleton
          src={cover ?? undefined}
          alt=""
          className="aspect-2/3 w-full"
          imgClassName="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          fallback={<PosterFallback title={media.title} type={media.type} />}
        />

        <div className="absolute top-2 left-2">
          <TypeMark type={media.type} tone="overlay" />
        </div>

        <div className="absolute inset-x-0 bottom-0 rounded-b-md bg-linear-to-t from-black/85 via-black/35 to-transparent p-3 pt-10">
          <h3 className="line-clamp-2 text-step-1 font-medium text-white">{media.title}</h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-step-0 text-white/70">
            {log.status && <StatusMark status={log.status} tone="overlay" />}

            <span className="tabular-nums">{formatShortDay(log.date, i18n.language)}</span>

            {hasRating && <RatingDisplay rating={log.rating!} singleStar tone="overlay" />}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={onOpenDetails}
        aria-label={t("record.viewLogDetails")}
        className={cn(
          "absolute top-2 right-2 z-10 rounded-control bg-popover/80 p-1.5 text-foreground ring-1 ring-border/70 transition-opacity",
          "hover:bg-popover focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 max-md:opacity-100"
        )}
      >
        <Info className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
};
