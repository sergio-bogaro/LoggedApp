import { MoreVertical, PlayCircle } from "lucide-react";
import React from "react";
import { Link } from "react-router";

import { ImageWithSkeleton } from "../imageSkeleton";
import MediaOptionsButton from "../mediaOptions";

import { MediaItem } from "@/types/mediaItem";

export const GridItem = ({ item }: { item: MediaItem }) => {

  function handleTreeDotsClick(e: React.MouseEvent) {
    console.log("oi")
  }

  return (
    <Link
      key={item.id}
      to={`/logger/${item.type}/details/${item.id}`}
      className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
    >

      {/* TODO: Badge de marcacao do usuario: Watchlist, assistido, etc. */}
      {/* <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded px-2 py-1 text-xs font-semibold">
        1
      </div> */}

      {/* Options Button */}
      <span className="absolute top-2 right-2 z-10">
        <MediaOptionsButton onClickFunction={handleTreeDotsClick} />
      </span>

      {/* Image */}
      <ImageWithSkeleton
        src={item.coverUrl}
        alt={item.title}
        className="w-full h-full object-cover"
      />



      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
  );
};