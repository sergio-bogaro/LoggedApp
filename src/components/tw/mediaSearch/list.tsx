import { Plus } from "lucide-react";
import { Link } from "react-router"

import { ImageWithSkeleton } from "../imageSkeleton";
import MediaOptionsButton from "../mediaOptions";

import { Button } from "@/components/ui/button";
import { MediaItem } from "@/types/mediaItem";

const ListItem = ({ item }: { item: MediaItem }) => {

  return (
    <Link
      key={item.id}
      to={`/logger/${item.type}/details/${item.id}`}
      className="flex group border rounded overflow-hidden p-2 cursor-pointer hover:shadow hover:bg-accent/30 transition">

      <ImageWithSkeleton
        src={item.coverUrl}
        alt={item.title}
        height={220}
        width={180}
      />

      <div className="flex w-full flex-col gap-4 px-2 relative">
        <div>
          <h3 className="font-semibold">
            {item.title}
          </h3>

          <p className="text-sm text-foreground/80">{item.year ?? "-"}</p>

          <span className="text-sm text-foreground/50 mt-2 block">
            {item.description.length > 300 ? item.description.slice(0, 250) + " ..." : item.description || "No description available."}
          </span>
        </div>


        <span className="absolute top-2 right-2 z-10">
          <MediaOptionsButton mediaId={item.id} />
        </span>

      </div>
    </Link>
  )
}

export default ListItem;