import { Bar, Doughnut } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

import { ChartCard, StatCard } from "@/components/tw/charts/ChartCard";
import { useMediaStats } from "@/components/tw/charts/useMediaStats";
import { MediaResponse } from "@/types/logged";

interface ListStatusDataProps {
  data?: MediaResponse[];
}

export const ListStatusData = ({ data }: ListStatusDataProps) => {
  const { t } = useTranslation("media");
  const {
    total,
    averageRating,
    completionRate,
    topLogged,
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
  } = useMediaStats(data);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label={t("home.stats.total")}>
        <p className="text-3xl font-bold">{total}</p>
      </StatCard>

      <StatCard label={t("list.chart.avgRating")}>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold">
            {averageRating > 0 ? averageRating.toFixed(1) : "-"}
          </p>
          <p className="mb-1 text-sm text-muted-foreground">/ 10</p>
        </div>
      </StatCard>

      <ChartCard
        title={t("list.chart.completionRate")}
        ariaLabel={t("list.chart.completionRate")}
      >
        <Doughnut data={completionChartData} options={doughnutOptions} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{completionRate}%</span>
        </div>
      </ChartCard>

      <ChartCard title={t("home.chart.byStatus")} ariaLabel={t("home.chart.byStatus")}>
        <Doughnut data={statusChartData} options={doughnutOptions} />
      </ChartCard>

      <ChartCard title={t("home.chart.byRating")} ariaLabel={t("home.chart.byRating")}>
        <Bar data={ratingChartData} options={barOptions} />
      </ChartCard>

      <ChartCard title={t("home.chart.byMonth")} ariaLabel={t("home.chart.byMonth")}>
        <Bar data={monthChartData} options={barOptions} />
      </ChartCard>

      <ChartCard title={t("home.chart.byDecade")} ariaLabel={t("home.chart.byDecade")}>
        <Bar data={decadeChartData} options={barOptions} />
      </ChartCard>

      <ChartCard title={t("home.chart.byWeekDay")} ariaLabel={t("home.chart.byWeekDay")}>
        <Bar data={weekDayChartData} options={barOptions} />
      </ChartCard>

      {topLogged.length > 0 && (
        <ChartCard
          title={t("home.chart.topLogged")}
          ariaLabel={t("home.chart.topLogged")}
          className="col-span-full"
          chartClassName="h-72"
        >
          <Bar data={topLoggedChartData} options={horizontalBarOptions} />
        </ChartCard>
      )}
    </div>
  );
};
