import { useTranslation } from "react-i18next";

import { Skeleton } from "@/components/ui/skeleton";

const TAG_COUNT = 3;
const RECORD_ROW_COUNT = 4;
const TAB_COUNT = 4;
const DETAILS_ROW_COUNT = 4;

export const MediaDetailsSkeleton = () => {
  const { t } = useTranslation("common");

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("a11y.loading")}
      className="mx-auto max-w-[1100px] p-4 sm:p-8"
    >
      <div className="flex flex-col gap-6 md:flex-row md:gap-10" aria-hidden="true">
        {/* Poster + record */}
        <div className="w-full shrink-0 space-y-4 sm:mx-auto sm:max-w-[360px] md:mx-0 md:max-w-none md:w-72 lg:w-80">
          <Skeleton className="aspect-2/3 w-full rounded-lg" />

          <div className="space-y-3">
            <Skeleton className="h-6 w-36" />

            <div className="space-y-2 border-t border-border pt-3">
              {Array.from({ length: RECORD_ROW_COUNT }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20 shrink-0" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Skeleton className="h-9 w-full rounded-control" />
              <Skeleton className="h-9 w-full rounded-control" />
            </div>
          </div>
        </div>

        {/* Heading, synopsis, tabs */}
        <div className="min-w-0 flex-1">
          <div className="flex justify-end">
            <Skeleton className="size-9 rounded-control pointer-coarse:size-11" />
          </div>

          <Skeleton className="h-9 w-72 max-w-full" />

          <div className="mt-3 flex flex-wrap gap-4">
            {Array.from({ length: TAG_COUNT }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="mt-10">
            <div className="flex gap-6 border-b border-border pb-3">
              {Array.from({ length: TAB_COUNT }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-20" />
              ))}
            </div>

            <div className="mt-4">
              {Array.from({ length: DETAILS_ROW_COUNT }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-6 py-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
