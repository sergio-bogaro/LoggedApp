import type { ChartOptions } from "chart.js";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import "./chartSetup";

import { useChartTheme } from "./useChartTheme";

import { MediaResponse } from "@/types/logged";
import { MediaStatusEnum, MediaTypeEnum } from "@/types/media";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_COLOR_INDEX: Record<MediaStatusEnum, number> = {
  [MediaStatusEnum.FINISHED]: 0,
  [MediaStatusEnum.IN_PROGRESS]: 1,
  [MediaStatusEnum.ON_HOLD]: 2,
  [MediaStatusEnum.DROPPED]: 3,
  [MediaStatusEnum.FOLLOWING]: 4,
};

const emptyTypeCount = (): Record<MediaTypeEnum, number> =>
  Object.values(MediaTypeEnum).reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<MediaTypeEnum, number>);

/**
 * Every aggregation the media statistics views need, plus theme-aware chart
 * data and options. Shared by the home and per-type list statistics tabs.
 */
export function useMediaStats(data?: MediaResponse[]) {
  const { t } = useTranslation("media");
  const { series, text, grid } = useChartTheme();

  const total = data?.length ?? 0;

  const groupedByType = useMemo(
    () =>
      data?.reduce((acc, item) => {
        if (item.type in acc) acc[item.type as MediaTypeEnum]++;
        return acc;
      }, emptyTypeCount()) ?? emptyTypeCount(),
    [data]
  );

  const groupedByStatus = useMemo(
    () =>
      data?.reduce((acc, item) => {
        if (!item.status) return acc;
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) ?? {},
    [data]
  );

  const groupedByDecade = useMemo(() => {
    if (!data) return {};

    const groups = data.reduce((acc, item) => {
      if (!item.releaseDate) return acc;
      const year = parseInt(item.releaseDate.slice(0, 4));
      if (isNaN(year)) return acc;
      const decade = `${Math.floor(year / 10) * 10}s`;
      acc[decade] = (acc[decade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    );
  }, [data]);

  const groupedByWeekDay = useMemo(() => {
    const counts = Array(7).fill(0) as number[];

    data?.forEach((item) => {
      if (!item.createdAt) return;
      const day = new Date(item.createdAt).getDay(); // 0 = Sun ... 6 = Sat
      counts[day]++;
    });

    return counts;
  }, [data]);

  const groupedByMonth = useMemo(() => {
    const counts: Record<string, number> = {};

    data?.forEach((item) => {
      const date = new Date(item.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.fromEntries(
      Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
    );
  }, [data]);

  const ratingDistribution = useMemo(() => {
    const counts = Array.from({ length: 10 }, (_, i) => ({
      label: String(i + 1),
      count: 0,
    }));
    data?.forEach((item) => {
      if (item.rating != null && item.rating >= 1 && item.rating <= 10) {
        counts[Math.floor(item.rating) - 1].count++;
      }
    });
    return counts;
  }, [data]);

  const topLogged = useMemo(
    () =>
      [...(data ?? [])]
        .filter((item) => item.logCount > 0)
        .sort((a, b) => b.logCount - a.logCount)
        .slice(0, 10),
    [data]
  );

  const averageRating = useMemo(() => {
    if (!data) return 0;
    const rated = data.filter((item) => item.rating != null);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) / rated.length;
  }, [data]);

  const completionRate = useMemo(() => {
    if (!total) return 0;
    const finished = data?.filter((item) => item.status === MediaStatusEnum.FINISHED).length ?? 0;
    return Math.round((finished / total) * 100);
  }, [data, total]);

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

  const statusChartData = useMemo(
    () => ({
      labels: Object.keys(groupedByStatus).map((s) => t(`status.${s}`)),
      datasets: [
        {
          data: Object.values(groupedByStatus),
          backgroundColor: Object.keys(groupedByStatus).map(
            (s) => series[STATUS_COLOR_INDEX[s as MediaStatusEnum] ?? 0]
          ),
          borderWidth: 2,
          borderColor: "transparent",
        },
      ],
    }),
    [groupedByStatus, series, t]
  );

  const completionChartData = useMemo(() => {
    const finished = groupedByStatus[MediaStatusEnum.FINISHED] ?? 0;
    const others = total - finished;

    return {
      labels: [t(`status.${MediaStatusEnum.FINISHED}`), t("list.chart.notFinished")],
      datasets: [
        {
          data: [finished, others],
          backgroundColor: [series[0], grid],
          borderWidth: 2,
          borderColor: "transparent",
        },
      ],
    };
  }, [groupedByStatus, total, series, grid, t]);

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
          data: topLogged.map((item) => item.logCount),
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
    total,
    averageRating,
    completionRate,
    groupedByStatus,
    topLogged,
    typeChartData,
    statusChartData,
    completionChartData,
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
