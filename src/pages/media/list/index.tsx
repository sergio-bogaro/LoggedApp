import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { ListStatusData } from "./components/listStatusData";

import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { MediaCardSkeleton } from "@/components/tw/generic/mediaCardSkeleton";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { MediaLibrary } from "@/components/tw/media/mediaLibrary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaResponse } from "@/types/logged";
import { DEFAULT_STALE_TIME } from "@/utils/conts";
import { pathToMediaType } from "@/utils/mediaText";

const MediaListPage = () => {
  const { t } = useTranslation("media");
  const { type } = useParams<{ type: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const mediaType = pathToMediaType(type);
  const title = mediaType ? t(`typePlural.${mediaType}`) : "";

  useEffect(() => {
    const mediaCrumb = { label: t("label"), to: "/media/home" };
    dispatch(
      setBreadcrumbs(
        mediaType
          ? [mediaCrumb, { label: t(`typePlural.${mediaType}`) }]
          : [mediaCrumb]
      )
    );
  }, [dispatch, t, mediaType]);

  const { data: data, isFetching, isError, error } = useQuery<MediaResponse[]>({
    queryKey: ["media", "list", mediaType],
    queryFn: () =>
      getMediaList(user!.id, {
        type: mediaType,
      }),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  const { data: recentlyLoggedData, isFetching: isFetchingRecent, isError: isErrorRecent, error: errorRecent } = useQuery<MediaResponse[]>({
    queryKey: ["media", "list", mediaType, "recentlyLogged"],
    queryFn: () =>
      getMediaList(user!.id, {
        type: mediaType,
        hasLogs: true,
      }),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  const isLoading = isFetching || isFetchingRecent;
  const isInitialLoading = isLoading && (!data || !recentlyLoggedData);
  const isErrorCombined = isError || isErrorRecent;
  const errorMessageCombined = error?.message || errorRecent?.message || "";

  return (
    <div className="w-full h-full space-y-3">
      <PageHeader title={title || t("label")} />

      <DataExhibition isLoading={isInitialLoading} isFetching={isLoading} skeleton={<MediaCardSkeleton />} isError={isErrorCombined} errorMessage={`${t("errorLoading", { ns: "common" })} ${errorMessageCombined}`}>
        <Tabs defaultValue="list" className="mt-4">
          <TabsList>
            <TabsTrigger value="list">{t("home.tabs.list")}</TabsTrigger>
            <TabsTrigger value="stats">{t("home.tabs.stats")}</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <MediaLibrary data={data} recentlyLoggedData={recentlyLoggedData} mediaType={mediaType} />
          </TabsContent>

          <TabsContent value="stats" className="mt-4 space-y-6">
            <ListStatusData data={data} />
          </TabsContent>
        </Tabs>
      </DataExhibition>
    </div>
  );
};

export default MediaListPage;
