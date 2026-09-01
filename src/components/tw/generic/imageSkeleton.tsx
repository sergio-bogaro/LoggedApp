import { ImageOff } from "lucide-react";
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

export function ImageWithSkeleton({ src, alt, className, width, height, imgClassName, }: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGone, setIsGone] = useState(false);
  const [isError, setIsError] = useState(false);

  const showPlaceholder = !src || isError;

  useEffect(() => {
    setIsLoaded(false);
    setIsGone(false);
    setIsError(false);
  }, [src]);

  useEffect(() => {
    if (!isLoaded || showPlaceholder) return;

    const timeout = setTimeout(() => setIsGone(true), 500);
    return () => clearTimeout(timeout);
  }, [isLoaded, showPlaceholder]);

  return (
    <div
      className={cn("relative overflow-hidden rounded-md bg-muted", className)}
      aria-busy={!isLoaded}
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
      }}
    >
      {!isGone && !showPlaceholder && (
        <Skeleton
          className={cn(
            "absolute inset-0 h-full w-full animate-pulse pointer-events-none transition-opacity duration-500",
            isLoaded && "opacity-0",
          )}
        />
      )}

      {showPlaceholder ? (
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <ImageOff className="w-8 h-8 text-muted-foreground/50" />
        </div>
      ) : (
        <img
          key={src}
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsError(true)}
          loading="lazy"
          decoding="async"
          className={cn(
            "relative block h-full w-full object-cover transition-[opacity,transform] duration-500 ease-out",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]",
            imgClassName,
          )}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}
