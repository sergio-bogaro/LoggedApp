
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useSearchParams } from "react-router";

import { PageHeader } from "@/components/tw/generic/PageHeader";
import { ViewModeToggle } from "@/components/tw/generic/ViewModeToggle";
import MediaView from "@/components/tw/media/view";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { searchAnimeAnilistNormalized, searchMangaAnilistNormalized } from "@/querries/externalMedia/anilist";
import { searchBooksNormalized } from "@/querries/externalMedia/books";
import { searchGamesNormalized } from "@/querries/externalMedia/games";
import { searchMoviesNormalized } from "@/querries/externalMedia/movies";
import { searchMusicNormalized } from "@/querries/externalMedia/music";
import { searchSeriesNormalized } from "@/querries/externalMedia/series";
import { useExistingMedia } from "@/querries/media/existingMedias";
import { useAppDispatch, useAppSelector } from "@/store/settings/hooks";
import { setBreadcrumbs, setLastSearchType, setViewMode } from "@/store/settings/slice";
import { MediaItem } from "@/types/media";
import { MediaTypeEnum } from "@/types/media";
import { getMediaTypesOptions } from "@/utils/mediaText";
import { getTrackFlags } from "@/utils/mediaTrack";

export type FormSearchProps = {
  searchFilter: string;
  mediaType: MediaTypeEnum;
}

function MediaSearchPage() {
  const { t } = useTranslation("media");
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchName, setSearchName] = useState(searchParams.get("searchFilter") || "");
  const { viewMode, lastSearchType } = useAppSelector(state => state.ui)
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: t("label"), to: "/media/home" },
        { label: t("navigation.search", { ns: "common" }) },
      ])
    );
  }, [dispatch, t]);

  const trackFlags = getTrackFlags(user);
  const mediaTypesOptions = useMemo(() => getMediaTypesOptions(t), [t]);
  const trackedOptions = useMemo(
    () => mediaTypesOptions.filter((option) => trackFlags[option.value as MediaTypeEnum]),
    [mediaTypesOptions, trackFlags]
  );

  const defaultMediaType = (searchParams.get("mediaType") as MediaTypeEnum) || (lastSearchType as MediaTypeEnum) || MediaTypeEnum.MOVIES;
  const resolvedMediaType = trackFlags[defaultMediaType]
    ? defaultMediaType
    : ((trackedOptions[0]?.value as MediaTypeEnum) ?? MediaTypeEnum.MOVIES);

  const form = useForm<FormSearchProps>({
    defaultValues: {
      searchFilter: searchParams.get("searchFilter") || "",
      mediaType: resolvedMediaType,
    }
  });

  const { control, handleSubmit } = form;
  const watchedMediaType = useWatch({ control, name: "mediaType" });

  function getSearchFuntion(mediaType: MediaTypeEnum) {
    switch (mediaType) {
      case MediaTypeEnum.MOVIES:
        return (query: string) => searchMoviesNormalized(query, user?.id);
      case MediaTypeEnum.MANGA:
        return (query: string) => searchMangaAnilistNormalized(query);
      case MediaTypeEnum.ANIME:
        return (query: string) => searchAnimeAnilistNormalized(query);
      case MediaTypeEnum.SERIES:
        return (query: string) => searchSeriesNormalized(query, user?.id);
      case MediaTypeEnum.GAME:
        return (query: string) => searchGamesNormalized(query, user?.id);
      case MediaTypeEnum.BOOK:
        return (query: string) => searchBooksNormalized(query);
      case MediaTypeEnum.MUSIC:
        return (query: string) => searchMusicNormalized(query);
      default:
        return (query: string) => searchMoviesNormalized(query, user?.id);
    }
  }

  const { data, error, isFetching } = useQuery<MediaItem[]>({
    queryKey: ["media", watchedMediaType, searchName, user?.id],
    queryFn: () => getSearchFuntion(watchedMediaType)(searchName),
    enabled: searchName.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const { data: existingMedia } = useExistingMedia(data);

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

    dispatch(setLastSearchType(String(data.mediaType as unknown as string)));
    handleSearchParamsChange();
    setSearchName(params.searchFilter || "");
  }

  useEffect(() => {
    handleSearchParamsChange()
     
  }, [watchedMediaType]);

  if (trackedOptions.length === 0) {
    return <Navigate to="/media/home" replace />;
  }

  return (
    <div className="p-4">
      <PageHeader title={t("navigation.search", { ns: "common" })} />

      <div className="backdrop-blur-sm border-b mb-4">
        <Form {...form}>
          <form className='w-full flex flex-col gap-2 pb-3 sm:flex-row sm:items-end sm:gap-1' onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-1 items-end">
              <Select
                options={trackedOptions}
                name='mediaType'
                control={control}
                placeholder={t("searchForm.typePlaceholder")}
                label={t("searchForm.typeLabel")}
                width={140}
              />
              <ViewModeToggle
                value={viewMode}
                onChange={(mode) => dispatch(setViewMode(mode))}
                className="self-end"
              />
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
