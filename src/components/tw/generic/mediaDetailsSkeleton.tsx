import { useTranslation } from "react-i18next";

import { Skeleton } from "@/components/ui/skeleton";

const TAB_COUNT = 4;
const DETAILS_ROW_COUNT = 6;
const DETAILS_VALUE_WIDTHS = ["w-16", "w-28", "w-24", "w-40", "w-20", "w-24"];

export const MediaDetailsSkeleton = () => {
  const { t } = useTranslation("common");

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("a11y.loading")}
      className="max-w-[1400px] mx-auto p-4 sm:p-8"
    >
      <div className="flex flex-col md:flex-row gap-4" aria-hidden="true">
        {/* Left column: poster + actions + log card */}
        <div className="flex gap-4 items-start w-full flex-col md:w-1/5 md:min-w-[200px] md:max-w-[250px]">
          <div className="relative w-[70%] md:w-full">
            <Skeleton className="shrink-0 aspect-2/3 w-full rounded-md" />

            <div className="flex absolute bottom-4 justify-center gap-2 w-full">
              <Skeleton className="size-9 rounded-md pointer-coarse:size-11" />
              <Skeleton className="size-9 rounded-md pointer-coarse:size-11" />
            </div>
          </div>

          <div className="w-[70%] md:w-full">
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        </div>

        {/* Right column: options, info, tabs */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex justify-end">
            <Skeleton className="size-9 rounded-md pointer-coarse:size-11" />
          </div>

          {/* Media info */}
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-2 items-baseline">
              <Skeleton className="h-8 w-64 max-w-full" />
              <Skeleton className="h-5 w-12" />
            </div>

            <div className="flex flex-wrap gap-2 my-3">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-7 w-14 rounded-md" />
            </div>

            <div className="flex flex-col gap-4">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* Tabs + initial "details" tab content (label/value rows) */}
          <div className="mt-4">
            <div className="flex gap-2">
              {Array.from({ length: TAB_COUNT }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={`h-9 w-24 rounded-md ${i === 0 ? "bg-accent/80" : ""}`}
                />
              ))}
            </div>

            <div className="divide-y divide-border mt-4">
              {Array.from({ length: DETAILS_ROW_COUNT }).map((_, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2">
                  <Skeleton className="h-3 w-24 shrink-0" />
                  <Skeleton className={`h-4 ${DETAILS_VALUE_WIDTHS[i % DETAILS_VALUE_WIDTHS.length]}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
