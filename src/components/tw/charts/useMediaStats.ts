import type { ChartOptions } from "chart.js";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import "./chartSetup";

import { useChartTheme } from "./useChartTheme";

import { MediaLogWithMedia } from "@/querries/media/logged";
import { MediaStatusEnum, MediaTypeEnum } from "@/types/media";
import { monthKey, parseIsoDate } from "@/utils/date";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyTypeCount = (): Record<MediaTypeEnum, number> =>
  Object.values(MediaTypeEnum).reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<MediaTypeEnum, number>);

/**
 * Aggregations for the statistics views, computed over **log entries** rather
 * than over the library: the charts describe what was consumed in the selected
 * period, not what is sitting on the shelf.
 *
 * This is also what makes "logs by day of the week" honest — the previous
 * version counted `media.createdAt`, i.e. the day a title was added.
 */
export function useMediaStats(logs?: MediaLogWithMedia[]) {
  const { t } = useTranslation("media");
  const { series, text, grid, ink } = useChartTheme();

  const entries = useMemo(() => logs ?? [], [logs]);
  const totalLogs = entries.length;

  const totalTitles = useMemo(
    () => new Set(entries.map((log) => log.mediaId)).size,
    [entries]
  );

  /* The ring answers "what is on the shelf", so it counts a title once even
     when it has several logs. */
  const groupedByType = useMemo(() => {
    const counts = emptyTypeCount();
    const seen = new Set<string>();

    for (const log of entries) {
      const type = log.media?.type;
      if (!type || !(type in counts)) continue;

      const key = `${type}:${log.mediaId}`;
      if (seen.has(key)) continue;

      seen.add(key);
      counts[type]++;
    }

    return counts;
  }, [entries]);

  const groupedByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of entries) {
      if (!log.status) continue;
      counts[log.status] = (counts[log.status] || 0) + 1;
    }
    return counts;
  }, [entries]);

  const groupedByMonth = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of entries) {
      const key = monthKey(log.date);
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.fromEntries(
      Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
    );
  }, [entries]);

  const groupedByWeekDay = useMemo(() => {
    const counts = Array(7).fill(0) as number[];
    for (const log of entries) {
      const date = parseIsoDate(log.date);
      if (!date) continue;
      counts[date.getDay()]++;
    }
    return counts;
  }, [entries]);

  const groupedByDecade = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of entries) {
      const release = log.media?.releaseDate;
      if (!release) continue;
      const year = parseInt(release.slice(0, 4));
      if (isNaN(year)) continue;
      const decade = `${Math.floor(year / 10) * 10}s`;
      counts[decade] = (counts[decade] || 0) + 1;
    }
    return Object.fromEntries(
      Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))
    );
  }, [entries]);

  const ratingDistribution = useMemo(() => {
    const counts = Array.from({ length: 10 }, (_, i) => ({
      label: String(i + 1),
      count: 0,
    }));
    for (const log of entries) {
      if (log.rating != null && log.rating >= 1 && log.rating <= 10) {
        counts[Math.floor(log.rating) - 1].count++;
      }
    }
    return counts;
  }, [entries]);

  const topLogged = useMemo(() => {
    const byMedia = new Map<number, { title: string; count: number }>();

    for (const log of entries) {
      const current = byMedia.get(log.mediaId);
      if (current) current.count++;
      else byMedia.set(log.mediaId, { title: log.media?.title ?? "", count: 1 });
    }

    return [...byMedia.values()].sort((a, b) => b.count - a.count).slice(0, 10);
  }, [entries]);

  const averageRating = useMemo(() => {
    const rated = entries.filter((log) => log.rating != null);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, log) => sum + (log.rating ?? 0), 0) / rated.length;
  }, [entries]);

  const completionRate = useMemo(() => {
    if (!totalLogs) return 0;
    const finished = groupedByStatus[MediaStatusEnum.FINISHED] ?? 0;
    return Math.round((finished / totalLogs) * 100);
  }, [groupedByStatus, totalLogs]);

  /* Only types with at least one log belong in the ring and its legend;
     zero slices add noise without adding information. */
  const typeBreakdown = useMemo(
    () =>
      Object.values(MediaTypeEnum)
        .map((type, index) => ({
          type,
          label: t(`type.${type}`),
          count: groupedByType[type] ?? 0,
          color: series[index % series.length],
        }))
        .filter((entry) => entry.count > 0)
        .sort((a, b) => b.count - a.count),
    [groupedByType, series, t]
  );

  const typeChartData = useMemo(
    () => ({
      labels: typeBreakdown.map((entry) => entry.label),
      datasets: [
        {
          data: typeBreakdown.map((entry) => entry.count),
          backgroundColor: typeBreakdown.map((entry) => entry.color),
          borderWidth: 0,
          spacing: 2,
        },
      ],
    }),
    [typeBreakdown]
  );

  const decadeChartData = useMemo(
    () => ({
      labels: Object.keys(groupedByDecade),
      datasets: [
        {
          label: t("home.chart.byDecade"),
          data: Object.values(groupedByDecade),
          backgroundColor: ink,
          borderRadius: 4,
          borderWidth: 0,
          maxBarThickness: 56,
        },
      ],
    }),
    [groupedByDecade, ink, t]
  );

  const weekDayChartData = useMemo(
    () => ({
      labels: WEEK_DAYS.map((day) => t(`home.chart.weekDays.${day}`)),
      datasets: [
        {
          label: t("home.chart.byWeekDay"),
          data: groupedByWeekDay,
          backgroundColor: ink,
          borderRadius: 4,
          borderWidth: 0,
          maxBarThickness: 56,
        },
      ],
    }),
    [groupedByWeekDay, ink, t]
  );

  const ratingChartData = useMemo(
    () => ({
      labels: ratingDistribution.map((r) => r.label),
      datasets: [
        {
          label: t("home.chart.byRating"),
          data: ratingDistribution.map((r) => r.count),
          backgroundColor: ink,
          borderRadius: 4,
          borderWidth: 0,
          maxBarThickness: 56,
        },
      ],
    }),
    [ratingDistribution, ink, t]
  );

  const monthChartData = useMemo(
    () => ({
      labels: Object.keys(groupedByMonth).map((key) => {
        const [year, month] = key.split("-");
        return `${month}/${year.slice(2)}`;
      }),
      datasets: [
        {
          label: t("home.chart.byMonth"),
          data: Object.values(groupedByMonth),
          backgroundColor: ink,
          borderRadius: 4,
          borderWidth: 0,
          maxBarThickness: 56,
        },
      ],
    }),
    [groupedByMonth, ink, t]
  );

  const doughnutOptions = useMemo<ChartOptions<"doughnut">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
    }),
    []
  );

  const barOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          border: { display: false },
          ticks: { color: text, maxRotation: 0 },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          ticks: { stepSize: 1, color: text, padding: 6 },
          grid: { color: grid },
        },
      },
    }),
    [text, grid]
  );

  return {
    totalLogs,
    totalTitles,
    averageRating,
    completionRate,
    groupedByStatus,
    topLogged,
    typeBreakdown,
    typeChartData,
    decadeChartData,
    weekDayChartData,
    monthChartData,
    ratingChartData,
    doughnutOptions,
    barOptions,
  };
}
