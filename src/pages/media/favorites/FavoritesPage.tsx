import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ListItemSkeleton, ListItemsGrid } from "../listItems/ListItemsGrid";

import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { getFavorites, removeFromFavorites } from "@/querries/media/listItems";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaListItem } from "@/types/mediaList";
import { DEFAULT_STALE_TIME } from "@/utils/conts";

const FavoritesPage = () => {
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: t("label"), to: "/media/home" },
        { label: t("navigation.favorites", { ns: "common" }) },
      ])
    );
  }, [dispatch, t]);

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => getFavorites(user!.id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: (item: MediaListItem) => removeFromFavorites(item.id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success(t("feedback.favoriteRemoved"));
    },
    onError: (removeError: Error) => {
      toast.error(removeError.message || t("feedback.favoriteFailed"));
    },
  });

  return (
    <div className="w-full h-full space-y-3">
      <PageHeader title={t("list.favorites")} />

      <DataExhibition isLoading={isFetching && !data} isFetching={isFetching} skeleton={<ListItemSkeleton />} isError={isError} errorMessage={`${t("errorLoading", { ns: "common" })} ${error?.message ?? ""}`}>
        <ListItemsGrid
          items={data}
          emptyMessage={t("list.addFavorites")}
          onRemove={(item) => remove.mutate(item)}
          removeLabel={t("actions.removeFavorite")}
          isRemoving={remove.isPending}
        />
      </DataExhibition>
    </div>
  );
};

export default FavoritesPage;
