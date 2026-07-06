import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useMemo } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

import { MediaResponse } from "@/types/logged";
import { MediaStatusEnum } from "@/types/media";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ListStatusDataProps {
  data?: MediaResponse[];
}

const STATUS_COLORS: Record<string, string> = {
  [MediaStatusEnum.FINISHED]: "#4BC0C0",
  [MediaStatusEnum.IN_PROGRESS]: "#36A2EB",
  [MediaStatusEnum.ON_HOLD]: "#FFCE56",
  [MediaStatusEnum.DROPPED]: "#FF6384",
  [MediaStatusEnum.FOLLOWING]: "#9966FF",
};

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DOUGHNUT_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true, position: "bottom" as const } },
};

const BAR_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
};

export const ListStatusData = ({ data }: ListStatusDataProps) => {
  const { t } = useTranslation("media");

  const totalCount = data?.length ?? 0;

  const averageRating = useMemo(() => {
    if (!data) return 0;
    const rated = data.filter((item) => item.rating != null);
    if (rated.length === 0) return 0;
    return rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) / rated.length;
  }, [data]);

  const completionRate = useMemo(() => {
    if (!totalCount) return 0;
    const finished = data?.filter((item) => item.status === MediaStatusEnum.FINISHED).length ?? 0;
    return Math.round((finished / totalCount) * 100);
  }, [data, totalCount]);

  const groupedByStatus = useMemo(
    () =>
      data?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) ?? {},
    [data]
  );

  const completionChartData = useMemo(() => {
    const finished = groupedByStatus[MediaStatusEnum.FINISHED] ?? 0;
    const others = totalCount - finished;

    return {
      labels: [t(`status.${MediaStatusEnum.FINISHED}`), t("list.chart.notFinished")],
      datasets: [
        {
          data: [finished, others],
          backgroundColor: ["#4BC0C0", "#CBD5E1"],
          borderWidth: 2,
          borderColor: "transparent",
        },
      ],
    };
  }, [groupedByStatus, totalCount, t]);

  const statusChartData = useMemo(() => ({
    labels: Object.keys(groupedByStatus).map((s) => t(`status.${s}`)),
    datasets: [{
      data: Object.values(groupedByStatus),
      backgroundColor: Object.keys(groupedByStatus).map(
        (s) => STATUS_COLORS[s] ?? "#CBD5E1"
      ),
      borderWidth: 2,
      borderColor: "transparent",
    }],
  }), [groupedByStatus, t]);

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

  const decadeChartData = useMemo(() => ({
    labels: Object.keys(groupedByDecade),
    datasets: [{
      label: t("home.chart.byDecade"),
      data: Object.values(groupedByDecade),
      backgroundColor: "#36A2EB",
      borderRadius: 4,
      borderWidth: 0,
    }],
  }), [groupedByDecade, t]);

  const groupedByWeekDay = useMemo(() => {
    const counts = Array(7).fill(0) as number[];
    data?.forEach((item) => {
      if (!item.createdAt) return;
      const day = new Date(item.createdAt).getDay();
      counts[day]++;
    });
    return counts;
  }, [data]);

  const weekDayChartData = useMemo(() => ({
    labels: WEEK_DAYS.map((day) => t(`home.chart.weekDays.${day}`)),
    datasets: [{
      label: t("home.chart.byWeekDay"),
      data: groupedByWeekDay,
      backgroundColor: groupedByWeekDay.map((_, i) =>
        i === 0 || i === 6 ? "#FF6384" : "#36A2EB"
      ),
      borderRadius: 4,
      borderWidth: 0,
    }],
  }), [groupedByWeekDay, t]);

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

  const monthChartData = useMemo(() => ({
    labels: Object.keys(groupedByMonth).map((key) => {
      const [year, month] = key.split("-");
      return `${month}/${year.slice(2)}`;
    }),
    datasets: [{
      label: t("home.chart.byMonth"),
      data: Object.values(groupedByMonth),
      backgroundColor: "#36A2EB",
      borderRadius: 4,
      borderWidth: 0,
    }],
  }), [groupedByMonth, t]);

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

  const ratingChartData = useMemo(() => ({
    labels: ratingDistribution.map((r) => r.label),
    datasets: [{
      label: t("home.chart.byRating"),
      data: ratingDistribution.map((r) => r.count),
      backgroundColor: ratingDistribution.map((_, i) => {
        if (i === 9) return "#F44584";
        if (i >= 6) return "#4BC0C0";
        if (i >= 3) return "#FFCE56";
        return "#FF6384";
      }),
      borderRadius: 4,
      borderWidth: 0,
    }],
  }), [ratingDistribution, t]);

  const topLogged = useMemo(
    () =>
      [...(data ?? [])]
        .filter((item) => item.logCount > 0)
        .sort((a, b) => b.logCount - a.logCount)
        .slice(0, 10),
    [data]
  );

  const topLoggedChartData = useMemo(() => ({
    labels: topLogged.map((item) =>
      item.title.length > 20 ? `${item.title.slice(0, 18)}…` : item.title
    ),
    datasets: [{
      label: t("home.chart.topLogged"),
      data: topLogged.map((item) => item.logCount),
      backgroundColor: "#9966FF",
      borderRadius: 4,
      borderWidth: 0,
    }],
  }), [topLogged, t]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Total count */}
      <div className="col-span-2 sm:col-span-3 md:col-span-5 rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          {t("home.stats.total")}
        </p>
        <p className="text-3xl font-bold">{totalCount}</p>
      </div>

      {/* Average rating */}
      <div className="col-span-2 sm:col-span-3 md:col-span-5 rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          {t("list.chart.avgRating")}
        </p>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold">
            {averageRating > 0 ? averageRating.toFixed(1) : "-"}
          </p>
          <p className="text-sm text-muted-foreground mb-1">/ 10</p>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">{t("list.chart.completionRate")}</h3>
        <div className="h-64 relative">
          <Doughnut data={completionChartData} options={DOUGHNUT_OPTIONS} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold">{completionRate}%</span>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">{t("home.chart.byStatus")}</h3>
        <div className="h-64">
          <Doughnut data={statusChartData} options={DOUGHNUT_OPTIONS} />
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">{t("home.chart.byRating")}</h3>
        <div className="h-64">
          <Bar data={ratingChartData} options={BAR_OPTIONS} />
        </div>
      </div>

      {/* Added by month */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">{t("home.chart.byMonth")}</h3>
        <div className="h-64">
          <Bar data={monthChartData} options={BAR_OPTIONS} />
        </div>
      </div>

      {/* Release decade */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">{t("home.chart.byDecade")}</h3>
        <div className="h-64">
          <Bar data={decadeChartData} options={BAR_OPTIONS} />
        </div>
      </div>

      {/* Logs by day of week */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">{t("home.chart.byWeekDay")}</h3>
        <div className="h-64">
          <Bar data={weekDayChartData} options={BAR_OPTIONS} />
        </div>
      </div>

      {/* Top 10 most logged */}
      {topLogged.length > 0 && (
        <div className="col-span-3 rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium mb-4">{t("home.chart.topLogged")}</h3>
          <div className="h-72">
            <Bar
              data={topLoggedChartData}
              options={{
                ...BAR_OPTIONS,
                indexAxis: "y" as const,
                scales: {
                  x: { beginAtZero: true, ticks: { stepSize: 1 } },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
