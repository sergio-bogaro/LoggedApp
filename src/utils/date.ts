import { format, type Locale } from "date-fns";
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
function parseIsoDate(iso?: string | null): Date | null {
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
