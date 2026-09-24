import { useMemo } from "react";

import { useAppSelector } from "@/store/settings/hooks";

export interface ChartTheme {
  series: string[];
  text: string;
  grid: string;
}

const FALLBACK_SERIES = ["#3e6fa8", "#7c5ba6", "#a8516e", "#2f7a73", "#8f6a24", "#b5651d"];

/* The categorical ramp is the single source of data color: one hue per media
 * type, shared by charts and type marks. */
const CATEGORICAL_VARS = [
  "--type-film",
  "--type-anime",
  "--type-manga",
  "--type-game",
  "--type-book",
  "--type-music",
] as const;

const readVar = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

/**
 * Resolves the active theme's data colors from the CSS custom properties, so
 * charts follow the canonical light/dark themes instead of Chart.js defaults.
 */
export function useChartTheme(): ChartTheme {
  const theme = useAppSelector((state) => state.ui.theme);

  return useMemo(() => {
    // The theme class lives on <html>, outside React, so reading it here is the
    // only way to stay in sync. Recompute on every theme switch.
    void theme;

    return {
      series: CATEGORICAL_VARS.map((name, index) => readVar(name, FALLBACK_SERIES[index])),
      text: readVar("--muted-foreground", "#6e7276"),
      grid: readVar("--border", "#dcdcd6"),
    };
  }, [theme]);
}
