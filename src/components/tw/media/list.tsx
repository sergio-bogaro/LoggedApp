import { useTranslation } from "react-i18next";
import { Link } from "react-router"

import { TypeMark } from "@/components/tw/generic/badges";
import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { PosterFallback } from "@/components/tw/generic/PosterFallback";
import { MediaOptionsButton } from "@/components/tw/media/mediaOptions";
import { mediaImageUrl } from "@/querries/media/logged";
import { MediaResponse } from "@/types/logged";
import { MediaItem } from "@/types/media";

interface ListItemProps {
  item: MediaItem;
  existingItem?: MediaResponse
}

const ListItem = ({ item, existingItem }: ListItemProps) => {
  const { t } = useTranslation("media");

  return (
    <div className="relative group">
      <span className="absolute top-2 right-2 z-10">
        <MediaOptionsButton mediaItem={item} existingItem={existingItem} />
      </span>

      <Link
        key={item.id}
        to={`/media/${item.type}/details/${item.id}`}
        className="flex gap-4 rounded-lg border border-border p-3 pr-12 transition-[background-color,border-color] duration-200 hover:border-foreground/20 hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ImageWithSkeleton
          src={existingItem?.imagePath ? (mediaImageUrl(existingItem.imagePath) ?? "") : item.coverUrl}
          alt=""
          className="aspect-2/3 w-20 shrink-0 self-start rounded-control ring-1 ring-border/70 sm:w-24"
          fallback={<PosterFallback title={item.title} type={item.type} compact />}
        />

        <div className="flex w-full min-w-0 flex-col gap-3 py-1">
          <div>
            <h3 className="text-step-2 font-medium">
              {item.title}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <TypeMark type={item.type} />
              <span className="text-step-0 tabular-nums text-muted-foreground">{item.year ?? "-"}</span>
            </div>

            <p className="mt-2 line-clamp-2 text-step-1 text-muted-foreground">
              {item.description
                ? item.description.length > 300
                  ? item.description.slice(0, 250) + " ..."
                  : item.description
                : t("list.noDescription")}
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ListItem;
