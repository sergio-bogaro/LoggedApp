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
            {/* Section title */}
            <Skeleton className="h-5 w-40 mb-2" />
            {/* Section description */}
            <Skeleton className="h-4 w-64 mb-4" />

            {/* Cards carousel */}
            <div className="flex -ml-4 overflow-hidden">
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
