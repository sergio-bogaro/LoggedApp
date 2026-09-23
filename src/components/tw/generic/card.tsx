import { ReactNode } from "react"

import { cn } from "@/lib/utils"

/*
 * Two surface levels, deliberately different treatments:
 *  - "sheet": a raised content plane — one step above the page, held by a hairline.
 *  - "plain": no plane and no edge, for content that already sits on a sheet.
 *
 * Elevation is carried by the change of plane plus the line, never by a stack
 * of shadows, so radius only exists on planes that actually float.
 */
type CardLevel = "sheet" | "plain"

const cardLevels: Record<CardLevel, string> = {
  sheet: "bg-card border border-border rounded-lg",
  plain: "bg-transparent",
}

interface CardProps {
  children: ReactNode
  className?: string
  level?: CardLevel
}

export const Card = ({ children, className, level = "sheet" }: CardProps) => {
  return (
    <div className={cn("flex flex-col gap-3 p-4", cardLevels[level], className)}>
      {children}
    </div>
  )
}
