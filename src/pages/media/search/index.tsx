import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router";

import { MediaSearchHeaderProps } from "@/components/tw/header";
import { SearchContainer } from "@/components/tw/mediaSearch/searchBar";
import MediaView from "@/components/tw/mediaSearch/view";
import { Form } from "@/components/ui/form";
import { searchMangaNormalized } from "@/lib/querry/mangadex";
import { searchMoviesNormalized } from "@/lib/querry/tmdb";
import { MediaItem } from "@/types/mediaItem";
import { MediaTypeEnum } from "@/utils/mediaText";

export type FormSearchProps = {
  searchFilter: string;
  mediaType?: MediaTypeEnum;
}

function MediaSearchPage() {
  const { state } = useLocation() as { state: MediaSearchHeaderProps };
  const { searchFilter, mediaType } = state;
  const [searchName, setSearchName] = useState(searchFilter || "");

  function getSearchFuntion(mediaType: MediaTypeEnum) {
    switch (mediaType) {
      case MediaTypeEnum.MOVIES:
        return searchMoviesNormalized;
      case MediaTypeEnum.MANGA:
        return searchMangaNormalized;
      default:
        return searchMoviesNormalized;
    }
  }

  const { data, isLoading, error } = useQuery<MediaItem[]>({
    queryKey: ["media", mediaType, searchName],
    queryFn: () => getSearchFuntion(mediaType)(searchName),
    enabled: searchName.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const form = useForm<FormSearchProps>({
    defaultValues: {
      searchFilter: searchFilter || "",
      mediaType: mediaType
    }
  });
  const { control } = form;

  return (
    <div className="p-4 top-18">
      <div className="backdrop-blur-sm border-b mb-4">
        <Form {...form}>
          <form className='w-full flex gap-1 items-end pb-3' onSubmit={form.handleSubmit(onSubmit)}>
            <Select
              options={mediaTypesOptions}
              name='mediaType'
              control={control}
              placeholder={t("mediaType")}
              label={t("Type")}
              width={200}
            />

            <Input
              name='searchFilter'
              control={control}
              label={label}
              placeholder={placeholder}
            />
            <Button>
              <Search />
            </Button>

            <Button type="button" variant="outline" onClick={() => handleViewModeChange(isGrid ? "list" : "grid")}>
              <Grid className={`h-[1.2rem] w-[1.2rem] scale-0 -rotate-90  transition-all ${isGrid && "scale-100 rotate-0"} `} />
              <List className={`absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-0 transition-all ${!isGrid && "scale-100 -rotate-90"}`} />
            </Button>
          </form>
        </Form>
      </div>


      <SearchContainer
        onSearch={setSearchName}
        page={MediaTypeEnum.MOVIES}
        defaultSearchValue={searchFilter}
        defaultMediaType={mediaType}
      />

      <MediaView error={error} isLoading={isLoading} mediaData={data} />
    </div >
  );
}

export default MediaSearchPage;