import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { MediaStats } from "@/components/tw/charts/MediaStats";
import { MediaStatsSkeleton } from "@/components/tw/charts/MediaStatsSkeleton";
import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { ViewModeToggle } from "@/components/tw/generic/ViewModeToggle";
import { LogStream } from "@/components/tw/log/LogStream";
import { LogStreamSkeleton } from "@/components/tw/log/LogStreamSkeleton";
import { PeriodFilter } from "@/components/tw/log/PeriodFilter";
import { MediaGridSkeleton } from "@/components/tw/media/gridSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaLogs } from "@/hooks/useMediaLogs";
import { useAppDispatch, useAppSelector } from "@/store/settings/hooks";
import { setBreadcrumbs, setLibraryViewMode, ViewMode } from "@/store/settings/slice";
import { PeriodKey, PeriodRange, resolvePeriodRange } from "@/utils/date";

const MediaHomePage = () => {
  const { i18n, t } = useTranslation("media");
  const dispatch = useAppDispatch();
  const { libraryViewMode } = useAppSelector((state) => state.ui);

  const [tab, setTab] = useState("log");
  const [period, setPeriod] = useState<PeriodKey>("year");
  const [custom, setCustom] = useState<PeriodRange>({});

  useEffect(() => {
    dispatch(setBreadcrumbs([{ label: t("label"), to: "/media/home" }]));
  }, [dispatch, t]);

  const range = useMemo(
    () => resolvePeriodRange(period, i18n.language, custom),
    [period, i18n.language, custom]
  );

  const { data: logs, isFetching, isError, error } = useMediaLogs(range);

  /* What the range field shows: the effective range, or — when the period is
     unbounded — the span of the logs that actually exist. */
  const displayRange = useMemo(() => {
    if (range.start || range.end) return range;

    const dates = (logs ?? []).map((log) => log.date).filter(Boolean).sort();
    return dates.length > 0 ? { start: dates[0], end: dates[dates.length - 1] } : {};
  }, [range, logs]);

  /* Switching to custom starts from what was on screen, so a range you were
     already looking at never has to be retyped. */
  const handlePeriodChange = (next: PeriodKey) => {
    if (next === "custom" && (displayRange.start || displayRange.end)) {
      setCustom({ start: displayRange.start, end: displayRange.end });
    }

    setPeriod(next);
  };

  /* Changing the period starts a new query, so there is no data to show until
     it resolves. The skeleton is scoped to the content — the tabs and the
     filter stay mounted, otherwise the control you just used disappears. */
  const isLoading = isFetching && !logs;
  const errorMessage = `${t("errorLoading", { ns: "common" })} ${error?.message ?? ""}`;

  const handleViewModeChange = (mode: ViewMode) => dispatch(setLibraryViewMode(mode));
  const isGrid = libraryViewMode === "grid";

  return (
    <div className="w-full h-full">
      <PageHeader title={t("home.title")} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="log">{t("home.tabs.log")}</TabsTrigger>
          <TabsTrigger value="stats">{t("home.tabs.stats")}</TabsTrigger>
        </TabsList>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <PeriodFilter
            value={period}
            onChange={handlePeriodChange}
            custom={custom}
            onCustomChange={setCustom}
            resolvedRange={displayRange}
          />

          {tab === "log" && (
            <ViewModeToggle
              value={libraryViewMode}
              onChange={handleViewModeChange}
              className="self-end"
            />
          )}
        </div>

        <TabsContent value="log" className="mt-6">
          <DataExhibition
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            errorMessage={errorMessage}
            skeleton={isGrid ? <MediaGridSkeleton /> : <LogStreamSkeleton />}
          >
            <LogStream logs={logs ?? []} filtered={period !== "all"} viewMode={libraryViewMode} />
          </DataExhibition>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <DataExhibition
            isLoading={isLoading}
            isFetching={isFetching}
            isError={isError}
            errorMessage={errorMessage}
            skeleton={<MediaStatsSkeleton />}
          >
            <MediaStats logs={logs} />
          </DataExhibition>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaHomePage;
