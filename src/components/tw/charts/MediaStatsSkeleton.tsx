import { Skeleton } from "@/components/ui/skeleton";

const INDEX_COUNT = 4;
const SECTION_COUNT = 3;

export const MediaStatsSkeleton = () => {
  return (
    <div className="space-y-10">
      {/* Headline + typographic index */}
      <div className="border-t border-border pt-5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-3 h-10 w-32" />
        <Skeleton className="mt-3 h-4 w-40" />

        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: INDEX_COUNT }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Sections of charts */}
      {Array.from({ length: SECTION_COUNT }).map((_, section) => (
        <div key={section} className="space-y-5">
          <div className="border-b border-border pb-2">
            <Skeleton className="h-6 w-48" />
          </div>

          <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
            {Array.from({ length: section === 0 ? 1 : 2 }).map((_, chart) => (
              <div key={chart} className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-56 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
