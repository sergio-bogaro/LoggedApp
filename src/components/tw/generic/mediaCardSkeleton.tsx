import { GridItemSkeleton } from "@/components/tw/media/gridSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const CARD_COUNT = 6;
const SECTION_COUNT = 2;

export const MediaCardSkeleton = () => {
  return (
    <div className="w-full mt-4">
      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      {/* Sections skeleton */}
      <div className="md:px-12 space-y-8">
        {Array.from({ length: SECTION_COUNT }).map((_, sectionIdx) => (
          <div key={sectionIdx}>
            {/* Section title + view all/buttons cluster */}
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-6 w-44" />
              <div className="flex flex-col items-center gap-1">
                <Skeleton className="h-8 w-24 rounded-md" />
                <div className="hidden md:flex gap-2">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="size-8 rounded-full" />
                </div>
              </div>
            </div>
            {/* Section description */}
            <Skeleton className="h-4 w-64 mb-4" />

            {/* Cards carousel */}
            <div className="flex -ml-4 overflow-hidden min-h-72">
              {Array.from({ length: CARD_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="pl-4 basis-1/2 lg:basis-1/4 xl:basis-1/6 shrink-0"
                >
                  <GridItemSkeleton />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
