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