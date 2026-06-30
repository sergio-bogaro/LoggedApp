import { ReactNode } from "react";

import { Loading } from "./loading";

import { cn } from "@/lib/utils";

interface DataExhibitionProps {
  isFetching?: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  className?: string;
}

export const DataExhibition = ({ children, isFetching, skeleton, className }: DataExhibitionProps) => {
  return(
    <div>
      <Loading isLoading={isFetching} />

      <div className={cn("min-w-0", className)}>
        {isFetching && skeleton ? skeleton : children}
      </div>
    </div>
  )
}
