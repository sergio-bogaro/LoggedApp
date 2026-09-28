import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { SectionHeading } from "@/components/tw/generic/SectionHeading";
import CollectionCard from "@/components/tw/media/CollectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { collectionSections, filterByCollection, getCollection, MediaCollection } from "@/utils/mediaCollections";

const ViewsHubSkeleton = () => (
  <div className="space-y-10">
    {[0, 1].map((section) => (
      <div key={section} className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((card) => (
            <Skeleton key={card} className="h-32 w-full" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const ViewsHubPage = () => {
  const { t } = useTranslation(["media", "common"]);
  const dispatch = useAppDispatch();
  const { data, isFetching, isError, error } = useMediaLibrary();

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: t("label"), to: "/media/home" },
        { label: t("views.title") },
      ])
    );
  }, [dispatch, t]);

  const sections = useMemo(
    () =>
      collectionSections.map((section) => ({
        titleKey: section.titleKey,
        collections: section.keys
          .map((key) => getCollection(key))
          .filter((collection): collection is MediaCollection => collection !== undefined)
          .map((collection) => ({
            collection,
            items: filterByCollection(data ?? [], collection),
          })),
      })),
    [data]
  );

  return (
    <div className="w-full h-full space-y-8">
      <PageHeader title={t("views.title")} />

      <DataExhibition
        isLoading={isFetching && !data}
        isFetching={isFetching}
        isError={isError}
        errorMessage={`${t("errorLoading", { ns: "common" })} ${error?.message ?? ""}`}
        skeleton={<ViewsHubSkeleton />}
      >
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.titleKey} className="space-y-5">
              <SectionHeading>{t(section.titleKey)}</SectionHeading>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.collections.map(({ collection, items }) => (
                  <CollectionCard
                    key={collection.key}
                    title={t(collection.titleKey)}
                    count={items.length}
                    previews={items}
                    to={`/media/views/${collection.key}`}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </DataExhibition>
    </div>
  );
};

export default ViewsHubPage;
