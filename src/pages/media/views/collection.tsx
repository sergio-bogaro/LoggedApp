import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "react-router";

import { StatsHeadline } from "@/components/tw/charts/StatsHeadline";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import MediaTypeFilter from "@/components/tw/media/MediaTypeFilter";
import MediaView from "@/components/tw/media/view";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import NotFoundPage from "@/pages/notFound";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaItem, MediaTypeEnum } from "@/types/media";
import { filterByCollection, getCollection } from "@/utils/mediaCollections";
import { getTrackFlags } from "@/utils/mediaTrack";

const ALL_TYPES = Object.values(MediaTypeEnum);

function parseTypes(raw: string): MediaTypeEnum[] {
  return raw
    .split(",")
    .filter((value): value is MediaTypeEnum => (ALL_TYPES as string[]).includes(value));
}

const MediaCollectionPage = () => {
  const { t } = useTranslation(["media", "common"]);
  const { key } = useParams<{ key: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const collection = key ? getCollection(key) : undefined;

  const trackedTypes = useMemo(
    () => ALL_TYPES.filter((type) => getTrackFlags(user)[type]),
    [user]
  );
  const availableTypes = trackedTypes.length > 0 ? trackedTypes : ALL_TYPES;

  const rawTypes = searchParams.get("types");
  const selectedTypes = useMemo(
    () => (rawTypes === null ? availableTypes : parseTypes(rawTypes)),
    [rawTypes, availableTypes]
  );

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

  const handleTypesChange = (types: MediaTypeEnum[]) => {
    const next = new URLSearchParams(searchParams);
    next.set("types", types.join(","));
    setSearchParams(next, { replace: true });
  };

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
          onChange={handleTypesChange}
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
