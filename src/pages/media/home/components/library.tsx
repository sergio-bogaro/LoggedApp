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
}

export const LibraryData = ({ data }: LibraryDataProps) => {
  const { t } = useTranslation("media");

  const sections = useMemo(() => {
    if (!data) return [];

    return [
      {
        key: "recent",
        titleKey: "sections.recentlyAdded",
        description: "sections.recentlyAddedDesc",
        items: [...data]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10),
      },
      {
        key: "favorites",
        titleKey: "sections.favorites",
        description: "sections.favoritesDesc",
        items: [...data]
          .filter((item) => item.rating && item.rating >= 8)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 10),
      },
    ].filter((section) => section.items.length > 0);
  }, [data]);

  return(
    <div className="md:px-12 mt-4 space-y-8">
      {sections.map((section) => (
        <div key={section.key}>
          <h2 className="text-base font-semibold mb-2 px-1">
            {t(section.titleKey)}
          </h2>

          <span>
            {t(section.description)}
          </span>

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
        </div>
      ))}
      
      
    </div>
  )
}