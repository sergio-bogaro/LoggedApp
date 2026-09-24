/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from "i18next"
import { CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Control } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { FormControl, FormField, FormItem } from "@/components/ui/form"
import { BaseInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatDisplayDate } from "@/utils/date"

interface DatePickerProps {
  label?: string
  name: string
  id?: string
  required?: boolean
  control: Control<any>
  disabled?: boolean
  placeholder?: string
}

interface DateFieldProps {
  id?: string
  /** ISO day (yyyy-MM-dd). */
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

function useCurrentLocale() {
  const [locale, setLocale] = useState(i18n.language)

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => setLocale(lng)
    i18n.on("languageChanged", handleLanguageChanged)
    return () => i18n.off("languageChanged", handleLanguageChanged)
  }, [])

  return locale
}

function isValidDate(date: Date | undefined): date is Date {
  return !!date && !isNaN(date.getTime())
}

function toIsoDateString(date: Date | undefined) {
  if (!isValidDate(date)) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseIsoDateString(value?: string) {
  if (!value) return undefined
  // Accepts a plain ISO day (yyyy-MM-dd) as well as a datetime from the API
  // (yyyy-MM-ddThh:mm:ss); only the date part matters here.
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return undefined
  const [, year, month, day] = match.map(Number)
  const date = new Date(year, month - 1, day)
  return isValidDate(date) ? date : undefined
}

function parseTypedInput(value: string, locale: string): Date | undefined {
  const trimmed = value.trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const isoAttempt = new Date(trimmed)
    return isValidDate(isoAttempt) ? isoAttempt : undefined
  }

  const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (!match) return undefined

  const [, first, second, third] = match.map(Number) as unknown as [
    never,
    number,
    number,
    number,
  ]

  const isPtBr = locale?.toLowerCase().startsWith("pt")
  const [day, month, year] = isPtBr ? [first, second, third] : [second, first, third]

  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined

  const date = new Date(year, month - 1, day)
  return isValidDate(date) ? date : undefined
}

/**
 * Controlled date input with a calendar popover. Form-bound callers should use
 * `DatePicker`; this is the same field for everything else.
 */
export function DateField({
  id,
  value,
  onChange,
  disabled,
  placeholder,
  className,
}: DateFieldProps) {
  const { t } = useTranslation("common")
  const locale = useCurrentLocale()
  const selectedDate = parseIsoDateString(value)

  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(formatDisplayDate(selectedDate, locale))
  const [month, setMonth] = useState<Date | undefined>(selectedDate)

  useEffect(() => {
    setInputValue(formatDisplayDate(parseIsoDateString(value), locale))
  }, [value, locale])

  return (
    <div className={cn("relative", className)}>
      <BaseInput
        id={id}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-9"
        onChange={(e) => {
          setInputValue(e.target.value)
          const parsedDate = parseTypedInput(e.target.value, locale)
          if (parsedDate) {
            onChange(toIsoDateString(parsedDate))
            setMonth(parsedDate)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("a11y.selectDate")}
            disabled={disabled}
            className="absolute right-1 top-1/2 size-7 -translate-y-1/2 pointer-coarse:size-10"
          >
            <CalendarIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">{t("a11y.selectDate")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              onChange(toIsoDateString(date))
              setInputValue(formatDisplayDate(date, locale))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function DatePicker({ label, name, id, required, control, disabled, placeholder }: DatePickerProps) {
  const { t } = useTranslation("common")
  const resolvedPlaceholder = placeholder ?? t("form.datePlaceholder")

  return (
    <div className="flex w-full flex-col gap-1">
      <Label htmlFor={id ?? name}>
        {label}
        {required && (
          <span aria-hidden="true" className="-ml-1 text-destructive">*</span>
        )}
      </Label>

      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl className="m-0">
              <DateField
                id={id ?? name}
                value={field.value}
                onChange={field.onChange}
                disabled={disabled}
                placeholder={resolvedPlaceholder}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}
