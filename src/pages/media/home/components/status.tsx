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

import { MediaResponse } from "@/types/logged"
import { MediaTypeEnum } from "@/types/media";

interface StatusDataProps {
  data?: MediaResponse[]
}

export const StatusData = ({ data }: StatusDataProps) => {
  const { t } = useTranslation("media");
  ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

  const TYPE_COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

  const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const STATUS_COLORS: Record<string, string> = {
    finished:    "#4BC0C0",
    in_progress: "#36A2EB",
    on_hold:     "#FFCE56",
    dropped:     "#FF6384",
    following:   "#9966FF",
  };

  const DOUGHNUT_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "bottom" as const },
    },
  };

  const BAR_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  const emptyTypeCount = (): Record<MediaTypeEnum, number> =>
    Object.values(MediaTypeEnum).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as Record<MediaTypeEnum, number>);
  
  const groupedByType = useMemo(
    () => data?.reduce((acc, item) => {
      if (item.type in acc) acc[item.type as MediaTypeEnum]++;
      return acc;
    }, emptyTypeCount()) ?? emptyTypeCount(),
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

  const typeChartData = useMemo(
    () =>
      groupedByType && {
        labels: Object.keys(groupedByType).map((type) => t(`type.${type}`)),
        datasets: [
          {
            data: Object.values(groupedByType),
            backgroundColor: TYPE_COLORS,
            borderWidth: 2,
            borderColor: "transparent",
          },
        ],
      },
    [groupedByType, t]
  );

  const decadeChartData = useMemo(
    () => ({
      labels: Object.keys(groupedByDecade),
      datasets: [
        {
          label: t("home.chart.byDecade"),
          data: Object.values(groupedByDecade),
          backgroundColor: "#36A2EB",
          borderRadius: 4,
          borderWidth: 0,
        },
      ],
    }),
    [groupedByDecade, t]
  );

  const weekDayChartData = useMemo(
    () => ({
      labels: WEEK_DAYS.map((day) => t(`home.chart.weekDays.${day}`)),
      datasets: [
        {
          label: t("home.chart.byWeekDay"),
          data: groupedByWeekDay,
          backgroundColor: groupedByWeekDay.map((_, i) =>
            i === 0 || i === 6 ? "#FF6384" : "#36A2EB"
          ),
          borderRadius: 4,
          borderWidth: 0,
        },
      ],
    }),
    [groupedByWeekDay, t]
  );

  const groupedByStatus = useMemo(
    () =>
      data?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) ?? {},
    [data]
  );

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
   
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
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

  const ratingChartData = useMemo(() => ({
    labels: ratingDistribution.map((r) => r.label),
    datasets: [{
      label: t("home.chart.byRating"),
      data: ratingDistribution.map((r) => r.count),
      backgroundColor: ratingDistribution.map((_, i) => {
        if (i == 10) return "#F44584";
        if (i >= 7) return "#4BC0C0";
        if (i >= 4) return "#FFCE56";
        return "#FF6384";
      }),
      borderRadius: 4,
      borderWidth: 0,
    }],
  }), [ratingDistribution, t]);

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

  return(
    <div className="grid grid-cols-3 gap-3">
      <div className="col-span-2 sm:col-span-3 md:col-span-5 rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          {t("home.stats.total")}
        </p>
        <p className="text-3xl font-bold">{data?.length ?? 0}</p>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">{t("home.chart.byType")}</h3>
        <div className="h-64">
          {typeChartData && <Doughnut data={typeChartData} options={DOUGHNUT_OPTIONS} />}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">{t("home.chart.byStatus")}</h3>
        <div className="h-64">
          <Doughnut data={statusChartData} options={DOUGHNUT_OPTIONS} />
        </div>
      </div>


      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">{t("home.chart.byRating")}</h3>
        <div className="h-64">
          <Bar data={ratingChartData} options={BAR_OPTIONS} />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">{t("home.chart.byMonth")}</h3>
        <div className="h-64">
          <Bar data={monthChartData} options={BAR_OPTIONS} />
        </div>
      </div>


      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">{t("home.chart.byDecade")}</h3>
        <div className="h-64">
          <Bar data={decadeChartData} options={BAR_OPTIONS} />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium mb-4">{t("home.chart.byWeekDay")}</h3>
        <div className="h-64">
          <Bar data={weekDayChartData} options={BAR_OPTIONS} />
        </div>
      </div>

      {topLogged.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
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
  )

}