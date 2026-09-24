import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { EmptyState } from "@/components/tw/generic/EmptyState";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { GridItem } from "@/components/tw/media/grid";
import ListItem from "@/components/tw/media/list";
import { getCustomViews } from "@/querries/customViews";
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaItem } from "@/types/media";
import { DEFAULT_STALE_TIME } from "@/utils/conts";
import { applyCustomViewFilters } from "@/utils/customView";

function CustomViewDetailPage() {
  const { viewId } = useParams<{ viewId: string }>();
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const numericId = Number(viewId);

  const { data: views } = useQuery({
    queryKey: ["customViews", user?.id],
    queryFn: () => getCustomViews(user!.id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  const view = useMemo(
    () => views?.find((item) => item.id === numericId),
    [views, numericId]
  );

  const { data: media, isFetching, isError } = useQuery({
    queryKey: ["media", "customView", user?.id],
    queryFn: () => getMediaList(user!.id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: t("label"), to: "/media/home" },
        { label: t("customView.title") },
        { label: view?.name ?? "" },
      ])
    );
  }, [dispatch, t, view]);

  const filtered = useMemo(
    () => (media ? applyCustomViewFilters(media, view?.filters, view?.displaySettings) : []),
    [media, view]
  );

  const viewMode = view?.displaySettings?.view_mode ?? "grid";

  if (views && !view) {
    return (
      <p className="p-4 text-step-1 text-muted-foreground">{t("customView.notFound")}</p>
    );
  }

  return (
    <div className="w-full space-y-4">
      <PageHeader title={view ? `${view.icon ?? ""} ${view.name}`.trim() : t("customView.title")} />

      {isFetching && !media ? (
        <p className="text-step-1 text-muted-foreground">{t("customView.loadingMedia")}</p>
      ) : isError ? (
        <p className="text-step-1 text-destructive">{t("customView.loading")}</p>
      ) : filtered.length === 0 ? (
        <EmptyState title={t("customView.empty")} className="mt-4" />
      ) : (
        <div
          className={
            viewMode === "list"
              ? "flex flex-col gap-4 md:px-12"
              : "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:px-12 lg:grid-cols-5"
          }
        >
          {filtered.map((item) => {
            const normalized: MediaItem = {
              id: item.externalId,
              title: item.title,
              type: item.type,
              coverUrl: item.coverUrl ?? "",
              year: item.releaseDate?.slice(0, 4),
              description: item.description,
            };

            return viewMode === "list" ? (
              <ListItem key={item.id} item={normalized} existingItem={item} />
            ) : (
              <GridItem key={item.id} item={normalized} existingItem={item} showMediaType />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomViewDetailPage;
