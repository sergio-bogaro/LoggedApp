import { BarChart3 } from "lucide-react";
import { ReactNode } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

import { ChartBlock } from "./ChartBlock";
import { StatIndexItem, StatsHeadline } from "./StatsHeadline";
import { useMediaStats } from "./useMediaStats";

import { EmptyState } from "@/components/tw/generic/EmptyState";
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
    typeBreakdown,
    typeChartData,
    decadeChartData,
    weekDayChartData,
    monthChartData,
    ratingChartData,
    doughnutOptions,
    barOptions,
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

  if (totalLogs === 0) {
    return (
      <EmptyState
        icon={<BarChart3 aria-hidden="true" className="size-4" />}
        title={t("stats.empty.title")}
        description={t("stats.empty.description")}
      />
    );
  }

  return (
    <div className="space-y-12">
      <StatsHeadline
        label={t("stats.headline")}
        value={totalLogs}
        caption={t("stats.headlineCaption", { count: totalTitles })}
        index={index}
        indexPlacement="inline"
      />

      <StatsSection title={t("stats.sections.consumption")}>
        <div className="md:col-span-2 md:grid md:max-w-[900px] md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-center md:gap-10">
          <ChartBlock title={t("home.chart.byType")} chartClassName="h-56">
            <Doughnut data={typeChartData} options={doughnutOptions} />

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-step-5 leading-none tabular-nums">{totalTitles}</span>
              <span className="mt-1 text-step-0 text-muted-foreground">{t("stats.titles")}</span>
            </div>
          </ChartBlock>

          <div className="mt-4 max-w-[360px] md:mt-0">
            {typeBreakdown.map((entry) => (
              <div
                key={entry.type}
                className="flex items-center gap-2.5 border-b border-border/60 py-2 last:border-0"
              >
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ background: entry.color }}
                />
                <span className="min-w-0 flex-1 truncate text-step-1">{entry.label}</span>
                <span className="font-serif text-step-2 tabular-nums">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
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
          <section className="min-w-0">
            <h3 className="mb-3 text-step-2 font-medium">{t("home.chart.topLogged")}</h3>

            <ol className="divide-y divide-border/60">
              {topLogged.map((item, position) => (
                <li
                  key={`${item.title}-${position}`}
                  className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 py-2"
                >
                  <span className="font-serif text-step-1 tabular-nums text-muted-foreground">
                    {String(position + 1).padStart(2, "0")}
                  </span>

                  <span className="truncate text-step-1">{item.title}</span>

                  <span className="font-serif text-step-2 tabular-nums">{item.count}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </StatsSection>
    </div>
  );
};
