import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import { LibraryDataMediaType } from "./components/library";

import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { MediaCardSkeleton } from "@/components/tw/generic/mediaCardSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { MediaResponse } from "@/types/logged";
import { MediaTypeEnum } from "@/types/media";
import { DEFAULT_STALE_TIME } from "@/utils/conts";

const MediaListPage = () => {
  const { t } = useTranslation("media");
  const { type } = useParams<{ type: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const mediaType = type as MediaTypeEnum;
  const title = mediaType ? t(`typePlural.${mediaType}`) : "";

  const { data: data, isFetching } = useQuery<MediaResponse[]>({
    queryKey: ["media", "list", mediaType],
    queryFn: () =>
      getMediaList(user!.id, {
        type: mediaType,
      }),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  return (
    <div className="w-full h-full space-y-3">
      <h1 className="text-2xl font-bold">{title}</h1>

      <DataExhibition isFetching={isFetching} skeleton={<MediaCardSkeleton />}>
        <Tabs defaultValue="list" className="mt-4">
          <TabsList>
            <TabsTrigger value="list">{t("home.tabs.list")}</TabsTrigger>
            <TabsTrigger value="stats">{t("home.tabs.stats")}</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <LibraryDataMediaType data={data} />
          </TabsContent>

          <TabsContent value="stats" className="mt-4 space-y-6">
            {/* <StatusData data={data} />           */}
          </TabsContent>
        </Tabs>
      </DataExhibition>
    </div>
  );
};

export default MediaListPage;
