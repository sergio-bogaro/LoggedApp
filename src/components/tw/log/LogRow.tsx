import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { StatusMark, TypeMark } from "../generic/badges";

import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { cn } from "@/lib/utils";
import { mediaImageUrl } from "@/querries/media/logged";
import type { MediaLogWithMedia } from "@/querries/media/logged";
import { formatShortDay } from "@/utils/date";
import { formatProgress } from "@/utils/mediaText";

interface LogRowProps {
  log: MediaLogWithMedia;
}

/*
 * One dated entry in the register. Columns are aligned and numerals are
 * tabular so a column of dates and ratings can be scanned vertically — the
 * thing a register is for.
 */
export const LogRow = ({ log }: LogRowProps) => {
  const { i18n } = useTranslation("media");
  const media = log.media;

  const day = formatShortDay(log.date, i18n.language);
  const cover = media?.imagePath
    ? (mediaImageUrl(media.imagePath) ?? media.coverUrl)
    : media?.coverUrl;
  const hasRating = typeof log.rating === "number" && log.rating > 0;
  const progressLabel = formatProgress(log.progress, log.progressTotal);

  const rowClassName = cn(
    "group grid items-center gap-x-4 gap-y-2 rounded-control px-3 py-3",
    "grid-cols-[48px_minmax(0,1fr)]",
    "md:grid-cols-[48px_minmax(0,1fr)_150px_110px_72px] md:gap-y-0",
    media && "transition-colors hover:bg-accent/50"
  );

  const content = (
    <>
      {/* Poster as an identity seal, not a hero image. */}
      <div className="row-span-2 w-12 md:row-span-1">
        <ImageWithSkeleton
          src={cover ?? undefined}
          alt=""
          className="aspect-2/3 w-full rounded-control"
        />
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-step-2 font-medium">{media?.title ?? "—"}</h3>
        {media && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <TypeMark type={media.type} />
            {progressLabel && (
              <span className="text-step-0 tabular-nums text-muted-foreground">{progressLabel}</span>
            )}
          </div>
        )}
      </div>

      {/* A flex row on mobile; transparent to the grid from md up. */}
      <div className="col-start-2 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1 md:contents">
        <div className="md:col-start-3 md:row-start-1">
          {log.status ? (
            <StatusMark status={log.status} />
          ) : (
            <span className="text-step-1 text-muted-foreground">—</span>
          )}
        </div>

        <div className="text-step-1 tabular-nums text-muted-foreground md:col-start-4 md:row-start-1">
          {day}
        </div>

        <div className="text-step-2 tabular-nums md:col-start-5 md:row-start-1 md:text-right">
          {hasRating ? log.rating!.toFixed(1) : "—"}
        </div>
      </div>
    </>
  );

  if (!media) {
    return <div className={rowClassName}>{content}</div>;
  }

  return (
    <Link to={`/media/${media.type}/details/${media.externalId}`} className={rowClassName}>
      {content}
    </Link>
  );
};
