import { GridItemSkeleton } from "@/components/tw/media/gridSkeleton";

const SKELETON_COUNT = 10;

export const MediaHomePageSkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 m-2 gap-4">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <GridItemSkeleton key={i} />
      ))}
    </div>
  );
};