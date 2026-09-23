import { Skeleton } from "@/components/ui/skeleton";

const GROUPS = 2;
const ROWS_PER_GROUP = 3;

export const LogStreamSkeleton = () => {
  return (
    <div className="space-y-8">
      {Array.from({ length: GROUPS }).map((_, group) => (
        <section key={group}>
          <Skeleton className="h-7 w-44" />

          <div className="mt-4">
            {Array.from({ length: ROWS_PER_GROUP }).map((_, row) => (
              <div key={row} className="flex items-center gap-4 px-3 py-3">
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
