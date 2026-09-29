import { Star } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export type StarFill = "full" | "half" | "empty"

/** Fraction a star should be painted, given a value in display units. */
export function starFill(value: number, starIndex: number): StarFill {
  if (value >= starIndex) return "full"
  if (value >= starIndex - 0.5) return "half"
  return "empty"
}

const fillWidth: Record<StarFill, string> = {
  full: "100%",
  half: "50%",
  empty: "0%",
}

interface StarGlyphProps {
  fill: StarFill
  /** Tailwind size classes for a single star, e.g. `size-4`. */
  size?: string
  /**
   * How to paint the empty outline. `muted` uses `text-muted-foreground`
   * (editor/read views on a surface); `dim` keeps the surrounding current color
   * at 25% opacity (compact read views).
   */
  emptyTone?: "muted" | "dim"
}

/** A single star, painted to the shared rating treatment. */
export function StarGlyph({ fill, size = "size-4", emptyTone = "muted" }: StarGlyphProps) {
  return (
    <div className={cn("relative", size)} aria-hidden="true">
      <Star
        className={cn(
          "absolute inset-0",
          size,
          emptyTone === "muted" ? "text-muted-foreground" : "opacity-25"
        )}
        fill="transparent"
        style={emptyTone === "dim" ? { color: "currentColor" } : undefined}
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: fillWidth[fill] }}
      >
        <Star className={cn(size, "text-rating")} fill="currentColor" />
      </div>
    </div>
  )
}

interface StarsRowProps extends React.ComponentProps<"div"> {
  /** Value in display units: 5-star scale is 0–5, 10-star scale is 0–10. */
  value: number
  max: number
  /** Tailwind size classes applied to each star, e.g. `size-4`. */
  size?: string
  /** Paint empty stars in the current color at 25% instead of muted-foreground. */
  dimEmpty?: boolean
}

/** Read-only row of stars, shared by the rating editor and the rating display. */
export function StarsRow({
  value,
  max,
  size = "size-4",
  dimEmpty,
  className,
  ...props
}: StarsRowProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} {...props}>
      {Array.from({ length: max }, (_, i) => (
        <StarGlyph
          key={i}
          fill={starFill(value, i + 1)}
          size={size}
          emptyTone={dimEmpty ? "dim" : "muted"}
        />
      ))}
    </div>
  )
}
