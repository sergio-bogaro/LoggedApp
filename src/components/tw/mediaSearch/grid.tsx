import { Link } from "react-router";

import { ImageWithSkeleton } from "../imageSkeleton";
import MediaOptionsButton from "../mediaOptions";

import { MediaResponse } from "@/lib/querry/logged";
import { MediaItem } from "@/types/mediaItem";

interface GridItemProps {
  item: MediaItem;
  existingItem?: MediaResponse
}

export const GridItem = ({ item, existingItem }: GridItemProps) => {

  return (
    <div className="relative group rounded">
      <span className="absolute top-2 right-2 z-10">
        <MediaOptionsButton mediaItem={item} existingItem={existingItem} />
      </span>

      <Link
        key={item.id}
        to={`/logger/${item.type}/details/${item.id}`}
        className="block rounded overflow-hidden shadow-md hover:shadow-xl transition-all hover:opacity-70"
      >
        <ImageWithSkeleton
          src={item.coverUrl}
          alt={item.title}
          className="h-full w-auto aspect-2/3 object-cover"
        />

        <div className="absolute rounded-md bottom-0 left-0 right-0 bg-linear-to-t from-background/90 via-background/50 to-transparent p-3">
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col-reverse min-w-0">
              <p className="text-white/60 text-xs">{item.year ?? "-"}</p>

              <h3 className="text-white font-semibold text-sm">
                {item.title}
              </h3>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};