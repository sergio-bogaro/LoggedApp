import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { StatsHeadline } from "@/components/tw/charts/StatsHeadline";
import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { EmptyState } from "@/components/tw/generic/EmptyState";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { SectionHeading } from "@/components/tw/generic/SectionHeading";
import { ViewModeToggle } from "@/components/tw/generic/ViewModeToggle";
import { LogStreamSkeleton } from "@/components/tw/log/LogStreamSkeleton";
import { GridItem } from "@/components/tw/media/grid";
import { MediaGridSkeleton } from "@/components/tw/media/gridSkeleton";
import MediaTypeFilter from "@/components/tw/media/MediaTypeFilter";
import { RegisterRow } from "@/components/tw/media/RegisterRow";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import { useMediaTypeFilter } from "@/hooks/useMediaTypeFilter";
import NotFoundPage from "@/pages/notFound";
import { useAppDispatch, useAppSelector } from "@/store/settings/hooks";
import { setBreadcrumbs, setLibraryViewMode, ViewMode } from "@/store/settings/slice";
import { MediaResponse } from "@/types/logged";
import { MediaItem, MediaTypeEnum } from "@/types/media";
import { formatMonthLabel, monthKey } from "@/utils/date";
import { filterByCollection, getCollection } from "@/utils/mediaCollections";

const ALL_TYPES = Object.values(MediaTypeEnum);
const NO_DATE_KEY = "__none__";

/** The collection rows carry the library record; the card only needs the poster identity. */
const toMediaItem = (media: MediaResponse): MediaItem => ({
  id: media.externalId,
  title: media.title,
  type: media.type,
  coverUrl: media.coverUrl ?? "",
  year: media.releaseDate?.slice(0, 4),
  description: media.description,
});

const MediaCollectionPage = () => {
  const { i18n, t } = useTranslation(["media", "common"]);
  const { key } = useParams<{ key: string }>();
  const dispatch = useAppDispatch();
  const { libraryViewMode } = useAppSelector((state) => state.ui);

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

  /* Grouped by month like the home register, using the latest log date. Titles
     with no log yet fall into a trailing "no records" group. */
  const groups = useMemo(() => {
    const ordered = [...visibleItems].sort((a, b) =>
      (b.lastLogDate ?? "").localeCompare(a.lastLogDate ?? "")
    );

    const buckets = new Map<string, MediaResponse[]>();
    const undated: MediaResponse[] = [];

    for (const media of ordered) {
      if (!media.lastLogDate) {
        undated.push(media);
        continue;
      }

      const groupKey = monthKey(media.lastLogDate);
      const bucket = buckets.get(groupKey);
      if (bucket) bucket.push(media);
      else buckets.set(groupKey, [media]);
    }

    const entries = [...buckets.entries()];
    if (undated.length > 0) entries.push([NO_DATE_KEY, undated]);
    return entries;
  }, [visibleItems]);

  if (!collection) {
    return <NotFoundPage />;
  }

  const index = ALL_TYPES.filter((type) => typeCounts[type] > 0).map((type) => ({
    label: t(`typePlural.${type}`),
    value: typeCounts[type],
  }));

  const handleViewModeChange = (mode: ViewMode) => dispatch(setLibraryViewMode(mode));

  return (
    <div className="w-full h-full space-y-6">
      <PageHeader title={t(collection.titleKey)} />

      <StatsHeadline label={t("views.totalLabel")} value={collectionItems.length} index={index} />

      <div className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-step-1 text-muted-foreground">{t("views.filterLabel")}</p>
          <ViewModeToggle value={libraryViewMode} onChange={handleViewModeChange} />
        </div>

        <MediaTypeFilter
          value={selectedTypes}
          onChange={setSelectedTypes}
          availableTypes={availableTypes}
        />
      </div>

      <DataExhibition
        isLoading={isFetching && !data}
        isFetching={isFetching}
        isError={isError}
        errorMessage={`${t("errorLoading", { ns: "common" })} ${error?.message ?? ""}`}
        skeleton={libraryViewMode === "grid" ? <MediaGridSkeleton /> : <LogStreamSkeleton />}
      >
        {groups.length === 0 ? (
          <EmptyState title={t("views.empty")} description={t("views.emptyHint")} />
        ) : (
          <div className="space-y-8">
            {groups.map(([groupKey, group]) => (
              <section key={groupKey}>
                <SectionHeading>
                  {groupKey === NO_DATE_KEY
                    ? t("views.noRecords")
                    : formatMonthLabel(group[0].lastLogDate!, i18n.language)}
                </SectionHeading>

                {libraryViewMode === "grid" ? (
                  <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                    {group.map((media) => (
                      <li key={media.id}>
                        <GridItem item={toMediaItem(media)} existingItem={media} showMediaType />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="mt-2">
                    {group.map((media) => (
                      <li key={media.id}>
                        <RegisterRow
                          media={media}
                          status={media.status}
                          date={media.lastLogDate}
                          rating={media.rating}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </DataExhibition>
    </div>
  );
};

export default MediaCollectionPage;
