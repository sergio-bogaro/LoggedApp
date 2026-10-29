import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { TypeMark } from "@/components/tw/generic/badges";
import { EmptyState } from "@/components/tw/generic/EmptyState";
import { ImageWithSkeleton } from "@/components/tw/generic/imageSkeleton";
import { PosterFallback } from "@/components/tw/generic/PosterFallback";
import { MediaGridSkeleton, POSTER_GRID_COLLECTION } from "@/components/tw/media/gridSkeleton";
import { API_BASE_URL } from "@/querries/apiBase";
import { MediaListItem } from "@/types/mediaList";

interface ListItemCardProps {
  item: MediaListItem;
}

const ListItemCard = ({ item }: ListItemCardProps) => {
  const media = item.media;
  if (!media) return null;

  const coverUrl = media.imagePath
    ? `${API_BASE_URL}/uploads/${media.imagePath}`
    : media.coverUrl;

  const year = media.releaseDate?.slice(0, 4);

  return (
    <Link
      to={`/media/${item.mediaType}/details/${media.externalId}`}
      className="relative block overflow-hidden rounded-md bg-muted ring-1 ring-border/80 transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm hover:ring-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <ImageWithSkeleton
        src={coverUrl ?? ""}
        alt=""
        className="aspect-2/3 w-full"
        imgClassName="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        fallback={<PosterFallback title={media.title} type={item.mediaType} />}
      />

      <div className="absolute top-2 left-2">
        <TypeMark type={item.mediaType} tone="overlay" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 rounded-b-md bg-linear-to-t from-black/85 via-black/35 to-transparent p-3 pt-10">
        <div className="flex flex-col-reverse min-w-0">
          <p className="text-step-0 tabular-nums text-white/65">{year ?? "-"}</p>
          <h3 className="line-clamp-2 text-step-1 font-medium text-white">
            {media.title}
          </h3>
        </div>
      </div>
    </Link>
  );
};

const SKELETON_COUNT = 6;

export const ListItemSkeleton = () => {
  return (
    <div className="mt-4 min-h-72">
      <MediaGridSkeleton count={SKELETON_COUNT} className={POSTER_GRID_COLLECTION} />
    </div>
  );
};

interface ListItemsGridProps {
  items?: MediaListItem[];
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;
}

export const ListItemsGrid = ({
  items,
  emptyMessage,
  emptyDescription,
  emptyIcon,
  emptyAction,
}: ListItemsGridProps) => {
  const { t } = useTranslation("media");

  if (!items || items.length === 0) {
    return (
      <EmptyState
        title={emptyMessage ?? t("list.empty")}
        description={emptyDescription}
        icon={emptyIcon}
        action={emptyAction}
        className="mt-4"
      />
    );
  }

  return (
    <div className="mt-4 min-h-72">
      <div className={POSTER_GRID_COLLECTION}>
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <ListItemCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};
