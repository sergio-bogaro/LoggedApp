import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { SearchContainer } from "@/components/tw/mediaSearch/searchBar";
import MediaView from "@/components/tw/mediaSearch/view";
import { searchMoviesNormalized } from "@/lib/querry/tmdb";
import { MediaItem } from "@/types/mediaItem";
import { MediaTypeEnum } from "@/utils/mediaText";



function SearchMoviesPage(){
  const [movieName, setMovieName] = useState("");

  const { data, isLoading, error } = useQuery<MediaItem[]>({
    queryKey: ["movies", movieName],
    queryFn: () => searchMoviesNormalized(movieName),
    enabled: movieName.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="p-4">
      <SearchContainer
        onSearch={setMovieName}
        page={MediaTypeEnum.MOVIES}
      />

      <MediaView error={error} isLoading={isLoading} mediaData={data} />
    </div >
  );
}

export default SearchMoviesPage;