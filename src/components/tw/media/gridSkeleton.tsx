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

const GRID_SKELETON_COUNT = 10;

/** A responsive poster grid standing in for whichever card view is loading. */
export const MediaGridSkeleton = ({ count = GRID_SKELETON_COUNT }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <GridItemSkeleton key={i} />
      ))}
    </div>
  );
};