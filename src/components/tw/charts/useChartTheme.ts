import { useMemo } from "react";

import { useAppSelector } from "@/store/settings/hooks";

export interface ChartTheme {
  series: string[];
  text: string;
  grid: string;
}

const FALLBACK_SERIES = ["#4bc0c0", "#36a2eb", "#ffce56", "#9966ff", "#ff6384"];

const readVar = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

/**
 * Resolves the active theme's data colors from the CSS custom properties, so
 * charts follow light/dark/rose-pine/green instead of Chart.js defaults.
 */
export function useChartTheme(): ChartTheme {
  const theme = useAppSelector((state) => state.ui.theme);

  return useMemo(() => {
    // The theme class lives on <html>, outside React, so reading it here is the
    // only way to stay in sync. Recompute on every theme switch.
    void theme;

    return {
      series: FALLBACK_SERIES.map((fallback, index) =>
        readVar(`--chart-${index + 1}`, fallback)
      ),
      text: readVar("--muted-foreground", "#6b7280"),
      grid: readVar("--border", "rgba(127, 127, 127, 0.2)"),
    };
  }, [theme]);
}
