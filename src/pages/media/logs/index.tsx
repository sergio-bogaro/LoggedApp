import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2Icon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";

import { Loading } from "@/components/tw/generic/loading";
import { GridItem } from "@/components/tw/media/grid";
import { GridItemSkeleton } from "@/components/tw/media/gridSkeleton";
import { Button } from "@/components/ui/button";
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaResponse } from "@/types/logged";
import { MediaItem, MediaTypeEnum } from "@/types/media";
import { DEFAULT_STALE_TIME } from "@/utils/conts";

const PAGE_SIZE = 20;

const MediaLogsPage = () => {
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const { type } = useParams<{ type?: string }>();
  const dispatch = useAppDispatch();

  const mediaType = type as MediaTypeEnum | undefined;
  const title = mediaType ? t("logs.titleFiltered", { type: t(`typePlural.${mediaType}`) }) : t("logs.title");
  const queryKey: (string | number | undefined)[] = ["media", "logs", mediaType];

  useEffect(() => {
    const logsCrumb = { label: t("logs.title"), to: "/media/logs" };
    dispatch(
      setBreadcrumbs(
        mediaType
          ? [logsCrumb, { label: t(`typePlural.${mediaType}`) }]
          : [logsCrumb]
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
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_SIZE ? lastPage.length : undefined,
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
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-6 px-10">
        {t("logs.description")}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 min-h-72">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <GridItemSkeleton key={i} />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="text-center py-16 min-h-72 flex flex-col items-center justify-center text-muted-foreground">
          <p className="text-lg">{t("logs.empty")}</p>
          <p className="text-sm mt-1">{t("logs.emptyHint")}</p>
        </div>
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
            <div className="text-center py-6 text-sm text-muted-foreground">
              {t("logs.allLoaded")}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaLogsPage;
