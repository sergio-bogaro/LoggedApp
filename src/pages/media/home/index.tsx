import { useQuery } from "@tanstack/react-query";

import { GridItem } from "@/components/tw/media/grid";
import { getMediaList } from "@/querries/media/logged";
import { MediaResponse } from "@/types/logged";
import { MediaItem } from "@/types/media";

const MediaHomePage = () => {
  const { data, isFetching } = useQuery<MediaResponse[]>({
    queryKey: ["media"],
    queryFn: () => getMediaList(),
    staleTime: 1000 * 60 * 5,
  });

  console.log(data)

  return (
    <div className="w-full h-full">
      <h1 className="text-2xl font-bold mb-4">Media Home Page</h1>
      <div>
        <h2>Recentely Added</h2>

        {isFetching ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 m-2 gap-4">
            {data?.map((item) => {


              const normalizedItem: MediaItem = {
                id: item.externalId,
                title: item.title,
                type: item.type,
                coverUrl: item.coverUrl,
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
        )}


      </div>
    </div>
  );
};

export default MediaHomePage;