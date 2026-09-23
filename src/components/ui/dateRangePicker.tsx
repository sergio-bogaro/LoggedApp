import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

import { Calendar } from "@/components/ui/calendar";
import { fieldSurface } from "@/components/ui/fieldStyles";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDisplayDate, parseIsoDate, toIsoDay } from "@/utils/date";

export interface DateRangeValue {
  from?: string;
  to?: string;
}

interface DateRangePickerProps {
  id?: string;
  /** ISO day (yyyy-MM-dd). */
  from?: string;
  /** ISO day (yyyy-MM-dd). */
  to?: string;
  onChange: (range: DateRangeValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/*
 * The shadcn "date range picker" composition: Popover + Calendar in range mode.
 * The calendar in this project already ships the range styling, so nothing was
 * added from a registry.
 *
 * The trigger is a field, not a button: it composes the same surface as Input
 * and Select, so it cannot drift from the controls beside it.
 */
export function DateRangePicker({
  id,
  from,
  to,
  onChange,
  placeholder,
  disabled,
  className,
}: DateRangePickerProps) {
  const { i18n, t } = useTranslation("common");
  const [open, setOpen] = useState(false);

  const start = parseIsoDate(from) ?? undefined;
  const end = parseIsoDate(to) ?? undefined;

  const label =
    start || end
      ? [formatDisplayDate(start, i18n.language), formatDisplayDate(end, i18n.language)]
        .filter(Boolean)
        .join(" – ")
      : (placeholder ?? t("form.datePlaceholder"));

  const handleSelect = (range: DateRange | undefined) => {
    onChange({
      from: range?.from ? toIsoDay(range.from) : undefined,
      to: range?.to ? toIsoDay(range.to) : undefined,
    });

    /* Closing on the first click of a range would cut the selection short. */
    if (range?.from && range.to) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            fieldSurface,
            "flex h-9 w-full items-center gap-2 px-3 text-step-2",
            "pointer-coarse:h-11",
            "[&_svg]:pointer-events-none [&_svg]:shrink-0",
            !start && !end && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="truncate">{label}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={1}
          selected={{ from: start, to: end }}
          defaultMonth={start}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
