
import { useQuery } from "@tanstack/react-query";
import { Grid, List, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";

import MediaView from "@/components/tw/media/view";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { searchAnimeAnilistNormalized, searchMangaAnilistNormalized } from "@/querries/externalMedia/anilist";
import { searchBooksNormalized } from "@/querries/externalMedia/books";
import { searchGamesNormalized } from "@/querries/externalMedia/gamebrain";
import { searchMoviesNormalized } from "@/querries/externalMedia/movies";
import { useExistingMedia } from "@/querries/media/existingMedias";
import { useAppDispatch, useAppSelector } from "@/store/settings/hooks";
import { setViewMode, ViewMode } from "@/store/settings/slice";
import { MediaItem } from "@/types/media";
import { MediaTypeEnum } from "@/types/media";
import { getMediaTypesOptions } from "@/utils/mediaText";

export type FormSearchProps = {
  searchFilter: string;
  mediaType: MediaTypeEnum;
}

function MediaSearchPage() {
  const { t } = useTranslation("media");
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchName, setSearchName] = useState(searchParams.get("searchFilter") || "");
  const { viewMode } = useAppSelector(state => state.ui)
  const isGrid = useMemo(() => viewMode === "grid", [viewMode]);
  const dispatch = useAppDispatch();
  const mediaTypesOptions = useMemo(() => getMediaTypesOptions(t), [t]);

  const form = useForm<FormSearchProps>({
    defaultValues: {
      searchFilter: searchParams.get("searchFilter") || "",
      mediaType: (searchParams.get("mediaType") as MediaTypeEnum) || MediaTypeEnum.MOVIES,
    }
  });

  const { control, handleSubmit } = form;
  const watchedMediaType = useWatch({ control, name: "mediaType" });

  function getSearchFuntion(mediaType: MediaTypeEnum) {
    switch (mediaType) {
      case MediaTypeEnum.MOVIES:
        return searchMoviesNormalized;
      case MediaTypeEnum.MANGA:
        return searchMangaAnilistNormalized;
      case MediaTypeEnum.ANIME:
        return searchAnimeAnilistNormalized;
      case MediaTypeEnum.GAME:
        return searchGamesNormalized;
      case MediaTypeEnum.BOOK:
        return searchBooksNormalized;
      default:
        return searchMoviesNormalized;
    }
  }

  const { data, error, isFetching } = useQuery<MediaItem[]>({
    queryKey: ["media", watchedMediaType, searchName],
    queryFn: () => getSearchFuntion(watchedMediaType)(searchName),
    enabled: searchName.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const { data: existingMedia } = useExistingMedia(data);

  const handleViewModeChange = (newTheme: ViewMode) => {
    dispatch(setViewMode(newTheme))
  }

  function handleSearchParamsChange() {
    const paramsForm = form.getValues();

    const params: Record<string, string> = {};
    if (paramsForm.searchFilter && paramsForm.searchFilter.trim().length > 0) params.searchFilter = paramsForm.searchFilter;
    if (paramsForm.mediaType) params.mediaType = String(paramsForm.mediaType as unknown as string);

    setSearchParams(params);
  }

  function onSubmit(data: FormSearchProps) {
    const params: Record<string, string> = {};
    if (data.searchFilter && data.searchFilter.trim().length > 0) params.searchFilter = data.searchFilter;
    if (data.mediaType) params.mediaType = String(data.mediaType as unknown as string);

    handleSearchParamsChange();
    setSearchName(params.searchFilter || "");
  }

  useEffect(() => {
    handleSearchParamsChange()
     
  }, [watchedMediaType]);

  return (
    <div className="p-4 top-18">
      <div className="backdrop-blur-sm border-b mb-4">
        <Form {...form}>
          <form className='w-full flex flex-col gap-2 pb-3 sm:flex-row sm:items-end sm:gap-1' onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-1 items-end">
              <Select
                options={mediaTypesOptions}
                name='mediaType'
                control={control}
                placeholder={t("searchForm.typePlaceholder")}
                label={t("searchForm.typeLabel")}
                width={140}
              />
              <Button type="button" variant="outline" onClick={() => handleViewModeChange(isGrid ? "list" : "grid")} className="shrink-0 self-end">
                <Grid className={`h-[1.2rem] w-[1.2rem] scale-0 -rotate-90  transition-all ${isGrid && "scale-100 rotate-0"} `} />
                <List className={`absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-0 transition-all ${!isGrid && "scale-100 -rotate-90"}`} />
              </Button>
            </div>

            <div className="flex gap-1 items-end flex-1">
              <Input
                name='searchFilter'
                control={control}
                label={t("searchForm.searchLabel")}
                placeholder={t("searchForm.searchPlaceholder")}
              />
              <Button className="shrink-0 self-end">
                <Search />
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <MediaView error={error} isLoading={isFetching} mediaData={data} existingMedia={existingMedia} />
    </div >
  );
}

export default MediaSearchPage;
