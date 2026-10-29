import { ArrowUpRight } from "lucide-react";
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
 * "Recently logged" + "Favorites" carousels for the per-type library page.
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
      viewAllLink: "/media/favorites",
    },
  ];

  return (
    <div className="mt-5 space-y-10">
      {sections.map((section) => (
        <div key={section.key}>
          <Carousel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="flex items-baseline gap-2 px-0.5 font-serif text-step-4 font-medium">
                  {t(section.titleKey)}
                  <span className="font-sans text-step-1 tabular-nums text-muted-foreground">
                    {section.items.length}
                  </span>
                </h2>

                <p className="mt-1 px-0.5 text-step-1 text-muted-foreground">
                  {t(section.description)}
                </p>
              </div>

              {section.viewAllLink && section.items.length > 0 && (
                <div className="flex items-center gap-2 max-sm:ml-auto">
                  <Button variant="ghost" size="sm" asChild className="group/link text-muted-foreground">
                    <Link to={section.viewAllLink}>
                      {t("sections.viewAll")}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                      />
                    </Link>
                  </Button>

                  <div className="hidden items-center gap-1 md:flex">
                    <CarouselPrevious className="rounded-control" />
                    <CarouselNext className="rounded-control" />
                  </div>
                </div>
              )}
            </div>

            {section.items.length > 0 ? (
              <CarouselContent className="mt-4">
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
                      className="basis-1/2 lg:basis-1/4 xl:basis-1/6 2xl:basis-1/8"
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
                className="mt-4 min-h-48 px-1"
                titleClassName="text-step-1"
              />
            )}
          </Carousel>
        </div>
      ))}
    </div>
  );
};
