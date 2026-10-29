import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { StatusMark, TypeMark } from "../generic/badges";

import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { PosterFallback } from "@/components/tw/generic/PosterFallback";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mediaImageUrl } from "@/querries/media/logged";
import { MediaStatusEnum, MediaTypeEnum } from "@/types/media";
import { formatShortDay } from "@/utils/date";

export interface RegisterRowMedia {
  externalId: string;
  title: string;
  type: MediaTypeEnum;
  imagePath?: string | null;
  coverUrl?: string | null;
}

interface RegisterRowProps {
  media: RegisterRowMedia | null;
  status?: MediaStatusEnum | null;
  /** ISO date — the day the entry belongs to. */
  date?: string | null;
  rating?: number | null;
  onOpenDetails?: () => void;
}

/*
 * One entry in a register — shared by the home log stream and the collection
 * lists. Columns are aligned and numerals are tabular so a column of dates and
 * ratings can be scanned vertically, which is what a register is for.
 */
export const RegisterRow = ({ media, status, date, rating, onOpenDetails }: RegisterRowProps) => {
  const { i18n, t } = useTranslation("media");

  const cover = media?.imagePath
    ? (mediaImageUrl(media.imagePath) ?? media.coverUrl)
    : media?.coverUrl;
  const hasRating = typeof rating === "number" && rating > 0;

  const rowClassName = cn(
    "grid items-center gap-x-4 gap-y-2 py-3 pl-2 pr-12",
    "grid-cols-[56px_minmax(0,1fr)]",
    "md:grid-cols-[56px_minmax(0,1fr)_150px_110px_72px] md:gap-y-0"
  );

  const content = (
    <>
      {/* Poster as an identity seal, not a hero image. */}
      <div className="row-span-2 w-14 md:row-span-1">
        <ImageWithSkeleton
          src={cover ?? undefined}
          alt=""
          className="aspect-2/3 w-full rounded-control ring-1 ring-border/70"
          fallback={<PosterFallback title={media?.title ?? ""} type={media?.type} compact />}
        />
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-step-2 font-medium">{media?.title ?? "—"}</h3>
        {media && (
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <TypeMark
              type={media.type}
              className="group-hover:[&>span:first-child]:w-7"
            />
          </div>
        )}
      </div>

      {/* A flex row on mobile; transparent to the grid from md up. */}
      <div className="col-start-2 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1 md:contents">
        <div className="md:col-start-3 md:row-start-1">
          {status ? (
            <StatusMark status={status} />
          ) : (
            <span className="text-step-1 text-muted-foreground">—</span>
          )}
        </div>

        <div className="text-step-1 tabular-nums text-muted-foreground md:col-start-4 md:row-start-1">
          {date ? formatShortDay(date, i18n.language) : "—"}
        </div>

        <div className="font-serif text-step-3 tabular-nums md:col-start-5 md:row-start-1 md:text-right">
          {hasRating ? rating!.toFixed(1) : "—"}
        </div>
      </div>
    </>
  );

  return (
    <div className={cn("group relative rounded-control", media && "transition-colors hover:bg-accent/45")}>
      {media ? (
        <Link
          to={`/media/${media.type}/details/${media.externalId}`}
          className={cn(
            rowClassName,
            "rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
          )}
        >
          {content}
        </Link>
      ) : (
        <div className={rowClassName}>{content}</div>
      )}

      {onOpenDetails && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onOpenDetails}
          aria-label={t("record.viewLogDetails")}
          tooltip={t("record.viewLogDetails")}
          className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100 max-md:opacity-100"
        >
          <Info aria-hidden="true" />
        </Button>
      )}
    </div>
  );
};
