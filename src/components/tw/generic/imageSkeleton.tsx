import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ImageWithSkeletonProps = {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  imgClassName?: string;
};

export function ImageWithSkeleton({
  src,
  alt,
  className,
  width,
  height,
  imgClassName,
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGone, setIsGone] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setIsGone(false);

    if (!src) {
      setIsLoaded(true);
      setIsGone(true);
    }
  }, [src]);

  useEffect(() => {
    if (!isLoaded) return;

    const timeout = setTimeout(() => setIsGone(true), 500);
    return () => clearTimeout(timeout);
  }, [isLoaded]);

  return (
    <div
      className={cn("relative overflow-hidden rounded-md bg-muted", className)}
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
      }}
      aria-busy={!isLoaded}
    >
      {!isGone && (
        <Skeleton
          className={cn(
            "absolute inset-0 h-full w-full animate-pulse pointer-events-none transition-opacity duration-500",
            isLoaded && "opacity-0",
          )}
        />
      )}

      <img
        key={src ?? "empty"}
        src={src != "" ? src : undefined}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        decoding="async"
        className={cn(
          "relative block h-full w-full object-cover transition-[opacity,transform] duration-500 ease-out",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]",
          imgClassName,
        )}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
