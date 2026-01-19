import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { Grid, List, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { set, useForm } from "react-hook-form";
import { useLocation } from "react-router";

import { MediaSearchHeaderProps } from "@/components/tw/header";
import { SearchContainer } from "@/components/tw/mediaSearch/searchBar";
import MediaView from "@/components/tw/mediaSearch/view";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { searchKitsuMangaNormalized } from "@/lib/querry/kitsu";
import { searchMangaNormalized } from "@/lib/querry/mangadex";
import { searchMoviesNormalized } from "@/lib/querry/tmdb";
import { useAppDispatch, useAppSelector } from "@/store/settings/hooks";
import { setViewMode, ViewMode } from "@/store/settings/slice";
import { MediaItem } from "@/types/mediaItem";
import { MediaTypeEnum, mediaTypesOptions } from "@/utils/mediaText";

export type FormSearchProps = {
  searchFilter: string;
  mediaType?: MediaTypeEnum;
}

function MediaSearchPage() {
  const { state } = useLocation() as { state: MediaSearchHeaderProps };
  const dispatch = useAppDispatch()
  const { searchFilter, mediaType } = state ?? { searchFilter: "", mediaType: MediaTypeEnum.MOVIES };
  const [searchName, setSearchName] = useState(searchFilter || "");

  const { viewMode } = useAppSelector(state => state.ui)
  const isGrid = useMemo(() => viewMode === "grid", [viewMode]);

  const handleViewModeChange = (newTheme: ViewMode) => {
    dispatch(setViewMode(newTheme))
  }

  function getSearchFuntion(mediaType: MediaTypeEnum) {
    switch (mediaType) {
      case MediaTypeEnum.MOVIES:
        return searchMoviesNormalized;
      case MediaTypeEnum.MANGA:
        return searchKitsuMangaNormalized;
      default:
        return searchMoviesNormalized;
    }
  }

  const form = useForm<FormSearchProps>({
    defaultValues: {
      searchFilter: searchFilter || "",
      mediaType: mediaType
    }
  });

  const { control, watch } = form;
  const watchedMediaType = watch("mediaType");

  const { data, isLoading, error } = useQuery<MediaItem[]>({
    queryKey: ["media", watchedMediaType, searchName],
    queryFn: () => getSearchFuntion(watchedMediaType)(searchName),
    enabled: searchName.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });



  function onSubmit(data: FormSearchProps) {
    setSearchName(data.searchFilter || "");
  }

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
              label={t("search")}
              placeholder={t("searchPlaceholder")}
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
      <MediaView error={error} isLoading={isLoading} mediaData={data} />
    </div >
  );
}

export default MediaSearchPage;