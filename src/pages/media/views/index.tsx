import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "react-router";

import { PageHeader } from "@/components/tw/generic/PageHeader";
import MediaTypeFilter from "@/components/tw/media/MediaTypeFilter";
import MediaView from "@/components/tw/media/view";
import NotFoundPage from "@/pages/notFound";
import { getMediaList } from "@/querries/media/logged";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaResponse } from "@/types/logged";
import { MediaItem, MediaStatusEnum, MediaTypeEnum } from "@/types/media";
import { DEFAULT_STALE_TIME } from "@/utils/conts";
import { getTrackFlags } from "@/utils/mediaTrack";

const ALL_TYPES = Object.values(MediaTypeEnum);
const ALL_STATUSES = Object.values(MediaStatusEnum) as string[];

function parseTypes(raw: string): MediaTypeEnum[] {
  return raw
    .split(",")
    .filter((value): value is MediaTypeEnum => (ALL_TYPES as string[]).includes(value));
}

const MediaStatusViewPage = () => {
  const { t } = useTranslation(["media", "common"]);
  const { status } = useParams<{ status: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const mediaStatus = status && ALL_STATUSES.includes(status) ? (status as MediaStatusEnum) : null;

  const trackedTypes = useMemo(
    () => ALL_TYPES.filter((type) => getTrackFlags(user)[type]),
    [user]
  );
  const availableTypes = trackedTypes.length > 0 ? trackedTypes : ALL_TYPES;

  const rawTypes = searchParams.get("types");
  const selectedTypes = useMemo(() => {
    // Sem o parâmetro na URL, começa com os tipos que o usuário acompanha.
    if (rawTypes === null) return availableTypes;
    return parseTypes(rawTypes);
  }, [rawTypes, availableTypes]);

  useEffect(() => {
    if (!mediaStatus) return;
    dispatch(
      setBreadcrumbs([
        { label: t("label"), to: "/media/home" },
        { label: t(`status.${mediaStatus}`) },
      ])
    );
  }, [dispatch, t, mediaStatus]);

  const { data, isFetching, isError, error } = useQuery<MediaResponse[]>({
    queryKey: ["media", "statusView", mediaStatus, selectedTypes, user?.id],
    queryFn: () => getMediaList(user!.id, { status: mediaStatus!, types: selectedTypes }),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user && !!mediaStatus && selectedTypes.length > 0,
  });

  const items: MediaItem[] = useMemo(
    () =>
      (data ?? []).map((media) => ({
        id: media.externalId,
        title: media.title,
        type: media.type,
        coverUrl: media.coverUrl ?? "",
        year: media.releaseDate?.slice(0, 4),
        description: media.description,
      })),
    [data]
  );

  const existingMedia = useMemo(
    () =>
      Object.fromEntries(
        (data ?? []).map((media) => [`${media.externalId}:${media.type}`, media])
      ),
    [data]
  );

  const handleTypesChange = (types: MediaTypeEnum[]) => {
    const next = new URLSearchParams(searchParams);
    next.set("types", types.join(","));
    setSearchParams(next, { replace: true });
  };

  if (!mediaStatus) {
    return <NotFoundPage />;
  }

  const mediaData = selectedTypes.length === 0 ? [] : data ? items : undefined;

  return (
    <div className="w-full h-full space-y-4">
      <PageHeader title={t(`status.${mediaStatus}`)} />

      <div className="space-y-2">
        <p className="text-step-1 text-muted-foreground">{t("views.filterLabel")}</p>
        <MediaTypeFilter
          value={selectedTypes}
          onChange={handleTypesChange}
          availableTypes={availableTypes}
        />
      </div>

      <MediaView
        isLoading={isFetching && !data}
        error={isError ? (error as Error) : null}
        mediaData={mediaData}
        existingMedia={existingMedia}
        emptyTitle={t("views.empty")}
        emptyDescription={t("views.emptyHint")}
      />
    </div>
  );
};

export default MediaStatusViewPage;
