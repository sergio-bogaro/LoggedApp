import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { StatusMark, TypeMark } from "../generic/badges";

import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { cn } from "@/lib/utils";
import { mediaImageUrl } from "@/querries/media/logged";
import { MediaResponse } from "@/types/logged";
import { formatShortDay } from "@/utils/date";

interface LogRowProps {
  item: MediaResponse;
}

/*
 * One dated entry in the register. Columns are aligned and numerals are
 * tabular so a column of dates and ratings can be scanned vertically — the
 * thing a register is for.
 */
export const LogRow = ({ item }: LogRowProps) => {
  const { i18n, t } = useTranslation("media");

  const loggedOn = item.lastLogDate ?? item.createdAt;
  const day = formatShortDay(loggedOn, i18n.language);
  const cover = item.imagePath ? (mediaImageUrl(item.imagePath) ?? item.coverUrl) : item.coverUrl;
  const hasRating = typeof item.rating === "number" && item.rating > 0;

  return (
    <Link
      to={`/media/${item.type}/details/${item.externalId}`}
      className={cn(
        "group grid items-center gap-x-4 gap-y-2 rounded-control px-3 py-3",
        "grid-cols-[48px_minmax(0,1fr)]",
        "md:grid-cols-[48px_minmax(0,1fr)_150px_110px_72px] md:gap-y-0",
        "transition-colors hover:bg-accent/50"
      )}
    >
      {/* Poster as an identity seal, not a hero image. */}
      <div className="row-span-2 w-12 md:row-span-1">
        <ImageWithSkeleton
          src={cover}
          alt=""
          className="aspect-2/3 w-full rounded-control"
        />
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-step-2 font-medium">{item.title}</h3>
        <TypeMark type={item.type} className="mt-1" />
      </div>

      {/* A flex row on mobile; transparent to the grid from md up. */}
      <div className="col-start-2 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1 md:contents">
        <div className="md:col-start-3 md:row-start-1">
          {item.status ? (
            <StatusMark status={item.status} />
          ) : (
            <span className="text-step-1 text-muted-foreground">—</span>
          )}
        </div>

        <div className="text-step-1 tabular-nums text-muted-foreground md:col-start-4 md:row-start-1">
          {day}
          {item.logCount > 1 && (
            <span className="ml-2 opacity-70">{t("log.revisits", { count: item.logCount })}</span>
          )}
        </div>

        <div className="text-step-2 tabular-nums md:col-start-5 md:row-start-1 md:text-right">
          {hasRating ? item.rating!.toFixed(1) : "—"}
        </div>
      </div>
    </Link>
  );
};
