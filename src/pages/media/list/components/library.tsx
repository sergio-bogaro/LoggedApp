import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { GridItem } from "@/components/tw/media/grid";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MediaResponse } from "@/types/logged"
import { MediaItem } from "@/types/media";


interface LibraryDataProps {
  data?: MediaResponse[];
  recentlyLoggedData?: MediaResponse[];
}

export const LibraryDataMediaType = ({ data, recentlyLoggedData }: LibraryDataProps) => {
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
    },
    {
      key: "favorites",
      titleKey: "sections.favorites",
      description: "sections.favoritesDesc",
      items: favorites,
    },
  ];

  return(
    <div className="md:px-12 mt-4 space-y-8">
      {sections.map((section) => (
        <div key={section.key}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold px-1">
              {t(section.titleKey)}
            </h2>
          </div>

          <span className="px-1">
            {t(section.description)}
          </span>

          {section.items.length > 0 ? (
            <Carousel>
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
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <div className="mt-4 text-sm text-muted-foreground px-1">
              {t("sections.noData")}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
