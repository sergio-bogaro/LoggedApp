import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { StatusData } from "./components/status";

import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { LogStream } from "@/components/tw/log/LogStream";
import { LogStreamSkeleton } from "@/components/tw/log/LogStreamSkeleton";
import { MediaLibrary } from "@/components/tw/media/mediaLibrary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaResponse } from "@/types/logged";
import { DEFAULT_STALE_TIME } from "@/utils/conts";

const MediaHomePage = () => {
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setBreadcrumbs([{ label: t("label"), to: "/media/home" }]));
  }, [dispatch, t]);

  const { data, isFetching, isError, error } = useQuery<MediaResponse[]>({
    queryKey: ["media"],
    queryFn: () => getMediaList(user!.id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  /* The register only holds entries that actually have logs. Titles that are
     tracked but never logged stay in the library. */
  const logged = useMemo(
    () => (data ?? []).filter((item) => item.logCount > 0),
    [data]
  );

  return (
    <div className="w-full h-full">
      <PageHeader title={t("home.title")} />

      <DataExhibition
        isFetching={isFetching}
        isError={isError}
        isLoading={isFetching && !data}
        skeleton={<LogStreamSkeleton />}
        errorMessage={`${t("errorLoading", { ns: "common" })} ${error?.message ?? ""}`}
      >
        <Tabs defaultValue="log">
          <TabsList>
            <TabsTrigger value="log">{t("home.tabs.log")}</TabsTrigger>
            <TabsTrigger value="stats">{t("home.tabs.stats")}</TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-10">
            <LogStream items={logged} />
            <MediaLibrary data={data} sections={["favorites"]} />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <StatusData data={data} />
          </TabsContent>
        </Tabs>
      </DataExhibition>
    </div>
  );
};

export default MediaHomePage;
