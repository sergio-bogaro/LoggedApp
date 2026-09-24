import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { TypeMark } from "@/components/tw/generic/badges";
import { EmptyState } from "@/components/tw/generic/EmptyState";
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
      className="relative block rounded overflow-hidden shadow-md transition-shadow hover:shadow-lg"
    >
      <ImageWithSkeleton
        src={coverUrl ?? ""}
        alt={media.title}
        className="h-full w-auto aspect-2/3 object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
      />

      <div className="absolute top-2 left-2">
        <TypeMark type={item.mediaType} tone="overlay" />
      </div>

      <div className="absolute rounded-md bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3">
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col-reverse min-w-0">
            <p className="text-white/60 text-step-0">{year ?? "-"}</p>
            <h3 className="text-white font-semibold text-step-1 line-clamp-2">
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
    <div className="md:px-12 mt-4 min-h-72">
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
      <EmptyState
        title={emptyMessage ?? t("list.empty")}
        className="md:px-12 mt-4"
      />
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
