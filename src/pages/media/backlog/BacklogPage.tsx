import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ListItemSkeleton, ListItemsGrid } from "../listItems/ListItemsGrid";

import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { getBacklog, removeFromBacklog } from "@/querries/media/listItems";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
import { MediaListItem } from "@/types/mediaList";
import { DEFAULT_STALE_TIME } from "@/utils/conts";

const BacklogPage = () => {
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: t("label"), to: "/media/home" },
        { label: t("navigation.backlog", { ns: "common" }) },
      ])
    );
  }, [dispatch, t]);

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["backlog", user?.id],
    queryFn: () => getBacklog(user!.id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: (item: MediaListItem) => removeFromBacklog(item.id, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backlog"] });
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success(t("feedback.backlogRemoved"));
    },
    onError: (removeError: Error) => {
      toast.error(removeError.message || t("feedback.backlogFailed"));
    },
  });

  return (
    <div className="w-full h-full space-y-3">
      <PageHeader title={t("list.backlog")} />

      <DataExhibition isLoading={isFetching && !data} isFetching={isFetching} skeleton={<ListItemSkeleton />} isError={isError} errorMessage={`${t("errorLoading", { ns: "common" })} ${error?.message ?? ""}`}>
        <ListItemsGrid
          items={data}
          emptyMessage={t("list.addBacklog")}
          onRemove={(item) => remove.mutate(item)}
          removeLabel={t("actions.removeFromBacklog")}
          isRemoving={remove.isPending}
        />
      </DataExhibition>
    </div>
  );
};

export default BacklogPage;
