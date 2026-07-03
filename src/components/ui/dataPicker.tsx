/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from "i18next"
import { CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Control, ControllerRenderProps } from "react-hook-form"

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

interface DatePickerProps {
  label?: string
  name: string
  id?: string
  required?: boolean
  control: Control<any>
  disabled?: boolean
  placeholder?: string
}

interface DatePickerFieldProps {
  field: ControllerRenderProps<any, string>
  id?: string
  disabled?: boolean
  placeholder?: string
}

function toBcp47Locale(locale: string): string {
  const normalized = locale?.toLowerCase() ?? ""

  if (normalized.startsWith("pt")) return "pt-BR"
  if (normalized.startsWith("en")) return "en-US"

  return "en-US"
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

function formatDisplayDate(date: Date | undefined, locale: string) {
  if (!date) return ""
  return date.toLocaleDateString(toBcp47Locale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
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
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
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

  const isPtBr = toBcp47Locale(locale) === "pt-BR"
  const [day, month, year] = isPtBr ? [first, second, third] : [second, first, third]

  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined

  const date = new Date(year, month - 1, day)
  return isValidDate(date) ? date : undefined
}

function DatePickerField({ field, id, disabled, placeholder }: DatePickerFieldProps) {
  const locale = useCurrentLocale()
  const selectedDate = parseIsoDateString(field.value)

  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState( formatDisplayDate(selectedDate, locale) )
  const [month, setMonth] = useState<Date | undefined>(selectedDate)

  useEffect(() => {
    setInputValue(formatDisplayDate(parseIsoDateString(field.value), locale))
  }, [field.value, locale])

  return (
    <div className="relative">
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
            field.onChange(toIsoDateString(parsedDate))
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
            aria-label="Select date"
            disabled={disabled}
            className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
          >
            <CalendarIcon className="size-4" />
            <span className="sr-only">Select date</span>
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
              field.onChange(toIsoDateString(date))
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
  const locale = useCurrentLocale()
  
  const resolvedPlaceholder = placeholder ?? (toBcp47Locale(locale) === "pt-BR" ? "dd/mm/aaaa" : "mm/dd/yyyy")

  return (
    <div className="flex w-full flex-col gap-1">
      <Label className="font-bold" htmlFor={id ?? name}>
        {label}
        {required && (
          <span className="text-destructive font-extrabold -ml-1.5">*</span>
        )}
      </Label>

      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl className="m-0">
              <DatePickerField
                field={field}
                id={id ?? name}
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