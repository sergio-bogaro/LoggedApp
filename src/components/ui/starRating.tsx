/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { FormControl, FormField, FormItem, FormMessage } from "./form"
import { Label } from "./label"
import { StarGlyph, starFill } from "./stars"

import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/settings/hooks"
import type { RatingMode } from "@/store/settings/slice"

const STAR_COUNT: Record<RatingMode, number> = {
  numeric: 0,
  stars5: 5,
  stars10: 10,
}

type StarsBaseProps = {
  value: number
  onChange: (value: number) => void
  mode: "stars5" | "stars10"
  id?: string
  ariaLabel: string
}

const toDisplay = (v: number, mode: RatingMode) => mode === "stars5" ? v / 2 : v
const toRating = (v: number, mode: RatingMode) => mode === "stars5" ? v * 2 : v

const STAR_SIZE = "size-6 pointer-coarse:size-7"

function StarsBase({ value, onChange, mode, id, ariaLabel }: StarsBaseProps) {
  const [hovered, setHovered] = React.useState<number | null>(null)
  const allowHalf = mode === "stars5"
  const steps = allowHalf ? 0.5 : 1
  const max = STAR_COUNT[mode]

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next = display
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = Math.min(max, display + steps)
        break
      case "ArrowLeft":
      case "ArrowDown":
        next = Math.max(0, display - steps)
        break
      case "Home":
        next = 0
        break
      case "End":
        next = max
        break
      default:
        return
    }

    e.preventDefault()
    onChange(toRating(next, mode))
  }

  const valueText = display > 0 ? `${display} / ${max}` : ariaLabel

  return (
    <div
      id={id}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={display}
      aria-valuetext={valueText}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setHovered(null)}
      onBlur={() => setHovered(null)}
      className="flex items-center gap-0.5 rounded-control outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25"
    >
      {Array.from({ length: max }, (_, i) => {
        const starIndex = i + 1

        return (
          <div
            key={i}
            className={cn("relative cursor-pointer", STAR_SIZE)}
            aria-hidden="true"
            onMouseMove={(e) => setHovered(resolve(e, starIndex))}
            onClick={(e) => {
              const next = resolve(e, starIndex)
              onChange(toRating(next === display ? 0 : next, mode))
            }}
          >
            <StarGlyph fill={starFill(active, starIndex)} size={STAR_SIZE} />
          </div>
        )
      })}

      <span className="ml-2 w-6 text-step-1 text-muted-foreground tabular-nums">
        {value > 0 ? (value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)) : "—"}
      </span>
    </div>
  )
}

type NumericBaseProps = {
  value: number
  onChange: (value: number) => void
  id?: string
  ariaLabel: string
}

function NumericBase({ value, onChange, id, ariaLabel }: NumericBaseProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-40 cursor-pointer accent-rating"
      />
      <span className="w-6 text-center text-step-1 font-semibold tabular-nums">
        {value > 0 ? value : "—"}
      </span>
    </div>
  )
}

type StarRatingBaseProps = {
  value?: number
  onChange?: (value: number) => void
  mode: RatingMode
  id?: string
  ariaLabel: string
}

function StarRatingBase({ value = 0, onChange, mode, id, ariaLabel }: StarRatingBaseProps) {
  const handleChange = onChange ?? (() => {})

  if (mode === "numeric") {
    return <NumericBase value={value} onChange={handleChange} id={id} ariaLabel={ariaLabel} />
  }

  return <StarsBase value={value} onChange={handleChange} mode={mode} id={id} ariaLabel={ariaLabel} />
}

type StarRatingProps = {
  label?: string
  name: string
  required?: boolean
  control?: Control<any>
}

export function StarRating({ label, name, required, control }: StarRatingProps) {
  const ratingMode = useAppSelector((state) => state.ui.ratingMode)
  const { t } = useTranslation("common")
  const ariaLabel = label ?? t("a11y.rating")

  if (control) {
    return (
      <div className="flex w-full flex-col gap-1">
        {label && (
          <Label htmlFor={name}>
            {label}
            {required && <span aria-hidden="true" className="-ml-1 text-destructive">*</span>}
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
                  id={name}
                  ariaLabel={ariaLabel}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    )
  }

  return <StarRatingBase mode={ratingMode} ariaLabel={ariaLabel} />
}
