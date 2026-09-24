import { Link } from "react-router";

import { TypeMark } from "../generic/badges";

import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
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
    <div className="relative group rounded">
      <span className="absolute top-2 right-2 z-10">
        <MediaOptionsButton mediaItem={item} existingItem={existingItem} />
      </span>


      <Link
        key={item.id}
        to={`/media/${item.type}/details/${item.id}`}
        className="relative block rounded overflow-hidden shadow-md transition-shadow hover:shadow-lg"
      >

        <ImageWithSkeleton
          src={existingItem?.imagePath ? (mediaImageUrl(existingItem.imagePath) ?? "") : item.coverUrl}
          alt={item.title}
          className="h-full w-auto aspect-2/3 object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />

        <div className="absolute top-2 left-2">
          {showMediaType && <TypeMark type={item.type} tone="overlay" />}
        </div>

        <div className="absolute rounded-md bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3">
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col-reverse min-w-0">
              <p className="text-white/60 text-step-0">{item.year ?? "-"}</p>

              <h3 className="text-white font-semibold text-step-1 line-clamp-2">
                {item.title}
              </h3>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
