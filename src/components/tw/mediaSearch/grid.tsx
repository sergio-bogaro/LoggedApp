import { MoreVertical, PlayCircle } from "lucide-react";
import { Link } from "react-router";

import { ImageWithSkeleton } from "../imageSkeleton";

import { MediaItem } from "@/types/mediaItem";

export const GridItem = ({ item }: { item: MediaItem }) => {
  return (
    <div
      key={item.id}
      className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
    >
      {/* Image */}
      <ImageWithSkeleton
        src={item.coverUrl}
        alt={item.title}
        className="w-full h-full object-cover"
      />

      {/* TODO: Badge de marcacao do usuario: Watchlist, assistido, etc. */}
      {/* <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded px-2 py-1 text-xs font-semibold">
        1
      </div> */}

      {/* Options Button */}
      <button className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded p-1 transition opacity-0 group-hover:opacity-100">
        <MoreVertical size={20} />
      </button>

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col-reverse min-w-0">
            <p className="text-white/60 text-xs">{item.year ?? "-"}</p>

            <h3 className="text-white font-semibold text-sm">
              {item.title}
            </h3>
          </div>

          <Link
            to={`/logger/${item.type}/details/${item.id}`}
            className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded p-2 transition"
            title="Resumir"
          >
            <PlayCircle size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};