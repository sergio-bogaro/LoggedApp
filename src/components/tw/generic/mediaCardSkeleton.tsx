import { useTranslation } from "react-i18next";

import { GridItemSkeleton } from "@/components/tw/media/gridSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const CARD_COUNT = 6;
const SECTION_COUNT = 2;

export const MediaCardSkeleton = () => {
  const { t } = useTranslation("common");

  return (
    <div className="w-full mt-4" role="status" aria-busy="true" aria-label={t("a11y.loading")}>
      {/* Sections skeleton (the tab bar stays mounted, so it is not faked here) */}
      <div className="space-y-8" aria-hidden="true">
        {Array.from({ length: SECTION_COUNT }).map((_, sectionIdx) => (
          <div key={sectionIdx}>
            {/* Section title + view all/buttons cluster */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-4 w-64" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                <div className="hidden gap-1 md:flex">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="size-8 rounded-full" />
                </div>
              </div>
            </div>

            {/* Cards carousel */}
            <div className="flex -ml-4 overflow-hidden min-h-72">
              {Array.from({ length: CARD_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="pl-4 basis-1/2 lg:basis-1/4 xl:basis-1/6 2xl:basis-1/8 shrink-0"
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
