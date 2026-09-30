import { Skeleton } from "@/components/ui/skeleton";

const GROUPS = 2;
const ROWS_PER_GROUP = 3;

/*
 * Mirrors LogStream in list mode: a section heading with the same hairline,
 * then register rows with the same poster size and paddings.
 */
export const LogStreamSkeleton = () => {
  return (
    <div className="space-y-8" aria-hidden="true">
      {Array.from({ length: GROUPS }).map((_, group) => (
        <section key={group}>
          <div className="border-b border-border pb-2">
            <Skeleton className="h-7 w-44" />
          </div>

          <div className="mt-2">
            {Array.from({ length: ROWS_PER_GROUP }).map((_, row) => (
              <div key={row} className="flex items-center gap-4 py-3 pl-3 pr-12 sm:pr-28">
                <Skeleton className="h-[72px] w-12 shrink-0 rounded-control" />

                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
