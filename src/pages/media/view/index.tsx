import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { GridItem } from "@/components/tw/media/grid";
import { customViewsApi } from "@/querries/customViews/customViews";
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import type { MediaResponse } from "@/types/logged";
import { MediaTypeEnum } from "@/types/media";
import type { MediaItem } from "@/types/media";

const MediaViewPage = () => {
  const { t } = useTranslation("media");
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const viewId = Number(id);

  const { data: view, isLoading: viewLoading } = useQuery({
    queryKey: ["custom-view", viewId],
    queryFn: () => customViewsApi.getView(viewId, user!.id),
    enabled: !!user && !!viewId,
    staleTime: 1000 * 60 * 5,
  });

  const mediaTypes = view?.filters?.media_types as MediaTypeEnum[] | undefined;
  const singleType =
    mediaTypes?.length === 1 ? (mediaTypes[0] as MediaTypeEnum) : undefined;

  const { data: allMedia, isFetching: mediaFetching } = useQuery<MediaResponse[]>({
    queryKey: ["media", "view", viewId, view?.filters],
    queryFn: () =>
      getMediaList(user!.id, {
        type: singleType,
        status: view?.filters?.status?.[0] as never,
        tags: view?.filters?.tags,
      }),
    enabled: !!user && !!view,
    staleTime: 1000 * 60 * 5,
  });

  // Client-side filters that the API doesn't handle
  const data = allMedia?.filter((item) => {
    if (mediaTypes && mediaTypes.length > 1) {
      if (!mediaTypes.includes(item.type)) return false;
    }
    if (view?.filters?.min_rating != null && (item.rating ?? 0) < view.filters.min_rating) {
      return false;
    }
    if (view?.filters?.max_rating != null && (item.rating ?? 10) > view.filters.max_rating) {
      return false;
    }
    if (view?.filters?.on_list != null && item.onList !== view.filters.on_list) {
      return false;
    }
    if (view?.filters?.year_from != null && item.releaseDate) {
      if (Number(item.releaseDate.slice(0, 4)) < view.filters.year_from) return false;
    }
    if (view?.filters?.year_to != null && item.releaseDate) {
      if (Number(item.releaseDate.slice(0, 4)) > view.filters.year_to) return false;
    }
    return true;
  });

  if (viewLoading) {
    return <div className="p-6">{t("customView.loading")}</div>;
  }

  if (!view) {
    return <div className="p-6 text-muted-foreground">{t("customView.notFound")}</div>;
  }

  return (
    <div className="w-full h-full">
      <div className="flex items-center gap-2 mb-4">
        {view.icon && <span className="text-2xl">{view.icon}</span>}
        <h1 className="text-2xl font-bold">{view.name}</h1>
      </div>
      {view.description && (
        <p className="text-muted-foreground mb-4">{view.description}</p>
      )}

      {mediaFetching ? (
        <p>{t("customView.loadingMedia")}</p>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 m-2 gap-4">
          {data.map((item) => {
            const normalizedItem: MediaItem = {
              id: item.externalId,
              title: item.title,
              type: item.type,
              coverUrl: item.coverUrl || "",
              year: item.releaseDate ? item.releaseDate.slice(0, 4) : undefined,
              description: item.description,
            };

            return (
              <GridItem
                key={item.id}
                item={normalizedItem}
                existingItem={item}
                showMediaType={!singleType}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p>{t("customView.empty")}</p>
        </div>
      )}
    </div>
  );
};

export default MediaViewPage;
