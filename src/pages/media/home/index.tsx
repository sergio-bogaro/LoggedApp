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
import { useTranslation } from "react-i18next";
import { Bar } from "react-chartjs-2"

import { GridItem } from "@/components/tw/media/grid";
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

        {isFetching ? (
          <p>{t("home.loading")}</p>
        ) : (
          <>

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 m-2 gap-4">


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
                  <GridItem
                    key={item.id}
                    item={normalizedItem}
                    existingItem={item}
                    showMediaType
                  />
                )
              })}
            </div>
          </>
        )}


      </div>
    </div>
  );
};

export default MediaHomePage;
