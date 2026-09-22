import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { LibraryData } from "./components/library";
import { StatusData } from "./components/status";

import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { MediaCardSkeleton } from "@/components/tw/generic/mediaCardSkeleton";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaResponse } from "@/types/logged";

const CAROUSEL_LIMIT = 10;

const MediaHomePage = () => {
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setBreadcrumbs([{ label: t("label"), to: "/media/home" }]));
  }, [dispatch, t]);

  const { data: allData, isFetching, isError, error } = useQuery<MediaResponse[]>({
    queryKey: ["media"],
    queryFn: () => getMediaList(user!.id),
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  const { data: recentlyLoggedData, isFetching: isFetchingRecent, isError: isErrorRecent, error: errorRecent } = useQuery<MediaResponse[]>({
    queryKey: ["media", "recentlyLogged"],
    queryFn: () => getMediaList(user!.id, { hasLogs: true, limit: CAROUSEL_LIMIT }),
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  const isLoading = isFetching || isFetchingRecent;
  const isInitialLoading = isLoading && (!allData || !recentlyLoggedData);
  const isErrorCombined = isError || isErrorRecent;
  const errorMessageCombined = error?.message || errorRecent?.message || "";

  return (
    <div className="w-full h-full">
      <PageHeader title={t("home.title")} />

      <DataExhibition
        isFetching={isLoading}
        isError={isErrorCombined}
        isLoading={isInitialLoading}
        skeleton={<MediaCardSkeleton />}
        errorMessage={`${t("errorLoading", { ns: "common" })} ${errorMessageCombined}`}
      >
        <Tabs defaultValue="list" className="mt-4">
          <TabsList>
            <TabsTrigger value="list">{t("home.tabs.list")}</TabsTrigger>
            <TabsTrigger value="stats">{t("home.tabs.stats")}</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <LibraryData data={allData} recentlyLoggedData={recentlyLoggedData} />
          </TabsContent>

          <TabsContent value="stats" className="mt-4 space-y-6">
            <StatusData data={allData} />
          </TabsContent>
        </Tabs>
      </DataExhibition>
    </div>
  );
};

export default MediaHomePage;
