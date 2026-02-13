import { useQuery } from "@tanstack/react-query";

import { getMediaList, MediaResponse } from "@/querries/logged";

const MediaHomePage = () => {
  const { data, error, isFetching } = useQuery<MediaResponse[]>({
    queryKey: ["media"],
    queryFn: () => getMediaList(),
    staleTime: 1000 * 60 * 5,
  });

  console.log(data)

  return (
    <div className="w-full h-full flex justify-center items-center">
    </div>
  );
};

export default MediaHomePage;