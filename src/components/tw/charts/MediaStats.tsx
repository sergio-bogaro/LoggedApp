import { ReactNode } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

import { ChartBlock } from "./ChartBlock";
import { StatIndexItem, StatsHeadline } from "./StatsHeadline";
import { useMediaStats } from "./useMediaStats";

import { SectionHeading } from "@/components/tw/generic/SectionHeading";
import { MediaLogWithMedia } from "@/querries/media/logged";
import { MediaStatusEnum } from "@/types/media";

interface MediaStatsProps {
  logs?: MediaLogWithMedia[];
}

/* Fixed order so the index keeps the same reading sequence across media types. */
const STATUS_ORDER = [
  MediaStatusEnum.FINISHED,
  MediaStatusEnum.IN_PROGRESS,
  MediaStatusEnum.FOLLOWING,
  MediaStatusEnum.ON_HOLD,
  MediaStatusEnum.DROPPED,
];

const StatsSection = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <section className="space-y-5">
      <SectionHeading>{title}</SectionHeading>

      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">{children}</div>
    </section>
  );
};

/*
 * "The shape of your consumption": one dominant figure, a typographic index of
 * the statuses, then charts grouped by the question they answer. Shared by the
 * home register and the per-type library — only the data differs.
 */
export const MediaStats = ({ logs }: MediaStatsProps) => {
  const { t } = useTranslation("media");
  const {
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
  } = useMediaStats(logs);

  const index: StatIndexItem[] = [
    {
      label: t("list.chart.avgRating"),
      value: averageRating > 0 ? averageRating.toFixed(1) : "—",
    },
    ...STATUS_ORDER
      .filter((status) => (groupedByStatus[status] ?? 0) > 0)
      .map((status) => ({
        label: t(`status.${status}`),
        value: groupedByStatus[status] ?? 0,
        hint:
          status === MediaStatusEnum.FINISHED && completionRate > 0
            ? t("stats.finishedHint", { percent: completionRate })
            : undefined,
      })),
  ];

  return (
    <div className="space-y-10">
      <StatsHeadline
        label={t("stats.headline")}
        value={totalLogs}
        caption={t("stats.headlineCaption", { count: totalTitles })}
        index={index}
      />

      <StatsSection title={t("stats.sections.consumption")}>
        <ChartBlock title={t("home.chart.byType")}>
          <Doughnut data={typeChartData} options={doughnutOptions} />
        </ChartBlock>
      </StatsSection>

      <StatsSection title={t("stats.sections.when")}>
        <ChartBlock title={t("home.chart.byMonth")}>
          <Bar data={monthChartData} options={barOptions} />
        </ChartBlock>

        <ChartBlock title={t("home.chart.byWeekDay")}>
          <Bar data={weekDayChartData} options={barOptions} />
        </ChartBlock>

        <ChartBlock title={t("home.chart.byDecade")}>
          <Bar data={decadeChartData} options={barOptions} />
        </ChartBlock>
      </StatsSection>

      <StatsSection title={t("stats.sections.rating")}>
        <ChartBlock title={t("home.chart.byRating")}>
          <Bar data={ratingChartData} options={barOptions} />
        </ChartBlock>

        {topLogged.length > 0 && (
          <ChartBlock title={t("home.chart.topLogged")}>
            <Bar data={topLoggedChartData} options={horizontalBarOptions} />
          </ChartBlock>
        )}
      </StatsSection>
    </div>
  );
};
