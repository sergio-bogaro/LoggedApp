import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { ListItemSkeleton, ListItemsGrid } from "../listItems/ListItemsGrid";

import { DataExhibition } from "@/components/tw/generic/dataExhibition";
import { getBacklog } from "@/querries/media/listItems";
import { useAppSelector } from "@/store/auth/hooks";
import { DEFAULT_STALE_TIME } from "@/utils/conts";

const BacklogPage = () => {
  const { t } = useTranslation("media");
  const { user } = useAppSelector((state) => state.auth);

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["backlog"],
    queryFn: () => getBacklog(user!.id),
    staleTime: DEFAULT_STALE_TIME,
    enabled: !!user,
  });

  return (
    <div className="w-full h-full space-y-3">
      <h1 className="text-2xl font-bold">{t("list.backlog")}</h1>

      <DataExhibition isFetching={isFetching} skeleton={<ListItemSkeleton />} isError={isError} errorMessage={`${t("errorLoading", { ns: "common" })} ${error?.message ?? ""}`}>
        <ListItemsGrid
          items={data}
          emptyMessage={t("list.addBacklog")}
        />
      </DataExhibition>
    </div>
  );
};

export default BacklogPage;
