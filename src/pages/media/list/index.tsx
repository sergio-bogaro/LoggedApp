import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";

import { GridItem } from "@/components/tw/media/grid";
import { customViewsApi } from "@/querries/customViews/customViews";
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaResponse } from "@/types/logged";
import { MediaItem, MediaTypeEnum } from "@/types/media";

const mediaTypeLabels: Record<MediaTypeEnum, string> = {
  [MediaTypeEnum.MOVIES]: "Filmes",
  [MediaTypeEnum.ANIME]: "Animes",
  [MediaTypeEnum.MANGA]: "Mangás",
  [MediaTypeEnum.BOOK]: "Livros",
  [MediaTypeEnum.GAME]: "Jogos",
};

const MediaListPage = () => {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);

  const mediaType = type as MediaTypeEnum | undefined;
  const viewId = searchParams.get("view") ? Number(searchParams.get("view")) : undefined;

  const { data: view } = useQuery({
    queryKey: ["custom-view", viewId],
    queryFn: () => customViewsApi.getView(viewId!, user!.id),
    enabled: !!user && !!viewId,
    staleTime: 1000 * 60 * 5,
  });

  // Determine effective type: route param takes priority, then view filter (if single type)
  const viewTypes = view?.filters?.media_types as MediaTypeEnum[] | undefined;
  const effectiveType = mediaType ?? (viewTypes?.length === 1 ? viewTypes[0] : undefined);

  const { data: rawData, isFetching } = useQuery<MediaResponse[]>({
    queryKey: ["media", "list", effectiveType, viewId],
    queryFn: () =>
      getMediaList(user!.id, {
        type: effectiveType,
        status: view?.filters?.status?.[0] as never,
      }),
    staleTime: 1000 * 60 * 5,
    enabled: !!user && (!!effectiveType || !!viewId),
  });

  // Client-side filters from the view
  const data = view
    ? rawData?.filter((item) => {
        if (viewTypes && viewTypes.length > 1 && !viewTypes.includes(item.type)) return false;
        if (view.filters?.min_rating != null && (item.rating ?? 0) < view.filters.min_rating) return false;
        if (view.filters?.max_rating != null && (item.rating ?? 10) > view.filters.max_rating) return false;
        if (view.filters?.on_list != null && item.onList !== view.filters.on_list) return false;
        if (view.filters?.year_from != null && item.releaseDate) {
          if (Number(item.releaseDate.slice(0, 4)) < view.filters.year_from) return false;
        }
        if (view.filters?.year_to != null && item.releaseDate) {
          if (Number(item.releaseDate.slice(0, 4)) > view.filters.year_to) return false;
        }
        return true;
      })
    : rawData;

  const title = view
    ? `${view.icon ? `${view.icon} ` : ""}${view.name}`
    : mediaType
    ? mediaTypeLabels[mediaType] ?? "Mídias"
    : "Mídias";

  return (
    <div className="w-full h-full">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      {view?.description && (
        <p className="text-muted-foreground mb-4">{view.description}</p>
      )}

      {isFetching ? (
        <p>Carregando...</p>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 m-2 gap-4">
          {data.map((item) => {
            const normalizedItem: MediaItem = {
              id: item.externalId,
              title: item.title,
              type: item.type,
              coverUrl: item.coverUrl,
              year: item.releaseDate ? item.releaseDate.slice(0, 4) : undefined,
              description: item.description,
            };

            return (
              <GridItem
                key={item.id}
                item={normalizedItem}
                existingItem={item}
                showMediaType={!effectiveType}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p>Nenhuma mídia encontrada</p>
          {mediaType && (
            <p className="text-sm mt-2">
              Comece adicionando {mediaTypeLabels[mediaType]?.toLowerCase()} à sua biblioteca
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaListPage;
