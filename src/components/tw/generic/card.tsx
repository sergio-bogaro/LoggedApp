import { ReactNode } from "react"

import { cn } from "@/lib/utils"

export const Card = ({ children, className }: { children: ReactNode, className?: string }) => {
  return (
    <div className={cn("flex flex-col bg-card rounded p-2 gap-2", className)}>
      {children}
    </div>
  )
}