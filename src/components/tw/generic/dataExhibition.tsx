import { ReactNode } from "react";

import { Loading } from "./loading";

import { cn } from "@/lib/utils";

interface DataExhibitionProps {
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  children: ReactNode;
  skeleton?: ReactNode;
  className?: string;
}

export const DataExhibition = ({ children, isLoading, isFetching, isError, errorMessage, skeleton, className }: DataExhibitionProps) => {
  return (
    <div className={cn("relative min-w-0", className)}>
      {isError && <p className="text-sm text-destructive">{errorMessage}</p>}
      {isLoading && skeleton ? skeleton : !isError && children}
      {isFetching && !isLoading && <Loading isLoading />}
    </div>
  );
};
