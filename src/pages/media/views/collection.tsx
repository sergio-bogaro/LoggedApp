import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { StatsHeadline } from "@/components/tw/charts/StatsHeadline";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import MediaTypeFilter from "@/components/tw/media/MediaTypeFilter";
import MediaView from "@/components/tw/media/view";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import { useMediaTypeFilter } from "@/hooks/useMediaTypeFilter";
import NotFoundPage from "@/pages/notFound";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaItem, MediaTypeEnum } from "@/types/media";
import { filterByCollection, getCollection } from "@/utils/mediaCollections";

const ALL_TYPES = Object.values(MediaTypeEnum);

const MediaCollectionPage = () => {
  const { t } = useTranslation(["media", "common"]);
  const { key } = useParams<{ key: string }>();
  const dispatch = useAppDispatch();

  const collection = key ? getCollection(key) : undefined;

  const { selectedTypes, setSelectedTypes, availableTypes } = useMediaTypeFilter();

  useEffect(() => {
    if (!collection) return;
    dispatch(
      setBreadcrumbs([
        { label: t("label"), to: "/media/home" },
        { label: t("views.title"), to: "/media/views" },
        { label: t(collection.titleKey) },
      ])
    );
  }, [dispatch, t, collection]);

  const { data, isFetching, isError, error } = useMediaLibrary();

  const collectionItems = useMemo(
    () => (collection ? filterByCollection(data ?? [], collection) : []),
    [data, collection]
  );

  const typeCounts = useMemo(() => {
    const counts = {} as Record<MediaTypeEnum, number>;
    for (const type of ALL_TYPES) counts[type] = 0;
    for (const media of collectionItems) counts[media.type]++;
    return counts;
  }, [collectionItems]);

  const visibleItems = useMemo(
    () => collectionItems.filter((media) => selectedTypes.includes(media.type)),
    [collectionItems, selectedTypes]
  );

  const items: MediaItem[] = useMemo(
    () =>
      visibleItems.map((media) => ({
        id: media.externalId,
        title: media.title,
        type: media.type,
        coverUrl: media.coverUrl ?? "",
        year: media.releaseDate?.slice(0, 4),
        description: media.description,
      })),
    [visibleItems]
  );

  const existingMedia = useMemo(
    () =>
      Object.fromEntries(
        visibleItems.map((media) => [`${media.externalId}:${media.type}`, media])
      ),
    [visibleItems]
  );

  if (!collection) {
    return <NotFoundPage />;
  }

  const index = ALL_TYPES.filter((type) => typeCounts[type] > 0).map((type) => ({
    label: t(`typePlural.${type}`),
    value: typeCounts[type],
  }));

  const mediaData = selectedTypes.length === 0 ? [] : data ? items : undefined;

  return (
    <div className="w-full h-full space-y-6">
      <PageHeader title={t(collection.titleKey)} />

      <StatsHeadline label={t("views.totalLabel")} value={collectionItems.length} index={index} />

      <div className="space-y-2">
        <p className="text-step-1 text-muted-foreground">{t("views.filterLabel")}</p>
        <MediaTypeFilter
          value={selectedTypes}
          onChange={setSelectedTypes}
          availableTypes={availableTypes}
        />
      </div>

      <MediaView
        isLoading={isFetching && !data}
        error={isError ? (error as Error) : null}
        mediaData={mediaData}
        existingMedia={existingMedia}
        emptyTitle={t("views.empty")}
        emptyDescription={t("views.emptyHint")}
      />
    </div>
  );
};

export default MediaCollectionPage;
