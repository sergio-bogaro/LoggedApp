import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ImageWithSkeletonProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

export function ImageWithSkeleton({
  src,
  alt,
  className,
  width,
  height,
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={cn("overflow-hidden rounded-md bg-muted", className)}
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
      }}
      aria-busy={!isLoaded}
    >
      {!isLoaded && (
        <Skeleton className="h-full w-full animate-pulse" />
      )}

      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "relative block h-full w-full object-cover transition-opacity duration-300 ease-out",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{ width: "100%", height: "100%" }}
        decoding="async"
      />
    </div>
  );
}
