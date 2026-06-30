import { GridItemSkeleton } from "@/components/tw/media/gridSkeleton";

const SKELETON_COUNT = 6;

export const MediaCardSkeleton = () => {
  return (
    <div className="md:px-12 mt-4">
      <div className="flex -ml-4 overflow-hidden">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div
            key={i}
            className="pl-4 basis-1/2 lg:basis-1/4 xl:basis-1/6 shrink-0"
          >
            <GridItemSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
};