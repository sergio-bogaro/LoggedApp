import { useQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { ListItemSkeleton, ListItemsGrid } from "../listItems/ListItemsGrid";

import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { PageHeader } from "@/components/tw/generic/PageHeader";
import { Button } from "@/components/ui/button";
import { getBacklog } from "@/querries/media/listItems";
import { useAppSelector } from "@/store/auth/hooks";
import { useAppDispatch } from "@/store/settings/hooks";
import { setBreadcrumbs } from "@/store/settings/slice";
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
    queryKey: ["backlog"],
    queryFn: () => getBacklog(user!.id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title={t("list.backlog")}
        description={t("list.backlogDescription")}
      />

      <DataExhibition isLoading={isFetching && !data} isFetching={isFetching} skeleton={<ListItemSkeleton />} isError={isError} errorMessage={`${t("errorLoading", { ns: "common" })} ${error?.message ?? ""}`}>
        <ListItemsGrid
          items={data}
          emptyMessage={t("list.addBacklog")}
          emptyDescription={t("list.addBacklogHint")}
          emptyIcon={<Bookmark aria-hidden="true" className="size-4" />}
          emptyAction={
            <Button asChild size="sm">
              <Link to="/search">{t("navigation.search", { ns: "common" })}</Link>
            </Button>
          }
        />
      </DataExhibition>
    </div>
  );
};

export default BacklogPage;
