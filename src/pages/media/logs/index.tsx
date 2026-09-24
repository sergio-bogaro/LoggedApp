import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2Icon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { EmptyState } from "@/components/tw/generic/EmptyState";
import { Loading } from "@/components/tw/generic/loading";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { GridItem } from "@/components/tw/media/grid";
import { GridItemSkeleton } from "@/components/tw/media/gridSkeleton";
import { Button } from "@/components/ui/button";
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaResponse } from "@/types/logged";
import { MediaItem } from "@/types/media";
import { DEFAULT_STALE_TIME } from "@/utils/conts";
import { pathToMediaType } from "@/utils/mediaText";

const PAGE_SIZE = 20;

const MediaLogsPage = () => {
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const { type } = useParams<{ type?: string }>();
  const dispatch = useAppDispatch();

  const mediaType = pathToMediaType(type);
  const title = mediaType ? t("logs.titleFiltered", { type: t(`typePlural.${mediaType}`) }) : t("logs.title");
  const queryKey: (string | number | undefined)[] = ["media", "logs", mediaType];

  useEffect(() => {
    const logsCrumb = { label: t("logs.title"), to: "/media/logs" };
    const mediaCrumb = { label: t("label"), to: "/media/home" };
    dispatch(
      setBreadcrumbs(
        mediaType
          ? [mediaCrumb, logsCrumb, { label: t(`typePlural.${mediaType}`) }]
          : [mediaCrumb, logsCrumb]
      )
    );
  }, [dispatch, t, mediaType]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery<MediaResponse[], Error, { pages: MediaResponse[]; pageParams: number[] }, typeof queryKey, number>({
    queryKey: queryKey as ["media", "logs", ...string[]],
    queryFn: ({ pageParam = 0 }) =>
      getMediaList(user!.id, { hasLogs: true, limit: PAGE_SIZE, offset: pageParam, type: mediaType }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  const allItems = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  // Intersection Observer for infinite scroll
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full h-full">
      <PageHeader
        title={title}
        description={t("logs.description")}
        leading={
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
            aria-label={t("actions.back", { ns: "common" })}
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 min-h-72">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <GridItemSkeleton key={i} />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <EmptyState title={t("logs.empty")} description={t("logs.emptyHint")} />
      ) : (
        <>
          <div className="relative">
            <Loading isLoading={isFetching && !isFetchingNextPage} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allItems.map((item) => {
                const normalizedItem: MediaItem = {
                  id: item.externalId,
                  title: item.title,
                  type: item.type,
                  coverUrl: item.coverUrl ?? "",
                  year: item.releaseDate?.slice(0, 4),
                  description: item.description,
                };
                return (
                  <GridItem
                    key={item.id}
                    item={normalizedItem}
                    existingItem={item}
                    showMediaType
                  />
                );
              })}
            </div>
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={observerRef} className="h-10" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-6">
              <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!hasNextPage && allItems.length > 0 && (
            <div className="text-center py-6 text-step-1 text-muted-foreground">
              {t("logs.allLoaded")}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaLogsPage;
