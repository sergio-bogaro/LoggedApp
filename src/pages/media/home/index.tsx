import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { LibraryData } from "./components/library";
import { StatusData } from "./components/status";

import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { MediaCardSkeleton } from "@/components/tw/generic/mediaCardSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaResponse } from "@/types/logged";

const CAROUSEL_LIMIT = 10;

const MediaHomePage = () => {
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);

  const { data: allData, isFetching } = useQuery<MediaResponse[]>({
    queryKey: ["media"],
    queryFn: () => getMediaList(user!.id),
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  const { data: recentlyLoggedData, isFetching: isFetchingRecent } = useQuery<MediaResponse[]>({
    queryKey: ["media", "recentlyLogged"],
    queryFn: () => getMediaList(user!.id, { hasLogs: true, limit: CAROUSEL_LIMIT }),
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  const isLoading = isFetching || isFetchingRecent;

  return (
    <div className="w-full h-full">
      <h1 className="text-2xl font-bold mb-4">{t("home.title")}</h1>

      <DataExhibition isFetching={isLoading} skeleton={<MediaCardSkeleton />}>
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
