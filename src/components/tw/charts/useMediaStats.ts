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
  const { series, text, grid } = useChartTheme();

  const entries = useMemo(() => logs ?? [], [logs]);
  const totalLogs = entries.length;

  const totalTitles = useMemo(
    () => new Set(entries.map((log) => log.mediaId)).size,
    [entries]
  );

  const groupedByType = useMemo(() => {
    const counts = emptyTypeCount();
    for (const log of entries) {
      const type = log.media?.type;
      if (type && type in counts) counts[type]++;
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

  const typeChartData = useMemo(
    () => ({
      labels: Object.keys(groupedByType).map((type) => t(`type.${type}`)),
      datasets: [
        {
          data: Object.values(groupedByType),
          backgroundColor: Object.keys(groupedByType).map(
            (_, i) => series[i % series.length]
          ),
          borderWidth: 2,
          borderColor: "transparent",
        },
      ],
    }),
    [groupedByType, series, t]
  );

  const decadeChartData = useMemo(
    () => ({
      labels: Object.keys(groupedByDecade),
      datasets: [
        {
          label: t("home.chart.byDecade"),
          data: Object.values(groupedByDecade),
          backgroundColor: series[1],
          borderRadius: 4,
          borderWidth: 0,
        },
      ],
    }),
    [groupedByDecade, series, t]
  );

  const weekDayChartData = useMemo(
    () => ({
      labels: WEEK_DAYS.map((day) => t(`home.chart.weekDays.${day}`)),
      datasets: [
        {
          label: t("home.chart.byWeekDay"),
          data: groupedByWeekDay,
          backgroundColor: groupedByWeekDay.map((_, i) =>
            i === 0 || i === 6 ? series[4] : series[1]
          ),
          borderRadius: 4,
          borderWidth: 0,
        },
      ],
    }),
    [groupedByWeekDay, series, t]
  );

  const ratingChartData = useMemo(
    () => ({
      labels: ratingDistribution.map((r) => r.label),
      datasets: [
        {
          label: t("home.chart.byRating"),
          data: ratingDistribution.map((r) => r.count),
          backgroundColor: ratingDistribution.map((_, i) => {
            if (i === 9) return series[4];
            if (i >= 6) return series[0];
            if (i >= 3) return series[2];
            return series[3];
          }),
          borderRadius: 4,
          borderWidth: 0,
        },
      ],
    }),
    [ratingDistribution, series, t]
  );

  const topLoggedChartData = useMemo(
    () => ({
      labels: topLogged.map((item) =>
        item.title.length > 20 ? `${item.title.slice(0, 18)}…` : item.title
      ),
      datasets: [
        {
          label: t("home.chart.topLogged"),
          data: topLogged.map((item) => item.count),
          backgroundColor: series[3],
          borderRadius: 4,
          borderWidth: 0,
        },
      ],
    }),
    [topLogged, series, t]
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
          backgroundColor: series[1],
          borderRadius: 4,
          borderWidth: 0,
        },
      ],
    }),
    [groupedByMonth, series, t]
  );

  const doughnutOptions = useMemo<ChartOptions<"doughnut">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { color: text },
        },
      },
    }),
    [text]
  );

  const barOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: text }, grid: { color: grid } },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: text },
          grid: { color: grid },
        },
      },
    }),
    [text, grid]
  );

  const horizontalBarOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      ...barOptions,
      indexAxis: "y",
      scales: {
        x: { beginAtZero: true, ticks: { stepSize: 1, color: text }, grid: { color: grid } },
        y: { ticks: { color: text }, grid: { display: false } },
      },
    }),
    [barOptions, text, grid]
  );

  return {
    totalLogs,
    totalTitles,
    averageRating,
    completionRate,
    groupedByStatus,
    topLogged,
    typeChartData,
    decadeChartData,
    weekDayChartData,
    monthChartData,
    ratingChartData,
    topLoggedChartData,
    doughnutOptions,
    barOptions,
    horizontalBarOptions,
  };
}
