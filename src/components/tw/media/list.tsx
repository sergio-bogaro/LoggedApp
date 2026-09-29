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
        className="flex gap-3 rounded-lg border border-border p-3 pr-12 transition-colors hover:bg-accent/50 hover:shadow-md"
      >
        <ImageWithSkeleton
          src={existingItem?.imagePath ? (mediaImageUrl(existingItem.imagePath) ?? "") : item.coverUrl}
          alt=""
          className="aspect-2/3 w-20 shrink-0 self-start rounded-control sm:w-24"
        />

        <div className="flex w-full min-w-0 flex-col gap-4">
          <div>
            <h3 className="font-semibold">
              {item.title}
            </h3>

            <p className="text-step-1 text-muted-foreground">{item.year ?? "-"}</p>

            <span className="mt-2 block text-step-1 text-muted-foreground">
              {item.description ? item.description.length > 300 ? item.description.slice(0, 250) + " ..." : item.description : t("list.noDescription")}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ListItem;
