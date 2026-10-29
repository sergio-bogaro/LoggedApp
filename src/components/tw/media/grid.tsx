import { Link } from "react-router";

import { TypeMark } from "../generic/badges";

import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { PosterFallback } from "@/components/tw/generic/PosterFallback";
import { MediaOptionsButton } from "@/components/tw/media/mediaOptions";
import { mediaImageUrl } from "@/querries/media/logged";
import { MediaResponse } from "@/types/logged";
import { MediaItem } from "@/types/media";

interface GridItemProps {
  item: MediaItem;
  existingItem?: MediaResponse
  showMediaType?: boolean;
}

export const GridItem = ({ item, existingItem, showMediaType = false }: GridItemProps) => {
  return (
    <div className="relative group">
      <span className="absolute top-2 right-2 z-10">
        <MediaOptionsButton mediaItem={item} existingItem={existingItem} />
      </span>

      <Link
        key={item.id}
        to={`/media/${item.type}/details/${item.id}`}
        className="relative block overflow-hidden rounded-md bg-muted ring-1 ring-border/80 transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:ring-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ImageWithSkeleton
          src={existingItem?.imagePath ? (mediaImageUrl(existingItem.imagePath) ?? "") : item.coverUrl}
          alt=""
          className="aspect-2/3 w-full"
          imgClassName="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
          fallback={<PosterFallback title={item.title} type={item.type} />}
        />

        <div className="absolute top-2 left-2">
          {showMediaType && <TypeMark type={item.type} tone="overlay" />}
        </div>

        <div className="absolute bottom-0 left-0 right-0 rounded-b-md bg-linear-to-t from-black/85 via-black/35 to-transparent p-3 pt-10">
          <div className="flex flex-col-reverse min-w-0">
            <p className="text-step-0 tabular-nums text-white/65">{item.year ?? "-"}</p>

            <h3 className="line-clamp-2 text-step-1 font-medium text-white">
              {item.title}
            </h3>
          </div>
        </div>
      </Link>
    </div>
  );
};
