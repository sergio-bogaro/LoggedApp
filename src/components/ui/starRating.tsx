/* eslint-disable @typescript-eslint/no-explicit-any */
import { Star } from "lucide-react"
import * as React from "react"
import { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { FormControl, FormField, FormItem } from "./form"
import { Label } from "./label"

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
  ariaLabel: string
}

const toDisplay = (v: number, mode: RatingMode) => mode === "stars5" ? v / 2 : v
const toRating = (v: number, mode: RatingMode) => mode === "stars5" ? v * 2 : v

function StarsBase({ value, onChange, mode, ariaLabel }: StarsBaseProps) {
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
      className="flex items-center gap-0.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {Array.from({ length: max }, (_, i) => {
        const starIndex = i + 1
        const fillType =
          active >= starIndex ? "full" : active >= starIndex - 0.5 ? "half" : "empty"

        return (
          <div
            key={i}
            className="relative w-8 h-8 cursor-pointer"
            aria-hidden="true"
            onMouseMove={(e) => setHovered(resolve(e, starIndex))}
            onClick={(e) => {
              const next = resolve(e, starIndex)
              onChange(toRating(next === display ? 0 : next, mode))
            }}
          >
            <Star
              className="w-8 h-8 absolute top-0 left-0 transition-colors"
              fill="transparent"
              style={{ color: "var(--muted-foreground)" }}
            />
            <div
              className="absolute top-0 left-0 h-full overflow-hidden transition-all"
              style={{
                width: fillType === "full" ? "100%" : fillType === "half" ? "50%" : "0%",
              }}
            >
              <Star className="w-8 h-8 text-amber-400" fill="currentColor" />
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
        className="w-40 accent-yellow-400 cursor-pointer"
      />
      <span className="text-sm font-semibold tabular-nums w-6 text-center">
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

  return <StarsBase value={value} onChange={handleChange} mode={mode} ariaLabel={ariaLabel} />
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
      <div className="flex flex-col w-full gap-1">
        {label && (
          <Label className="font-bold">
            {label}
            {required && <span aria-hidden="true" className="text-destructive font-extrabold -ml-1.5">*</span>}
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
            </FormItem>
          )}
        />
      </div>
    )
  }

  return <StarRatingBase mode={ratingMode} ariaLabel={ariaLabel} />
}
