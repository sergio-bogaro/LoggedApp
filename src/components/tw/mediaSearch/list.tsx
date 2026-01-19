import { Plus } from "lucide-react";
import { Link } from "react-router"

import { ImageWithSkeleton } from "../imageSkeleton";

import { Button } from "@/components/ui/button";
import { MediaItem } from "@/types/mediaItem";

const ListItem = ({ item }: { item: MediaItem }) => {

  return (
    <Link
      key={item.id}
      to={`/logger/${item.type}/details/${item.id}`}
      className="flex border rounded overflow-hidden p-2 cursor-pointer hover:shadow hover:bg-accent/30 transition">
      {item.coverUrl ? (
        <ImageWithSkeleton src={item.coverUrl} alt={item.title} height={120} width="fit-content" />
        // <img loading='lazy' src={item.coverUrl} alt={item.title} className="h-[120px] rounded" />
      ) : (
        <div className="h-[120px] w-[80px] bg-muted flex items-center justify-center">No Poster</div>
      )}
      <div className="flex w-full flex-col gap-4 px-2 relative">
        <div>
          <h3 className="font-semibold">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600">{item.year ?? "-"}</p>
        </div>


        <Button className='top-0 right-0 absolute p-1' size="default" variant='secondary' onClick={() => alert("aaaaaaaaaaa")}>
          <Plus />
        </Button>

      </div>
    </Link>
  )
}

export default ListItem;