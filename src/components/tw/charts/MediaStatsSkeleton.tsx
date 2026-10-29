import { Skeleton } from "@/components/ui/skeleton";

const INDEX_COUNT = 4;
const SECTION_COUNT = 3;

export const MediaStatsSkeleton = () => {
  return (
    <div className="space-y-12">
      {/* Headline + typographic index */}
      <div className="border-t border-border pt-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-2 h-16 w-28" />

        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
          {Array.from({ length: INDEX_COUNT }).map((_, i) => (
            <div key={i} className="w-20 space-y-2">
              <Skeleton className="h-4 w-16" />
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
                <Skeleton className="h-64 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
