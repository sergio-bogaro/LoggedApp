import { useTranslation } from "react-i18next";
import { Link } from "react-router"

import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
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
        className="flex border rounded overflow-hidden p-2 cursor-pointer hover:shadow hover:bg-accent/30 transition"
      >
        <ImageWithSkeleton
          src={existingItem?.imagePath ? mediaImageUrl(existingItem.imagePath)! : item.coverUrl}
          alt=""
          height={220}
          width={180}
          className="shrink-0"
        />

        <div className="flex w-full flex-col gap-4 px-2">
          <div>
            <h3 className="font-semibold">
              {item.title}
            </h3>

            <p className="text-sm text-foreground/80">{item.year ?? "-"}</p>

            <span className="text-sm text-foreground/50 mt-2 block">
              {item.description ? item.description.length > 300 ? item.description.slice(0, 250) + " ..." : item.description : t("list.noDescription")}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ListItem;
