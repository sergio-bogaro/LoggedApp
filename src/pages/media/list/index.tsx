import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { GridItem } from "@/components/tw/media/grid";
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaResponse } from "@/types/logged";
import { MediaItem, MediaTypeEnum } from "@/types/media";
import { DEFAULT_STALE_TIME } from "@/utils/conts";

const MediaListPage = () => {
  const { t } = useTranslation("media");
  const { type } = useParams<{ type: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const mediaType = type as MediaTypeEnum;
  const title = mediaType ? t(`typePlural.${mediaType}`) : "";

  const { data: data, isFetching } = useQuery<MediaResponse[]>({
    queryKey: ["media", "list", mediaType],
    queryFn: () =>
      getMediaList(user!.id, {
        type: mediaType,
      }),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  return (
    <div className="w-full h-full">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      {isFetching ? (
        <p>{t("list.loading")}</p>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 m-2 gap-4">
          {data.map((item) => {
            const normalizedItem: MediaItem = {
              id: item.externalId,
              title: item.title,
              type: item.type,
              coverUrl: item.coverUrl ?? "",
              year: item.releaseDate ? item.releaseDate.slice(0, 4) : undefined,
              description: item.description,
            };

            return (
              <GridItem
                key={item.id}
                item={normalizedItem}
                existingItem={item}
                showMediaType={false}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p>{t("list.empty")}</p>
          {mediaType && (
            <p className="text-sm mt-2">
              {t("list.emptyWithType", { mediaType: t(`typePlural.${mediaType}`).toLowerCase() })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaListPage;
