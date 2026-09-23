import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { EmptyState } from "@/components/tw/generic/EmptyState";
import { GridItem } from "@/components/tw/media/grid";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MediaResponse } from "@/types/logged";
import { MediaItem, MediaTypeEnum } from "@/types/media";
import { mediaTypeToPath } from "@/utils/mediaText";

interface MediaLibraryProps {
  data?: MediaResponse[];
  recentlyLoggedData?: MediaResponse[];
  mediaType?: MediaTypeEnum;
}

/**
 * "Recently logged" + "Favorites" carousels, shared by the media home page
 * (no type filter) and the per-type list page.
 */
export const MediaLibrary = ({ data, recentlyLoggedData, mediaType }: MediaLibraryProps) => {
  const { t } = useTranslation("media");

  const recentlyLogged = useMemo(() => {
    if (!recentlyLoggedData) return [];
    return [...recentlyLoggedData]
      .sort((a, b) => new Date(b.lastLogDate!).getTime() - new Date(a.lastLogDate!).getTime())
      .slice(0, 10);
  }, [recentlyLoggedData]);

  const favorites = useMemo(() => {
    if (!data) return [];
    return [...data]
      .filter((item) => item.rating && item.rating >= 8)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);
  }, [data]);

  const sections = [
    {
      key: "recent",
      titleKey: "sections.recentlyAdded",
      description: "sections.recentlyAddedDesc",
      items: recentlyLogged,
      viewAllLink: mediaType ? `/media/logs/${mediaTypeToPath(mediaType)}` : "/media/logs",
    },
    {
      key: "favorites",
      titleKey: "sections.favorites",
      description: "sections.favoritesDesc",
      items: favorites,
      viewAllLink: "/media/list",
    },
  ];

  return (
    <div className="md:px-12 mt-4 space-y-8">
      {sections.map((section) => (
        <div key={section.key}>
          <Carousel>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold px-1">
                {t(section.titleKey)}
              </h2>
              {section.viewAllLink && section.items.length > 0 && (
                <div className="flex flex-col items-center gap-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={section.viewAllLink}>
                      {t("sections.viewAll")}
                    </Link>
                  </Button>
                  <div className="hidden md:flex gap-2">
                    <CarouselPrevious />
                    <CarouselNext />
                  </div>
                </div>
              )}
            </div>

            <span className="px-1 text-sm text-muted-foreground">
              {t(section.description)}
            </span>

            {section.items.length > 0 ? (
              <CarouselContent>
                {section.items.map((item) => {
                  const normalizedItem: MediaItem = {
                    id: item.externalId,
                    title: item.title,
                    type: item.type,
                    coverUrl: item.coverUrl ?? "",
                    year: item.releaseDate?.slice(0, 4),
                    description: item.description,
                  };
                  return (
                    <CarouselItem
                      key={item.id}
                      className="basis-1/2 lg:basis-1/4 xl:basis-1/6"
                    >
                      <GridItem
                        item={normalizedItem}
                        existingItem={item}
                        showMediaType
                      />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            ) : (
              <EmptyState
                title={t("sections.noData")}
                className="mt-4 min-h-72 px-1"
                titleClassName="text-sm"
              />
            )}
          </Carousel>
        </div>
      ))}
    </div>
  )
};
