import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DataExhibitionProps {
  isFetching?: boolean;
  isError?: boolean;
  errorMessage?: string;
  children: ReactNode;
  skeleton?: ReactNode;
  className?: string;
}

export const DataExhibition = ({ children, isFetching, isError, errorMessage, skeleton, className }: DataExhibitionProps) => {
  return(
    <div className={cn("min-w-0", className)}>
      {isError && <p className="text-sm text-destructive">{errorMessage}</p>}
      {isFetching && skeleton ? skeleton : !isError && children}
    </div>
  )
}
