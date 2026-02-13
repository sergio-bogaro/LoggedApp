import { useQuery } from "@tanstack/react-query";

import { GridItem } from "@/components/tw/media/grid";
import { getMediaList, MediaResponse } from "@/querries/media/logged";
import { MediaItem } from "@/types/mediaItem";

const MediaHomePage = () => {
  const { data, error, isFetching } = useQuery<MediaResponse[]>({
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 m-2 gap-4">
          {data?.map((item) => {
            

            const normalizedItem: MediaItem = {
              id: item.id.toString(),
              title: item.title,
              type: item.type,
              coverUrl: item.coverUrl,
              year: item.releaseDate ? item.releaseDate.slice(0, 4) : undefined,
              description: item.description,
            }

            return (
              <GridItem key={item.id} item={normalizedItem} existingItem={item} />
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default MediaHomePage;