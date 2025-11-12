import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "react-router";

import { MediaSearchHeaderProps } from "@/components/tw/header";
import { SearchContainer } from "@/components/tw/mediaSearch/searchBar";
import MediaView from "@/components/tw/mediaSearch/view";
import { searchMoviesNormalized } from "@/lib/querry/tmdb";
import { MediaItem } from "@/types/mediaItem";
import { MediaTypeEnum } from "@/utils/mediaText";



function SearchMoviesPage(){
  const { state } = useLocation() as { state: MediaSearchHeaderProps };
  const [movieName, setMovieName] = useState(state?.searchFilter || "");

  const { data, isLoading, error } = useQuery<MediaItem[]>({
    queryKey: ["movies", movieName],
    queryFn: () => searchMoviesNormalized(movieName),
    enabled: movieName.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="p-4 top-18">
      <SearchContainer
        onSearch={setMovieName}
        page={MediaTypeEnum.MOVIES}
        defaultValue={state?.searchFilter || ""}
      />

      <MediaView error={error} isLoading={isLoading} mediaData={data} />
    </div >
  );
}

export default SearchMoviesPage;