/* eslint-disable @typescript-eslint/no-explicit-any */
import { Star } from "lucide-react"
import * as React from "react"
import { Control } from "react-hook-form"

import { FormControl, FormField, FormItem } from "./form"
import { Label } from "./label"

import { useAppSelector } from "@/store/settings/hooks"
import type { RatingMode } from "@/store/settings/slice"


// ─── Helpers ────────────────────────────────────────────────────────────────

/** Map a stored 0-10 value to the star display scale */
const toDisplay = (v: number, mode: RatingMode) =>
  mode === "stars5" ? v / 2 : v

/** Map a display value back to the 0-10 stored scale */
const toRating = (v: number, mode: RatingMode) =>
  mode === "stars5" ? v * 2 : v

const STAR_COUNT: Record<RatingMode, number> = {
  numeric: 0,
  stars5: 5,
  stars10: 10,
}

// ─── Stars base ─────────────────────────────────────────────────────────────

type StarsBaseProps = {
  value: number
  onChange: (value: number) => void
  mode: "stars5" | "stars10"
}

function StarsBase({ value, onChange, mode }: StarsBaseProps) {
  const [hovered, setHovered] = React.useState<number | null>(null)
  const allowHalf = mode === "stars5"
  const stars = STAR_COUNT[mode]

  const display = toDisplay(value, mode)
  const active = hovered ?? display

  const resolve = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect()
      const isHalf = (e.clientX - rect.left) / rect.width < 0.5
      return isHalf ? starIndex - 0.5 : starIndex
    }
    return starIndex
  }

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
      {Array.from({ length: stars }, (_, i) => {
        const starIndex = i + 1
        const fillType =
          active >= starIndex ? "full" : active >= starIndex - 0.5 ? "half" : "empty"

        return (
          <div
            key={i}
            className="relative w-7 h-7 cursor-pointer"
            onMouseMove={(e) => setHovered(resolve(e, starIndex))}
            onClick={(e) => {
              const next = resolve(e, starIndex)
              onChange(toRating(next === display ? 0 : next, mode))
            }}
          >
            <Star
              className="w-7 h-7 absolute top-0 left-0 transition-colors"
              fill="transparent"
              style={{ color: "var(--muted-foreground)" }}
            />
            <div
              className="absolute top-0 left-0 h-full overflow-hidden transition-all"
              style={{
                width: fillType === "full" ? "100%" : fillType === "half" ? "50%" : "0%",
              }}
            >
              <Star className="w-7 h-7" fill="currentColor" style={{ color: "#facc15" }} />
            </div>
          </div>
        )
      })}

      <span className="ml-2 text-sm text-muted-foreground tabular-nums w-6">
        {value > 0 ? (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) : "—"}
      </span>
    </div>
  )
}

// ─── Numeric base ────────────────────────────────────────────────────────────

type NumericBaseProps = {
  value: number
  onChange: (value: number) => void
}

function NumericBase({ value, onChange }: NumericBaseProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-40 accent-yellow-400 cursor-pointer"
      />
      <span className="text-sm font-semibold tabular-nums w-6 text-center">
        {value > 0 ? value : "—"}
      </span>
    </div>
  )
}

// ─── Public component ────────────────────────────────────────────────────────

type StarRatingBaseProps = {
  value?: number
  onChange?: (value: number) => void
  mode: RatingMode
}

function StarRatingBase({ value = 0, onChange, mode }: StarRatingBaseProps) {
  const handleChange = onChange ?? (() => {})

  if (mode === "numeric") {
    return <NumericBase value={value} onChange={handleChange} />
  }

  return <StarsBase value={value} onChange={handleChange} mode={mode} />
}

type StarRatingProps = {
  label?: string
  name: string
  required?: boolean
  control?: Control<any>
}

export function StarRating({ label, name, required, control }: StarRatingProps) {
  const ratingMode = useAppSelector((state) => state.ui.ratingMode)

  if (control) {
    return (
      <div className="flex flex-col w-full gap-1">
        {label && (
          <Label className="font-bold" htmlFor={name}>
            {label}
            {required && <span className="text-destructive font-extrabold -ml-1.5">*</span>}
          </Label>
        )}

        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarRatingBase
                  value={field.value ?? 0}
                  onChange={field.onChange}
                  mode={ratingMode}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    )
  }

  return <StarRatingBase mode={ratingMode} />
}

