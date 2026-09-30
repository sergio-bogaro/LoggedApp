import { useTranslation } from "react-i18next";

import { Skeleton } from "@/components/ui/skeleton";

export const GridItemSkeleton = () => {
  return (
    <div className="relative rounded overflow-hidden shadow-md">
      {/* Imagem */}
      <Skeleton className="w-full aspect-2/3" />

      {/* Badge topo esquerdo */}
      <div className="absolute top-2 left-2">
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>

      {/* Rodapé com gradiente */}
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3">
        <div className="flex flex-col-reverse gap-1">
          <Skeleton className="h-3 w-6 bg-white/20" />
          <Skeleton className="h-4 w-3/4 bg-white/20" />
        </div>
      </div>
    </div>
  );
};

/*
 * Poster grids. The constants are exported so the loading skeleton and the
 * loaded grid share one class string — otherwise columns and gaps drift apart
 * and the layout jumps when the data lands.
 */
export const POSTER_GRID = "grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8";
export const POSTER_GRID_WIDE = POSTER_GRID;
export const POSTER_GRID_COLLECTION = POSTER_GRID;

const GRID_SKELETON_COUNT = 12;

/**
 * A poster grid standing in for whichever card view is loading. Pass the same
 * grid class the loaded content uses (one of the POSTER_GRID constants).
 */
export const MediaGridSkeleton = ({
  count = GRID_SKELETON_COUNT,
  className = POSTER_GRID,
}: {
  count?: number;
  className?: string;
}) => {
  const { t } = useTranslation("common");

  return (
    <div className={className} role="status" aria-busy="true" aria-label={t("a11y.loading")}>
      {Array.from({ length: count }).map((_, i) => (
        <GridItemSkeleton key={i} />
      ))}
    </div>
  );
};
