import { endOfMonth, endOfWeek, endOfYear, format, startOfMonth, startOfWeek, startOfYear, type Locale } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";

export function newIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatFromIsoDate(iso?: string, to: "dd/mm/yyyy" | "mm/dd/yyyy" = "dd/mm/yyyy"): string | null {
  if (!iso) return null;

  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const [, year, mm, dd] = match;

  if (to === "dd/mm/yyyy") {
    return `${dd}/${mm}/${year}`;
  }

  if (to === "mm/dd/yyyy") {
    return `${mm}/${dd}/${year}`;
  }

  return null;
}

/**
 * Parses an ISO date (or timestamp) as a *local* date. `new Date("2026-09-21")`
 * would be read as UTC and can land on the previous day west of Greenwich.
 */
export function parseIsoDate(iso?: string | null): Date | null {
  if (!iso) return null;
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function resolveLocale(language?: string): Locale {
  return language?.toLowerCase().startsWith("pt") ? ptBR : enUS;
}

/** Stable grouping key, e.g. "2026-09". */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** "September 2026" / "Setembro 2026" */
export function formatMonthLabel(iso: string, language?: string): string {
  const date = parseIsoDate(iso);
  if (!date) return "";

  const label = format(date, "LLLL yyyy", { locale: resolveLocale(language) });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** "21 Sep" / "21 set" */
export function formatShortDay(iso: string, language?: string): string {
  const date = parseIsoDate(iso);
  if (!date) return "";

  return format(date, "d MMM", { locale: resolveLocale(language) }).replace(/\.$/, "");
}

/** "31 August 2026" / "31 de agosto de 2026" */
export function formatLongDate(iso?: string | null, language?: string): string {
  const date = parseIsoDate(iso);
  if (!date) return "";

  return format(date, "PPP", { locale: resolveLocale(language) });
}

export type PeriodKey = "all" | "week" | "month" | "year" | "custom";

export interface PeriodRange {
  start?: string;
  end?: string;
}

export const toIsoDay = (date: Date) => format(date, "yyyy-MM-dd");

/** Locale-appropriate short date: "01/09/2026" / "09/01/2026". */
export function formatDisplayDate(date: Date | undefined, language?: string): string {
  if (!date) return "";

  return format(date, "P", { locale: resolveLocale(language) });
}

/**
 * Calendar ranges, not rolling windows: "this month" means the current month,
 * matching the way the register groups entries.
 *
 * The week respects the active locale's first day — pt-BR and en disagree on
 * whether it starts on Sunday or Monday, and date-fns already knows that.
 */
export function resolvePeriodRange(
  period: PeriodKey,
  language?: string,
  custom?: PeriodRange,
  now: Date = new Date()
): PeriodRange {
  const locale = resolveLocale(language);

  switch (period) {
    case "week":
      return {
        start: toIsoDay(startOfWeek(now, { locale })),
        end: toIsoDay(endOfWeek(now, { locale })),
      };
    case "month":
      return { start: toIsoDay(startOfMonth(now)), end: toIsoDay(endOfMonth(now)) };
    case "year":
      return { start: toIsoDay(startOfYear(now)), end: toIsoDay(endOfYear(now)) };
    case "custom":
      return { start: custom?.start, end: custom?.end };
    case "all":
    default:
      return {};
  }
}
