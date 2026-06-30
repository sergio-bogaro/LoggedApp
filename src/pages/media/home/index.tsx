import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2"
import { useTranslation } from "react-i18next";

import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { MediaCardSkeleton } from "@/components/tw/generic/mediaCardSkeleton";
import { GridItem } from "@/components/tw/media/grid";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaResponse } from "@/types/logged";
import { MediaItem } from "@/types/media";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const MediaHomePage = () => {
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);
  
  const { data, isFetching } = useQuery<MediaResponse[]>({
    queryKey: ["media"],
    queryFn: () => getMediaList(user!.id),
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  const groupedByType = useMemo(() => data?.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>), [data])

  const chartData = useMemo(() => groupedByType && {
    labels: Object.keys(groupedByType),
    datasets: [
      {
        label: t("home.chartByType"),
        data: Object.values(groupedByType),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
        ],
        borderWidth: 1,
      },
    ],
  }, [groupedByType, t])

  return (
    <div className="w-full h-full">
      <h1 className="text-2xl font-bold mb-4">{t("home.title")}</h1>
      <div>
        <h2>{t("home.recentlyAdded")}</h2>

        <DataExhibition
          isFetching={isFetching}
          skeleton={<MediaCardSkeleton />}
        >
          {chartData && (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                  },
                },
              }}
            />
          )}

          <div className="md:px-12 mt-4">
            <Carousel>
              <CarouselContent>
                {data?.map((item) => {
                  const normalizedItem: MediaItem = {
                    id: item.externalId,
                    title: item.title,
                    type: item.type,
                    coverUrl: item.coverUrl ?? "",
                    year: item.releaseDate ? item.releaseDate.slice(0, 4) : undefined,
                    description: item.description,
                  }

                  return (
                    <CarouselItem key={item.id} className="basis-1/2 lg:basis-1/4 xl:basis-1/6">
                      <GridItem
                        item={normalizedItem}
                        existingItem={item}
                        showMediaType
                      />
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </DataExhibition>
      </div>
    </div>
  );
};

export default MediaHomePage;