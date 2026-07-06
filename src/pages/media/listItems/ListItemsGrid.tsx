import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { MediaTypeBadge } from "@/components/tw/generic/badges";
import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { GridItemSkeleton } from "@/components/tw/media/gridSkeleton";
import { MediaListItem } from "@/types/mediaList";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface ListItemCardProps {
  item: MediaListItem;
}

const ListItemCard = ({ item }: ListItemCardProps) => {
  const media = item.media;
  if (!media) return null;

  const coverUrl = media.imagePath
    ? `${API_BASE}/uploads/${media.imagePath}`
    : media.coverUrl;

  const year = media.releaseDate?.slice(0, 4);

  return (
    <Link
      to={`/media/${item.mediaType}/details/${media.externalId}`}
      className="block rounded overflow-hidden shadow-md hover:shadow-xl transition-all hover:opacity-70"
    >
      <ImageWithSkeleton
        src={coverUrl ?? ""}
        alt={media.title}
        className="h-full w-auto aspect-2/3 object-cover"
      />

      <div className="absolute top-2 left-2">
        <MediaTypeBadge type={item.mediaType} />
      </div>

      <div className="absolute rounded-md bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3">
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col-reverse min-w-0">
            <p className="text-white/60 text-xs">{year ?? "-"}</p>
            <h3 className="text-white font-semibold text-sm">
              {media.title}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
};

const SKELETON_COUNT = 6;

export const ListItemSkeleton = () => {
  return (
    <div className="md:px-12 mt-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <GridItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

interface ListItemsGridProps {
  items?: MediaListItem[];
  emptyMessage?: string;
}

export const ListItemsGrid = ({ items, emptyMessage }: ListItemsGridProps) => {
  const { t } = useTranslation("media");

  if (!items || items.length === 0) {
    return (
      <div className="md:px-12 mt-8 text-center text-muted-foreground">
        {emptyMessage ?? t("list.empty")}
      </div>
    );
  }

  return (
    <div className="md:px-12 mt-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <ListItemCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};
