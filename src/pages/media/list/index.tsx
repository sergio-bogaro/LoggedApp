import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { MediaStats } from "@/components/tw/charts/MediaStats";
import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { MediaCardSkeleton } from "@/components/tw/generic/mediaCardSkeleton";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { MediaLibrary } from "@/components/tw/media/mediaLibrary";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaLogs } from "@/hooks/useMediaLogs";
import { getMediaList, getTags } from "@/querries/media/logged";
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
  const [tagFilter, setTagFilter] = useState<string>("");

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
    queryKey: ["media", "list", mediaType, tagFilter],
    queryFn: () =>
      getMediaList(user!.id, {
        type: mediaType,
        tags: tagFilter ? [tagFilter] : undefined,
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

  const { data: tagOptions } = useQuery<string[]>({
    queryKey: ["media", "tags", user?.id],
    queryFn: () => getTags(user!.id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  const ALL_TAGS = "__all__";
  const tagSelectOptions = useMemo(
    () => [
      { value: ALL_TAGS, label: t("tags.filterAll") },
      ...(tagOptions ?? []).map((tag) => ({ value: tag, label: tag })),
    ],
    [tagOptions, t]
  );
  const { data: allLogs } = useMediaLogs({});

  const logs = useMemo(
    () =>
      mediaType
        ? (allLogs ?? []).filter((log) => log.media?.type === mediaType)
        : allLogs ?? [],
    [allLogs, mediaType]
  );

  const isLoading = isFetching || isFetchingRecent;
  const isInitialLoading = isLoading && (!data || !recentlyLoggedData);
  const isErrorCombined = isError || isErrorRecent;
  const errorMessageCombined = error?.message || errorRecent?.message || "";

  return (
    <div className="w-full h-full space-y-3">
      <PageHeader title={title || t("label")} />

      {tagOptions && tagOptions.length > 0 && (
        <div className="max-w-[220px]">
          <Select
            name="tagFilter"
            label={t("tags.label")}
            placeholder={t("tags.filterAll")}
            options={tagSelectOptions}
            value={tagFilter || ALL_TAGS}
            onValueChange={(value) => setTagFilter(value === ALL_TAGS ? "" : value)}
          />
        </div>
      )}

      <Tabs defaultValue="list" className="mt-4">
        <TabsList>
          <TabsTrigger value="list">{t("home.tabs.list")}</TabsTrigger>
          <TabsTrigger value="stats">{t("home.tabs.stats")}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <DataExhibition
            isLoading={isInitialLoading}
            isFetching={isLoading}
            skeleton={<MediaCardSkeleton />}
            isError={isErrorCombined}
            errorMessage={`${t("errorLoading", { ns: "common" })} ${errorMessageCombined}`}
          >
            <MediaLibrary data={data} recentlyLoggedData={recentlyLoggedData} mediaType={mediaType} />
          </DataExhibition>
        </TabsContent>

        <TabsContent value="stats" className="mt-4 space-y-6">
          <MediaStats logs={logs} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaListPage;
